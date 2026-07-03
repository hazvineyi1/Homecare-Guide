import { Router } from "express";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, users, conversations, certificates } from "@workspace/db";
import { certificateCode } from "../lib/auth";
import { parseTitle } from "../lib/tutor-session";
import { TOPICS } from "./tutor/topics";

const router = Router();
const COURSE = "A Guide to Homecare: Caregiver Preparedness";

// The three modules and the topics each requires (all issue a Certificate of Completion).
const LEVELS = [
  { level: 1, credential: "Certificate of Completion", topicIds: [1, 2, 3, 5] },
  { level: 2, credential: "Certificate of Completion", topicIds: [4, 6, 7, 8, 9] },
  { level: 3, credential: "Certificate of Completion", topicIds: [10, 11, 12] },
];

async function masteredTopicIds(userId: string): Promise<Set<number>> {
  const rows = await db.select().from(conversations)
    .where(and(eq(conversations.ownerId, userId), eq(conversations.completed, true)));
  const ids = new Set<number>();
  for (const c of rows) {
    const { topicTitle } = parseTitle(c.title);
    const t = TOPICS.find((t) => t.title === topicTitle);
    if (t) ids.add(t.id);
  }
  return ids;
}

// Issue (or return) the credential for one completed level.
router.post("/certificate", async (req, res) => {
  if (!req.userId) { res.status(401).json({ error: "Please sign in to claim your credential." }); return; }
  const level = Number(req.body?.level);
  const lv = LEVELS.find((l) => l.level === level);
  if (!lv) { res.status(400).json({ error: "Invalid level." }); return; }
  const [u] = await db.select().from(users).where(eq(users.id, req.userId));
  if (!u) { res.status(401).json({ error: "Not signed in." }); return; }

  const mastered = await masteredTopicIds(req.userId);
  const done = lv.topicIds.filter((id) => mastered.has(id)).length;
  if (done < lv.topicIds.length) {
    res.status(400).json({ error: `Master all ${lv.topicIds.length} topics in this level first (${done}/${lv.topicIds.length}).` });
    return;
  }

  const [existing] = await db.select().from(certificates)
    .where(and(eq(certificates.userId, req.userId), eq(certificates.level, level)));
  if (existing) { res.json({ certificate: existing }); return; }

  const [cert] = await db.insert(certificates).values({
    id: randomUUID(), userId: req.userId, code: certificateCode(),
    learnerName: u.name, masteredCount: lv.topicIds.length, level, credential: lv.credential,
  }).returning();
  res.status(201).json({ certificate: cert });
});

// List the signed-in learner's earned credentials.
router.get("/certificates", async (req, res) => {
  if (!req.userId) { res.json({ certificates: [] }); return; }
  const rows = await db.select().from(certificates).where(eq(certificates.userId, req.userId));
  res.json({ certificates: rows });
});

// Public verification (no auth).
router.get("/verify/:code", async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
  if (!cert) { res.status(404).json({ valid: false }); return; }
  res.json({
    valid: true, code: cert.code, learnerName: cert.learnerName,
    course: COURSE, credential: cert.credential ?? "Certificate", level: cert.level,
    masteredCount: cert.masteredCount, issuedAt: cert.issuedAt,
  });
});

export default router;
