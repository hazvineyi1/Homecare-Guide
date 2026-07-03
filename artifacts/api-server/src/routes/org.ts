import { Router } from "express";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db, users, conversations, organizations, orgMembers } from "@workspace/db";
import { parseTitle } from "../lib/tutor-session";
import { TOPICS } from "./tutor/topics";

const router = Router();
const MODULES = [
  { level: 1, topicIds: [1, 2, 3, 5] },
  { level: 2, topicIds: [4, 6, 7, 8, 9] },
  { level: 3, topicIds: [10, 11, 12] },
  { level: 4, topicIds: [13, 14, 15, 16, 17] },
];
const TOTAL = 17;

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

async function completedByOwner(ownerIds: string[]): Promise<Map<string, Set<number>>> {
  const map = new Map<string, Set<number>>();
  if (ownerIds.length === 0) return map;
  const rows = await db.select().from(conversations)
    .where(and(inArray(conversations.ownerId, ownerIds), eq(conversations.completed, true)));
  for (const c of rows) {
    const { topicTitle } = parseTitle(c.title);
    const t = TOPICS.find((x) => x.title === topicTitle);
    if (!t) continue;
    if (!map.has(c.ownerId)) map.set(c.ownerId, new Set());
    map.get(c.ownerId)!.add(t.id);
  }
  return map;
}

function moduleProgress(done: Set<number>) {
  return MODULES.map((m) => {
    const d = m.topicIds.filter((id) => done.has(id)).length;
    return { level: m.level, done: d, total: m.topicIds.length, complete: d === m.topicIds.length };
  });
}

// Create a team; the creator becomes its manager.
router.post("/org/create", async (req, res) => {
  if (!req.userId) { res.status(401).json({ error: "Please sign in." }); return; }
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) { res.status(400).json({ error: "A team name is required." }); return; }
  const id = randomUUID();
  let joinCode = genCode();
  try {
    await db.insert(organizations).values({ id, name, joinCode, createdBy: req.userId });
  } catch {
    joinCode = genCode() + "9";
    await db.insert(organizations).values({ id, name, joinCode, createdBy: req.userId });
  }
  await db.insert(orgMembers).values({ id: randomUUID(), orgId: id, userId: req.userId, role: "manager" });
  res.status(201).json({ ok: true, joinCode });
});

// Join a team as staff using its code.
router.post("/org/join", async (req, res) => {
  if (!req.userId) { res.status(401).json({ error: "Please sign in." }); return; }
  const code = String(req.body?.code ?? "").trim().toUpperCase();
  if (!code) { res.status(400).json({ error: "Enter a team code." }); return; }
  const [org] = await db.select().from(organizations).where(eq(organizations.joinCode, code));
  if (!org) { res.status(404).json({ error: "No team found with that code." }); return; }
  const [existing] = await db.select().from(orgMembers)
    .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.userId, req.userId)));
  if (!existing) {
    await db.insert(orgMembers).values({ id: randomUUID(), orgId: org.id, userId: req.userId, role: "staff" });
  }
  res.json({ ok: true, orgName: org.name });
});

// Teams the signed-in user belongs to. Manager teams include member progress.
router.get("/org/mine", async (req, res) => {
  if (!req.userId) { res.json({ orgs: [] }); return; }
  const myMemberships = await db.select().from(orgMembers).where(eq(orgMembers.userId, req.userId));
  const orgsOut: any[] = [];
  for (const mem of myMemberships) {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, mem.orgId));
    if (!org) continue;
    const base: any = { id: org.id, name: org.name, role: mem.role };
    if (mem.role === "manager") {
      base.joinCode = org.joinCode;
      const memRows = await db.select().from(orgMembers).where(eq(orgMembers.orgId, org.id));
      const userIds = memRows.map((m) => m.userId);
      const userRows = userIds.length ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
      const userById = new Map(userRows.map((u) => [u.id, u]));
      const completed = await completedByOwner(userIds);
      base.members = memRows.map((m) => {
        const u = userById.get(m.userId);
        const done = completed.get(m.userId) ?? new Set<number>();
        return {
          userId: m.userId,
          name: u?.name ?? "Unknown",
          email: u?.email ?? "",
          role: m.role,
          joinedAt: m.joinedAt,
          topicsCompleted: done.size,
          total: TOTAL,
          modules: moduleProgress(done),
        };
      }).sort((a, b) => (a.role === b.role ? 0 : a.role === "manager" ? -1 : 1) || a.name.localeCompare(b.name));
    }
    orgsOut.push(base);
  }
  res.json({ orgs: orgsOut });
});

export default router;
