import React, { useEffect, useState } from "react";
import { Lock, ArrowLeft, Menu } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchPayInfo, redeemCoupon, type PayInfo } from "@/lib/tutor-api";
import { moneyFor, priceLabel } from "@/lib/pricing";

// Shown when a locked topic is opened. Topic 1 is free; the rest need full
// access, bought for the price shown via Orange Money, then unlocked with a
// code (or granted by an admin). No card or money is handled in-app.
export function Paywall() {
  const { setFullAccess, setCurrentTopicIndex, currentUser, setAuthOpen, setMobileSidebarOpen, country } = useAppState();
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

  // The price is shown in the currency of the learner's chosen country.
  const money = moneyFor(country);
  const price = `${priceLabel(money, "month")}/month`;

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
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <Menu className="w-4 h-4" /> Menu
          </button>
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
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-serif text-2xl text-foreground">{price}</span>
            <span className="text-sm font-semibold text-foreground">{pay?.method ?? "Orange Money"}</span>
          </div>
          {pay?.recipient ? (
            <div className="rounded-lg bg-secondary/60 px-3 py-2 mb-3">
              <div className="text-xs text-muted-foreground">Pay to</div>
              <div className="text-base font-semibold text-foreground">{pay.recipient}</div>
              {pay.name && <div className="text-xs text-muted-foreground">{pay.name}</div>}
            </div>
          ) : (
            <div className="rounded-lg bg-secondary/60 px-3 py-2 mb-3 text-sm text-muted-foreground">
              The Orange Money payment number will appear here once the course administrator sets it.
            </div>
          )}
          {pay?.instructions && <p className="text-sm text-muted-foreground leading-relaxed">{pay.instructions}</p>}
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
