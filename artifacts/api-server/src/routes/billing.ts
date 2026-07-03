import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, entitlements, coupons, unlockEvents, appSettings, users } from "@workspace/db";
import type { Request } from "express";

const router = Router();

const PRICE = "P75";
const CURRENCY = "BWP";
const FREE_TOPIC_ID = 1;

// Accounts allowed to use the admin dashboard.
const ADMIN_EMAILS = ["hazvimusoni@gmail.com", "info@synops-consulting.com"];

const PAY_DEFAULTS = {
  recipient: "",
  name: "A Guide to Homecare",
  instructions:
    "Send P75 by Orange Money to the number shown above, then enter the code you receive below to unlock the full course. If you have paid but do not have a code, contact your course administrator.",
};

async function isAdmin(req: Request): Promise<boolean> {
  if (!req.userId) return false;
  const [u] = await db.select().from(users).where(eq(users.id, req.userId));
  return !!u && ADMIN_EMAILS.includes(u.email.toLowerCase());
}

async function hasFullAccess(ownerId: string): Promise<boolean> {
  const [e] = await db.select().from(entitlements).where(eq(entitlements.ownerId, ownerId));
  return !!e?.fullAccess;
}

async function getPayInfo() {
  const rows = await db.select().from(appSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    price: PRICE,
    currency: CURRENCY,
    method: "Orange Money",
    recipient: map["pay_recipient"] ?? PAY_DEFAULTS.recipient,
    name: map["pay_name"] ?? PAY_DEFAULTS.name,
    instructions: map["pay_instructions"] ?? PAY_DEFAULTS.instructions,
  };
}

// ---------- Learner-facing ----------

router.get("/access", async (req, res) => {
  res.json({ fullAccess: await hasFullAccess(req.ownerId), freeTopicId: FREE_TOPIC_ID });
});

router.get("/pay-info", async (_req, res) => {
  res.json(await getPayInfo());
});

router.post("/access/redeem", async (req, res) => {
  const raw = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!raw) { res.status(400).json({ error: "Please enter a code." }); return; }
  const code = raw.toUpperCase();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (!coupon || !coupon.active) { res.status(404).json({ error: "That code is not valid." }); return; }
  if (coupon.maxRedemptions != null && coupon.redemptions >= coupon.maxRedemptions) {
    res.status(409).json({ error: "That code has reached its redemption limit." });
    return;
  }
  await db.insert(entitlements)
    .values({ ownerId: req.ownerId, fullAccess: true, source: "coupon", couponCode: code })
    .onConflictDoUpdate({ target: entitlements.ownerId, set: { fullAccess: true, source: "coupon", couponCode: code } });
  await db.update(coupons).set({ redemptions: coupon.redemptions + 1 }).where(eq(coupons.code, code));
  await db.insert(unlockEvents).values({ ownerId: req.ownerId, method: "coupon", code });
  res.json({ ok: true, fullAccess: true });
});

// ---------- Admin ----------

router.get("/admin/overview", async (req, res) => {
  if (!(await isAdmin(req))) { res.status(403).json({ error: "Admins only." }); return; }
  const couponRows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  const events = await db.select().from(unlockEvents).orderBy(desc(unlockEvents.createdAt)).limit(100);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entitlements)
    .where(eq(entitlements.fullAccess, true));
  res.json({
    payInfo: await getPayInfo(),
    coupons: couponRows,
    unlocks: events,
    counts: { fullAccessOwners: row?.count ?? 0, coupons: couponRows.length, redemptions: events.length },
  });
});

router.post("/admin/coupons", async (req, res) => {
  if (!(await isAdmin(req))) { res.status(403).json({ error: "Admins only." }); return; }
  const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
  if (!code) { res.status(400).json({ error: "A code is required." }); return; }
  const percentOff = typeof req.body?.percentOff === "number" && Number.isFinite(req.body.percentOff)
    ? Math.max(0, Math.min(100, Math.round(req.body.percentOff))) : null;
  const maxRedemptions = typeof req.body?.maxRedemptions === "number" && Number.isFinite(req.body.maxRedemptions)
    ? Math.max(1, Math.round(req.body.maxRedemptions)) : null;
  const note = typeof req.body?.note === "string" ? req.body.note.slice(0, 200) : null;
  const [existing] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (existing) { res.status(409).json({ error: "A coupon with that code already exists." }); return; }
  const [c] = await db.insert(coupons).values({ code, percentOff, maxRedemptions, note, active: true }).returning();
  res.status(201).json({ coupon: c });
});

router.post("/admin/coupons/:code/toggle", async (req, res) => {
  if (!(await isAdmin(req))) { res.status(403).json({ error: "Admins only." }); return; }
  const code = String(req.params.code).toUpperCase();
  const [c] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (!c) { res.status(404).json({ error: "Coupon not found." }); return; }
  const [updated] = await db.update(coupons).set({ active: !c.active }).where(eq(coupons.code, code)).returning();
  res.json({ coupon: updated });
});

router.post("/admin/grant", async (req, res) => {
  if (!(await isAdmin(req))) { res.status(403).json({ error: "Admins only." }); return; }
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email) { res.status(400).json({ error: "An email is required." }); return; }
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u) { res.status(404).json({ error: "No account with that email. Ask them to sign up first." }); return; }
  await db.insert(entitlements)
    .values({ ownerId: u.id, fullAccess: true, source: "manual" })
    .onConflictDoUpdate({ target: entitlements.ownerId, set: { fullAccess: true, source: "manual" } });
  await db.insert(unlockEvents).values({ ownerId: u.id, method: "manual", note: `Granted to ${email}` });
  res.json({ ok: true });
});

router.post("/admin/pay-info", async (req, res) => {
  if (!(await isAdmin(req))) { res.status(403).json({ error: "Admins only." }); return; }
  const entries: Array<[string, string]> = [];
  if (typeof req.body?.recipient === "string") entries.push(["pay_recipient", req.body.recipient.slice(0, 120)]);
  if (typeof req.body?.name === "string") entries.push(["pay_name", req.body.name.slice(0, 120)]);
  if (typeof req.body?.instructions === "string") entries.push(["pay_instructions", req.body.instructions.slice(0, 500)]);
  for (const [key, value] of entries) {
    await db.insert(appSettings).values({ key, value }).onConflictDoUpdate({ target: appSettings.key, set: { value } });
  }
  res.json({ payInfo: await getPayInfo() });
});

export default router;
