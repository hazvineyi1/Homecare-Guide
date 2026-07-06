import { Router } from "express";
import { db, leads } from "@workspace/db";

// Public endpoint for the site's contact / partnership form. Submissions land in
// the `leads` table and are shown to admins in the dashboard ("Messages").
const router = Router();

const str = (v: unknown, n: number): string =>
  typeof v === "string" ? v.trim().slice(0, n) : "";

router.post("/leads", async (req, res) => {
  const name = str(req.body?.name, 120);
  const email = str(req.body?.email, 160);
  const org = str(req.body?.org, 160);
  const message = str(req.body?.message, 2000);
  const kindRaw = str(req.body?.kind, 40);
  const kind = ["partnership", "sponsored", "contact", "payment"].includes(kindRaw) ? kindRaw : "contact";

  if (!name && !email) {
    res.status(400).json({ error: "Please add your name or an email so we can reply." });
    return;
  }
  if (!message) {
    res.status(400).json({ error: "Please add a short message." });
    return;
  }

  await db.insert(leads).values({
    ownerId: req.ownerId ?? null,
    kind,
    name: name || null,
    email: email || null,
    org: org || null,
    message,
  });

  res.status(201).json({ ok: true });
});

export default router;
