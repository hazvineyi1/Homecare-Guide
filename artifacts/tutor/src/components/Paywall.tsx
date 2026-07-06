import React, { useEffect, useState } from "react";
import { Lock, ArrowLeft, Menu, MessageCircle, Home } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchPayInfo, redeemCoupon, type PayInfo } from "@/lib/tutor-api";
import { moneyFor, priceLabel } from "@/lib/pricing";
import { paymentMethodFor } from "@/lib/payments";
import { chatUrl, payHelpMsg } from "@/lib/whatsapp";

// Shown when a locked topic is opened. Topic 1 is free; the rest need full
// access, bought for the price shown via Orange Money, then unlocked with a
// code (or granted by an admin). No card or money is handled in-app.
export function Paywall() {
  const { setFullAccess, setCurrentTopicIndex, currentUser, setAuthOpen, setMobileSidebarOpen, setAtLanding, country, setContactOpen, setContactKind } = useAppState();
  const [pay, setPay] = useState<PayInfo | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchPayInfo().then(setPay).catch(() => {}); }, []);

  const redeem = async () => {
    setError(null);
    if (!code.trim()) { setError("Enter the code you received."); return; }
    setBusy(true);
    const res = await redeemCoupon(code.trim());
    setBusy(false);
    if (res.ok) {
      setFullAccess(true);
      toast.success("Unlocked. You now have the full course.");
    } else {
      setError(res.data?.error ?? "Could not redeem that code.");
    }
  };

  // The price is shown in the currency of the learner's chosen country, and the
  // payment method reflects how people usually pay there (Orange Money in
  // Botswana, EcoCash in Zimbabwe, M-Pesa in Kenya, card/Apple Pay/Google Pay
  // elsewhere, etc.).
  const money = moneyFor(country);
  const price = `${priceLabel(money, "month")}/month`;
  const method = paymentMethodFor(country);
  const instructions = pay?.instructions?.trim()
    ? pay.instructions
    : `Pay ${price} by ${method}, then enter the unlock code you receive below to open the full course. If you have paid but do not have a code, contact us.`;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-7">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentTopicIndex(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to roadmap
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAtLanding(true); setCurrentTopicIndex(null); }}
              title="Back to the homepage"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <Menu className="w-4 h-4" /> Menu
            </button>
          </div>
        </div>

        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-2 leading-tight">Unlock the full course</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Topic 1 is free to try. To continue with the rest of the {""}
          course and earn your certificates with Nurse Mooka, unlock full access for{" "}
          <b className="text-foreground">{price}</b>.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 mb-5">
          <div className="text-xs font-bold uppercase tracking-wide text-primary mb-2">How to pay</div>
          <div className="font-serif text-2xl text-foreground mb-2">{price}</div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Tell us where you are and we'll send you the ways to pay, then unlock your full access.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => { setContactKind("payment"); setContactOpen(true); }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Request payment options
            </Button>
            <Button
              onClick={() => window.open(chatUrl(pay?.whatsapp, payHelpMsg(country)), "_blank", "noopener,noreferrer")}
              className="w-full text-white hover:brightness-105"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Or message us on WhatsApp
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            &ldquo;Request payment options&rdquo; works on any device (no app needed). Prefer email? <a href="mailto:info@synops-consulting.com" className="text-primary font-semibold hover:underline">info@synops-consulting.com</a>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Have a code?</div>
          <p className="text-sm text-muted-foreground mb-3">Enter your unlock or coupon code for instant access.</p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") redeem(); }}
              placeholder="e.g. HOMECARE75"
            />
            <Button onClick={redeem} disabled={busy} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? "…" : "Unlock"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {!currentUser && (
            <p className="mt-3 text-xs text-muted-foreground">
              Tip:{" "}
              <button onClick={() => setAuthOpen(true)} className="text-primary font-semibold hover:underline">
                create a free account
              </button>{" "}
              first so your access is saved across devices.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
