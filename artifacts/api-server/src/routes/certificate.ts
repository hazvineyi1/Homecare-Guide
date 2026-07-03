import { Router } from "express";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, users, conversations, certificates } from "@workspace/db";
import { certificateCode } from "../lib/auth";
import { parseTitle } from "../lib/tutor-session";
import { TOPICS } from "./tutor/topics";

const router = Router();
const COURSE = "A Guide to Homecare — Caregiver Preparedness";

// Issue (or return) the learner's verifiable certificate once all topics are mastered.
router.post("/certificate", async (req, res) => {
  if (!req.userId) { res.status(401).json({ error: "Please sign in to claim your certificate." }); return; }
  const [u] = await db.select().from(users).where(eq(users.id, req.userId));
  if (!u) { res.status(401).json({ error: "Not signed in." }); return; }

  const rows = await db.select().from(conversations)
    .where(and(eq(conversations.ownerId, req.userId), eq(conversations.completed, true)));
  const mastered = new Set<string>();
  for (const c of rows) {
    const { topicTitle } = parseTitle(c.title);
    if (TOPICS.some((t) => t.title === topicTitle)) mastered.add(topicTitle);
  }
  if (mastered.size < TOPICS.length) {
    res.status(400).json({ error: `Master all ${TOPICS.length} topics first (${mastered.size}/${TOPICS.length}).` });
    return;
  }

  const [existing] = await db.select().from(certificates).where(eq(certificates.userId, req.userId));
  if (existing) { res.json({ certificate: existing }); return; }

  const [cert] = await db.insert(certificates)
    .values({ id: randomUUID(), userId: req.userId, code: certificateCode(), learnerName: u.name, masteredCount: mastered.size })
    .returning();
  res.status(201).json({ certificate: cert });
});

// Public verification — no auth. Anyone can confirm a certificate is genuine.
router.get("/verify/:code", async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
  if (!cert) { res.status(404).json({ valid: false }); return; }
  res.json({
    valid: true, code: cert.code, learnerName: cert.learnerName,
    course: COURSE, masteredCount: cert.masteredCount, issuedAt: cert.issuedAt,
  });
});

export default router;
