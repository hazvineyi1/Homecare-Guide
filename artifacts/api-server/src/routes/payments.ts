import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, payments, entitlements, unlockEvents } from "@workspace/db";

// ---------------------------------------------------------------------------
// DPO Pay (DirectPay Online) integration.
//
// Flow: create a transaction token (createToken) -> redirect the learner to
// DPO's hosted payment page (they pick card / Orange Money / Airtel / etc.) ->
// DPO redirects back to /api/pay/callback -> we verify the token (verifyToken)
// and, if paid, grant full access. Card data never touches our server.
//
// INACTIVE until the operator adds their DPO merchant details as environment
// variables on the server (Railway):
//   DPO_COMPANY_TOKEN   the merchant Company Token from the DPO dashboard
//   DPO_SERVICE         the DPO Service Type ID for this product
//   DPO_AMOUNT          amount to charge (e.g. "75"); default "75"
//   DPO_CURRENCY        settlement currency (e.g. "BWP"); default "BWP"
//   PUBLIC_BASE_URL     public site URL for redirects; default the live domain
//   DPO_ENDPOINT        (optional) DPO API URL override
//   DPO_PAYMENT_URL     (optional) DPO hosted-page URL override
//
// Orange Money, Airtel Money and cards all appear as options on DPO's hosted
// page when they are enabled on the merchant's DPO account, so this one
// integration covers them. Until the vars are set, /pay/config reports
// disabled and the paywall keeps the manual form / WhatsApp options.
// ---------------------------------------------------------------------------

const COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN || "";
const SERVICE_TYPE = process.env.DPO_SERVICE || "";
const AMOUNT = process.env.DPO_AMOUNT || "75";
const CURRENCY = process.env.DPO_CURRENCY || "BWP";
const DPO_API = process.env.DPO_ENDPOINT || "https://secure.3gdirectpay.com/API/v6/";
const DPO_PAY_URL = process.env.DPO_PAYMENT_URL || "https://secure.3gdirectpay.com/payv2.php";
const BASE_URL = (process.env.PUBLIC_BASE_URL || "https://www.dorothymooka.com").replace(/\/$/, "");

const configured = () => !!(COMPANY_TOKEN && SERVICE_TYPE);

const router = Router();

const xmlTag = (xml: string, tag: string): string => {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
};

async function dpoPost(body: string): Promise<string> {
  const res = await fetch(DPO_API, { method: "POST", headers: { "Content-Type": "application/xml" }, body });
  return await res.text();
}

// Frontend asks whether online payment is live, and at what price.
router.get("/pay/config", (_req, res) => {
  res.json({ enabled: configured(), provider: "DPO Pay", amount: AMOUNT, currency: CURRENCY });
});

// Start a checkout: create a DPO token and return the hosted-page URL.
router.post("/pay/create", async (req, res) => {
  if (!configured()) { res.status(503).json({ error: "Online payment is not set up yet." }); return; }
  const owner = req.ownerId;
  const ref = `HG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const serviceDate = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${AMOUNT}</PaymentAmount>
    <PaymentCurrency>${CURRENCY}</PaymentCurrency>
    <CompanyRef>${ref}</CompanyRef>
    <RedirectURL>${BASE_URL}/api/pay/callback</RedirectURL>
    <BackURL>${BASE_URL}/?paid=cancel</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>30</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${SERVICE_TYPE}</ServiceType>
      <ServiceDescription>A Guide to Homecare - full course access</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  try {
    const resp = await dpoPost(xml);
    const result = xmlTag(resp, "Result");
    const transToken = xmlTag(resp, "TransToken");
    if (result !== "000" || !transToken) {
      console.error("DPO createToken failed:", result, xmlTag(resp, "ResultExplanation"));
      res.status(502).json({ error: "Could not start the payment. Please try again." });
      return;
    }
    await db.insert(payments).values({ ref, ownerId: owner, transToken, amount: AMOUNT, currency: CURRENCY, status: "created" });
    res.json({ url: `${DPO_PAY_URL}?ID=${encodeURIComponent(transToken)}`, ref });
  } catch (e) {
    console.error("DPO create error", e);
    res.status(502).json({ error: "Payment service is unavailable right now. Please try again." });
  }
});

// DPO redirects the learner here after payment. Verify and grant access.
router.get("/pay/callback", async (req, res) => {
  const token = String(req.query.TransactionToken || req.query.TransID || "");
  if (!token) { res.redirect(`${BASE_URL}/?paid=0`); return; }
  try {
    const verifyXml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${token}</TransactionToken>
</API3G>`;
    const resp = await dpoPost(verifyXml);
    const result = xmlTag(resp, "Result"); // "000" = paid
    const [pay] = await db.select().from(payments).where(eq(payments.transToken, token));

    if (result === "000" && pay) {
      await db.insert(entitlements)
        .values({ ownerId: pay.ownerId, fullAccess: true, source: "dpo" })
        .onConflictDoUpdate({ target: entitlements.ownerId, set: { fullAccess: true, source: "dpo" } });
      await db.update(payments).set({ status: "paid" }).where(eq(payments.transToken, token));
      await db.insert(unlockEvents).values({ ownerId: pay.ownerId, method: "dpo", code: pay.ref });
      res.redirect(`${BASE_URL}/?paid=1`);
      return;
    }
    if (pay) await db.update(payments).set({ status: "failed" }).where(eq(payments.transToken, token));
    res.redirect(`${BASE_URL}/?paid=0`);
  } catch (e) {
    console.error("DPO callback error", e);
    res.redirect(`${BASE_URL}/?paid=0`);
  }
});

export default router;
