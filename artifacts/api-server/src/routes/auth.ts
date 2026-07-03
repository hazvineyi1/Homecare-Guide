import { Router } from "express";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, users, conversations } from "@workspace/db";
import {
  hashPassword, verifyPassword, isValidEmail, SESSION_COOKIE, sessionCookieOptions,
} from "../lib/auth";
import { OWNER_COOKIE } from "../middlewares/owner";
import type { Request, Response } from "express";

const router = Router();

const publicUser = (u: { id: string; email: string; name: string }) => ({
  id: u.id, email: u.email, name: u.name,
});

// When a guest signs up / logs in, move their taster progress into the account.
async function claimGuest(req: Request, res: Response, userId: string) {
  const guest = req.signedCookies?.[OWNER_COOKIE];
  if (typeof guest === "string" && guest && guest !== userId) {
    await db.update(conversations).set({ ownerId: userId }).where(eq(conversations.ownerId, guest));
    res.clearCookie(OWNER_COOKIE, { path: "/" });
  }
}

router.post("/auth/signup", async (req, res) => {
  const { email, name, password } = req.body ?? {};
  if (typeof email !== "string" || !isValidEmail(email)) { res.status(400).json({ error: "A valid email is required." }); return; }
  if (typeof name !== "string" || name.trim().length < 1) { res.status(400).json({ error: "Your name is required." }); return; }
  if (typeof password !== "string" || password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters." }); return; }
  const emailLc = email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, emailLc));
  if (existing) { res.status(409).json({ error: "An account with this email already exists. Try logging in." }); return; }
  const id = randomUUID();
  const [u] = await db.insert(users).values({ id, email: emailLc, name: name.trim(), passwordHash: hashPassword(password) }).returning();
  await claimGuest(req, res, id);
  res.cookie(SESSION_COOKIE, id, sessionCookieOptions);
  res.status(201).json({ user: publicUser(u) });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") { res.status(400).json({ error: "Email and password are required." }); return; }
  const [u] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
  if (!u || !verifyPassword(password, u.passwordHash)) { res.status(401).json({ error: "Incorrect email or password." }); return; }
  await claimGuest(req, res, u.id);
  res.cookie(SESSION_COOKIE, u.id, sessionCookieOptions);
  res.json({ user: publicUser(u) });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  if (!req.userId) { res.json({ user: null }); return; }
  const [u] = await db.select().from(users).where(eq(users.id, req.userId));
  res.json({ user: u ? publicUser(u) : null });
});

// Let a signed-in learner change their own password (requires the current one).
// A self-service email reset needs email infrastructure, which is a later phase.
router.post("/auth/change-password", async (req, res) => {
  if (!req.userId) { res.status(401).json({ error: "You must be logged in to change your password." }); return; }
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ error: "Current and new password are required." }); return;
  }
  if (newPassword.length < 8) { res.status(400).json({ error: "New password must be at least 8 characters." }); return; }
  const [u] = await db.select().from(users).where(eq(users.id, req.userId));
  if (!u || !verifyPassword(currentPassword, u.passwordHash)) {
    res.status(401).json({ error: "Your current password is incorrect." }); return;
  }
  await db.update(users).set({ passwordHash: hashPassword(newPassword) }).where(eq(users.id, u.id));
  res.json({ ok: true });
});

export default router;
