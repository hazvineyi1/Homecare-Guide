import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, attempts } from "@workspace/db";

// Clear the current owner's learning progress (conversations, their messages via
// cascade, and quiz attempts) so they can start over from the very beginning.
// Deliberately does NOT touch the user account or any purchased entitlement.
const router = Router();

router.post("/reset", async (req, res) => {
  const owner = req.ownerId;
  await db.delete(conversations).where(eq(conversations.ownerId, owner));
  await db.delete(attempts).where(eq(attempts.ownerId, owner));
  res.json({ ok: true });
});

export default router;
