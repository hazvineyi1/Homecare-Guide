import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { anthropic, DEFAULT_MODEL } from "@workspace/integrations-anthropic-ai";
import { buildSystemPrompt } from "./tutor/index";
import { TOPICS } from "./tutor/topics";

// ---------------------------------------------------------------------------
// WhatsApp Cloud API webhook (SCAFFOLD).
//
// Lets learners chat with Nurse Mooka directly inside WhatsApp, reusing the same
// grounded Socratic prompt as the web tutor. It stays INACTIVE until the
// operator connects their own Meta WhatsApp Business number by setting these
// environment variables on the server (Railway):
//
//   WHATSAPP_VERIFY_TOKEN     any secret string; also entered as the "Verify
//                             token" when subscribing the webhook in Meta
//   WHATSAPP_TOKEN            WhatsApp Cloud API access token (sent as Bearer)
//   WHATSAPP_PHONE_NUMBER_ID  the Phone Number ID from the Meta dashboard
//   WHATSAPP_GRAPH_VERSION    (optional) Graph API version, default v20.0
//
// Webhook URL to register in Meta:  https://<your-domain>/api/webhooks/whatsapp
// Until WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set, inbound messages are
// acknowledged with 200 but no reply is sent, so production is unaffected.
// (Hardening TODO once live: verify the X-Hub-Signature-256 header with the app
// secret, and rate-limit per sender.)
// ---------------------------------------------------------------------------

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const WA_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

// The WhatsApp channel is a free taster: it teaches the free topic (Topic 1).
const WA_TOPIC_ID = 1;
const WA_LEVEL = "new";
const HISTORY_WINDOW = 20;

const router = Router();

const ownerFor = (waId: string) => `wa:${waId}`;

async function generateReply(convId: number): Promise<string> {
  const existing = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  const turns = existing
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const windowed = turns.slice(-HISTORY_WINDOW);
  while (windowed.length && windowed[0].role !== "user") windowed.shift();
  const chatMessages = windowed.length ? windowed : turns.slice(-1);

  const systemPrompt = buildSystemPrompt(WA_TOPIC_ID, WA_LEVEL);
  const resp = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: chatMessages,
  });
  const text = (resp.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text?: string }) => b.text ?? "")
    .join("")
    .trim();
  return text || "Sorry, I could not think of a reply just now. Please send your message again.";
}

async function startSession(ownerId: string): Promise<string> {
  const topic = TOPICS.find((t) => t.id === WA_TOPIC_ID)!;
  const [conv] = await db
    .insert(conversations)
    .values({ title: `${topic.title} · New caregiver`, ownerId })
    .returning();
  await db.insert(messages).values({ conversationId: conv.id, role: "user", content: "[BEGIN SESSION]" });
  const reply = await generateReply(conv.id);
  await db.insert(messages).values({ conversationId: conv.id, role: "assistant", content: reply });
  return reply;
}

async function handleInbound(waId: string, text: string): Promise<string> {
  const ownerId = ownerFor(waId);
  const cmd = text.trim().toLowerCase();

  // "restart"/"reset" wipes the WhatsApp session so the learner starts fresh.
  if (["restart", "reset", "start over"].includes(cmd)) {
    await db.delete(conversations).where(eq(conversations.ownerId, ownerId));
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.ownerId, ownerId))
    .orderBy(desc(conversations.createdAt))
    .limit(1);

  if (!conv) return startSession(ownerId);

  await db.insert(messages).values({ conversationId: conv.id, role: "user", content: text.slice(0, 2000) });
  const reply = await generateReply(conv.id);
  await db.insert(messages).values({ conversationId: conv.id, role: "assistant", content: reply });
  return reply;
}

async function sendWhatsApp(to: string, body: string): Promise<void> {
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: body.slice(0, 4096) },
    }),
  });
  if (!res.ok) console.error("WhatsApp send failed", res.status, await res.text().catch(() => ""));
}

// Meta webhook verification handshake (GET).
router.get("/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    res.status(200).send(String(challenge ?? ""));
    return;
  }
  res.sendStatus(403);
});

// Inbound messages + delivery-status callbacks (POST).
router.post("/webhooks/whatsapp", async (req, res) => {
  res.sendStatus(200); // Meta requires a fast 200; process after acknowledging.
  if (!WA_TOKEN || !PHONE_ID) return; // inactive until configured
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg || msg.type !== "text") return; // ignore non-text / status events
    const from: string = msg.from;
    const text: string = msg.text?.body ?? "";
    if (!from || !text.trim()) return;
    const reply = await handleInbound(from, text);
    await sendWhatsApp(from, reply);
  } catch (e) {
    console.error("WhatsApp webhook error", e);
  }
});

export default router;
