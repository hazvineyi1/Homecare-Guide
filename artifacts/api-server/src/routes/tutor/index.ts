import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  CreateTutorSessionBody,
  SendTutorMessageBody,
  SendTutorMessageParams,
  GetTutorSessionParams,
} from "@workspace/api-zod";
import { anthropic, DEFAULT_MODEL } from "@workspace/integrations-anthropic-ai";
import { aiRateLimiter } from "../../middlewares/rate-limit";
import {
  countExchanges,
  parseTitle,
  visibleMessages,
} from "../../lib/tutor-session";
import { TOPICS } from "./topics";

const router = Router();

function buildSystemPrompt(topicId: number, level: string): string {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) throw new Error(`Topic ${topicId} not found`);

  const levelNote =
    level === "new"
      ? "The learner is a NEW family caregiver. Start from concrete, everyday reasoning. Keep vocabulary plain, define any term you must use, and scaffold generously."
      : "The learner is an EXPERIENCED caregiver. You may move faster, probe edge cases, challenge assumptions harder, and ask them to justify trade-offs and prioritisation.";

  return `You are Nurse Mooka, a warm, experienced home-care nurse who teaches family caregiving through the Socratic method (guiding questions, never lecturing). Your knowledge base is the chapter content below, adapted from "A Guide to Homecare" by Dorothy Mooka. Stay grounded in this content; do not invent medical guidance beyond it. If asked about something outside the chapter, briefly say it is beyond this topic and steer back with a question.

TOPIC: ${topic.title}

CHAPTER CONTENT (your ground truth):
${topic.kb}

LEARNER PROFILE: ${levelNote}

YOUR SOCRATIC METHOD (follow strictly):
1. NEVER lecture. Teach only through questions, brief acknowledgements, and realistic home-care scenarios.
2. Ask exactly ONE question per turn. Keep each turn to 2-5 short sentences total.
3. Open the session with a vivid, concrete scenario (2-3 sentences) drawn from the chapter, then one focused opening question. A good seed scenario for this topic: ${topic.launch}.
4. Use elenchus: when the learner states a belief, test it. Ask what would follow if it were true, or pose a counterexample from home care.
5. Use maieutics: when the learner is close, ask the question that lets them articulate the principle themselves. Then name the principle in ONE sentence at most, crediting their reasoning.
6. When the learner is wrong, do not correct directly. Ask a question that exposes the gap. If they remain stuck after two attempts, give a graduated hint: first a nudge, then a narrower question, and only then a partial answer framed as a question.
7. Vary question types across the dialogue: clarification, probing assumptions, probing evidence, viewpoint shifts (the care recipient's perspective, the doctor's, a sibling's), implications and consequences.
8. Periodically (roughly every 4-5 exchanges) ask the learner to apply what they have reasoned to a NEW mini-scenario, escalating complexity.
9. Warm, respectful, encouraging tone. Never condescending. Celebrate good reasoning specifically, not generically.
10. SAFETY OVERRIDE: if the learner proposes something that could harm a care recipient (e.g. forcing food, dragging rather than lifting, skipping hand hygiene, ignoring red-flag symptoms like blood in sputum or trouble breathing, wrong direction perineal cleaning), correct it clearly and immediately in one sentence, state the safe practice from the chapter, THEN resume questioning.
11. When you receive a message beginning [HINT], give one graduated hint for your last question without revealing the full answer, then re-ask it more narrowly.
12. When you receive a message beginning [SIMPLIFY], break your last question into a smaller, easier first step.
13. When you receive a message beginning [SYNTHESIS], stop questioning for one turn and produce a formative assessment: (a) concepts the learner has demonstrably reasoned through, citing their own words; (b) gaps or misconceptions still open; (c) one recommended focus next. Maximum 160 words. Then invite them to continue with one question.
14. When you receive [BEGIN SESSION], greet the learner warmly in one sentence, introduce yourself as Nurse Mooka, and then start per rule 3. Refer to yourself as Nurse Mooka whenever you name yourself.`;
}

// List the signed-in owner's tutor sessions so the client can rehydrate the
// sidebar and resume topics after a page reload. Only conversations whose title
// maps to a known topic are returned (excludes non-tutor conversations).
router.get("/tutor/sessions", async (req, res) => {
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.ownerId, req.ownerId))
    .orderBy(conversations.createdAt);

  const sessions = [];
  for (const conv of rows) {
    const { topicTitle, level } = parseTitle(conv.title);
    const topic = TOPICS.find((t) => t.title === topicTitle);
    if (!topic) continue; // not a tutor session

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conv.id));

    sessions.push({
      conversationId: conv.id,
      topicId: topic.id,
      topicTitle,
      level,
      exchangeCount: countExchanges(msgs),
      messageCount: msgs.length,
      completed: conv.completed,
      completedAt: conv.completedAt,
      createdAt: conv.createdAt,
    });
  }

  res.json({ sessions });
});

router.post("/tutor/sessions", aiRateLimiter, async (req, res) => {
  const parsed = CreateTutorSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { topicId, level } = parsed.data;
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) {
    res.status(400).json({ error: `Topic ${topicId} not found` });
    return;
  }
  const title = `${topic.title} — ${level === "new" ? "New caregiver" : "Experienced"}`;
  const [conv] = await db
    .insert(conversations)
    .values({ title, ownerId: req.ownerId })
    .returning();

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "user",
    content: "[BEGIN SESSION]",
  });

  res.status(201).json({
    conversationId: conv.id,
    topicId,
    topicTitle: topic.title,
    level,
  });
});

router.post("/tutor/sessions/:conversationId/message", aiRateLimiter, async (req, res) => {
  const paramsParsed = SendTutorMessageParams.safeParse({ conversationId: Number(req.params.conversationId) });
  const bodyParsed = SendTutorMessageBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const convId = paramsParsed.data.conversationId;
  const { content, messageType } = bodyParsed.data;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, convId), eq(conversations.ownerId, req.ownerId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const { topicTitle, level } = parseTitle(conv.title);
  const topic = TOPICS.find((t) => t.title === topicTitle);
  if (!topic) {
    res.status(400).json({ error: "Could not determine topic from conversation" });
    return;
  }

  const userContent =
    messageType === "hint"
      ? `[HINT] ${content}`
      : messageType === "stuck"
        ? `[SIMPLIFY] ${content}`
        : messageType === "synthesis"
          ? `[SYNTHESIS] ${content}`
          : content;

  if (content !== "[BEGIN SESSION]") {
    await db.insert(messages).values({ conversationId: convId, role: "user", content: userContent });
  }

  const existingMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  const systemPrompt = buildSystemPrompt(topic.id, level);

  // Cost/latency control: the system prompt (chapter content + Socratic rules) is
  // static per topic, so cache it; and bound the transcript we resend to a rolling
  // window instead of the whole (unbounded, quadratic-cost) history. The window is
  // trimmed to start on a user turn so the Messages API stays valid.
  const HISTORY_WINDOW = 20;
  const allTurns = existingMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const windowed = allTurns.slice(-HISTORY_WINDOW);
  while (windowed.length && windowed[0].role !== "user") windowed.shift();
  const chatMessages = windowed.length ? windowed : allTurns.slice(-1);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: chatMessages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
    }
  }

  await db.insert(messages).values({ conversationId: convId, role: "assistant", content: fullResponse });
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// Mark a topic as mastered (locks in the completion state, celebrated in the UI).
router.post("/tutor/sessions/:conversationId/complete", async (req, res) => {
  const parsed = GetTutorSessionParams.safeParse({ conversationId: Number(req.params.conversationId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid conversationId" });
    return;
  }
  const [updated] = await db
    .update(conversations)
    .set({ completed: true, completedAt: new Date() })
    .where(
      and(
        eq(conversations.id, parsed.data.conversationId),
        eq(conversations.ownerId, req.ownerId),
      ),
    )
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json({
    conversationId: updated.id,
    completed: updated.completed,
    completedAt: updated.completedAt,
  });
});

router.get("/tutor/sessions/:conversationId", async (req, res) => {
  const parsed = GetTutorSessionParams.safeParse({ conversationId: Number(req.params.conversationId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid conversationId" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, parsed.data.conversationId), eq(conversations.ownerId, req.ownerId)),
    );
  if (!conv) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const { topicTitle, level } = parseTitle(conv.title);
  const topic = TOPICS.find((t) => t.title === topicTitle);

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, parsed.data.conversationId))
    .orderBy(messages.createdAt);

  res.json({
    conversationId: conv.id,
    topicId: topic?.id ?? 0,
    topicTitle,
    level,
    completed: conv.completed,
    completedAt: conv.completedAt,
    exchangeCount: countExchanges(msgs),
    messages: visibleMessages(msgs).map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
