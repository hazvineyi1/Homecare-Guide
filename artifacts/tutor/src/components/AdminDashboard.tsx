import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppState } from "@/hooks/use-app-state";
import {
  fetchAdminOverview, adminCreateCoupon, adminToggleCoupon, adminGrant, adminSetPayInfo, adminToggleLead,
  type AdminOverview,
} from "@/lib/tutor-api";

export function AdminDashboard() {
  const { adminOpen, setAdminOpen } = useAppState();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMax, setCouponMax] = useState("");
  const [couponNote, setCouponNote] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [payRecipient, setPayRecipient] = useState("");
  const [payName, setPayName] = useState("");
  const [payWhats, setPayWhats] = useState("");
  const [payInstr, setPayInstr] = useState("");

  const load = async () => {
    setLoading(true);
    const d = await fetchAdminOverview();
    setLoading(false);
    setData(d);
    if (d) { setPayRecipient(d.payInfo.recipient); setPayName(d.payInfo.name); setPayWhats(d.payInfo.whatsapp); setPayInstr(d.payInfo.instructions); }
  };
  useEffect(() => { if (adminOpen) load(); }, [adminOpen]);

  const createCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await adminCreateCoupon({
      code: couponCode.trim(),
      maxRedemptions: couponMax ? Number(couponMax) : undefined,
      note: couponNote || undefined,
    });
    if (res.ok) { toast.success("Coupon created."); setCouponCode(""); setCouponMax(""); setCouponNote(""); load(); }
    else toast.error(res.data?.error ?? "Could not create coupon.");
  };
  const toggle = async (code: string) => {
    const res = await adminToggleCoupon(code);
    if (res.ok) load(); else toast.error(res.data?.error ?? "Failed.");
  };
  const grant = async () => {
    if (!grantEmail.trim()) return;
    const res = await adminGrant(grantEmail.trim());
    if (res.ok) { toast.success("Access granted."); setGrantEmail(""); load(); }
    else toast.error(res.data?.error ?? "Failed.");
  };
  const savePay = async () => {
    const res = await adminSetPayInfo({ recipient: payRecipient, name: payName, whatsapp: payWhats, instructions: payInstr });
    if (res.ok) { toast.success("Payment details saved."); load(); }
    else toast.error(res.data?.error ?? "Failed.");
  };
  const toggleLead = async (id: number) => {
    const res = await adminToggleLead(id);
    if (res.ok) load(); else toast.error(res.data?.error ?? "Failed.");
  };

  return (
    <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Admin dashboard</DialogTitle>
          <DialogDescription>Collect payments, create coupons and discounts, and grant access.</DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([["New messages", data.counts.newMessages], ["Unlocked learners", data.counts.fullAccessOwners], ["Coupons", data.counts.coupons], ["Recent unlocks", data.counts.redemptions]] as Array<[string, number]>).map(([label, val]) => (
                <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
                  <div className="font-serif text-2xl text-foreground">{val}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Messages from the site</h3>
              <div className="divide-y divide-border rounded-lg border border-border max-h-72 overflow-y-auto">
                {data.leads.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No messages yet.</div>}
                {data.leads.map((l) => (
                  <div key={l.id} className={"px-3 py-2.5 text-sm" + (l.handled ? " opacity-60" : "")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground">{l.name || "Someone"}</span>
                        {l.email && <span className="text-muted-foreground"> &middot; {l.email}</span>}
                        {l.org && <span className="text-muted-foreground"> &middot; {l.org}</span>}
                      </div>
                      <button onClick={() => toggleLead(l.id)} className="shrink-0 text-xs font-semibold text-primary hover:underline">
                        {l.handled ? "Done" : "Mark done"}
                      </button>
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">{l.kind}</div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{l.message}</p>
                    <div className="mt-1 text-[11px] text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Orange Money payment details (shown on the paywall)</h3>
              <div className="space-y-2">
                <Input value={payRecipient} onChange={(e) => setPayRecipient(e.target.value)} placeholder="Orange Money number, e.g. 7X XXX XXX" />
                <Input value={payName} onChange={(e) => setPayName(e.target.value)} placeholder="Account name" />
                <Input value={payWhats} onChange={(e) => setPayWhats(e.target.value)} placeholder="WhatsApp number (international, e.g. 267 7X XXX XXX)" />
                <p className="text-xs text-muted-foreground">The WhatsApp number powers the chat, partnership and 'pay on WhatsApp' buttons across the site. Leave blank to hide them.</p>
                <textarea
                  value={payInstr}
                  onChange={(e) => setPayInstr(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Instructions for the learner"
                />
                <Button size="sm" onClick={savePay} className="bg-primary text-primary-foreground hover:bg-primary/90">Save payment details</Button>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Create an unlock code / coupon</h3>
              <div className="flex flex-wrap gap-2">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="CODE e.g. HOMECARE75" className="flex-1 min-w-[140px]" />
                <Input value={couponMax} onChange={(e) => setCouponMax(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Max uses (blank = unlimited)" className="w-44" />
                <Button size="sm" onClick={createCoupon} className="bg-primary text-primary-foreground hover:bg-primary/90">Create</Button>
              </div>
              <Input value={couponNote} onChange={(e) => setCouponNote(e.target.value)} placeholder="Note (optional)" className="mt-2" />
              <div className="mt-3 divide-y divide-border rounded-lg border border-border">
                {data.coupons.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No coupons yet.</div>}
                {data.coupons.map((c) => (
                  <div key={c.code} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <span className="font-mono font-semibold text-foreground">{c.code}</span>
                      <span className="text-muted-foreground"> &middot; {c.redemptions}{c.maxRedemptions ? `/${c.maxRedemptions}` : ""} used{c.note ? ` · ${c.note}` : ""}</span>
                    </div>
                    <button onClick={() => toggle(c.code)} className={c.active ? "shrink-0 text-xs font-semibold text-accent hover:underline" : "shrink-0 text-xs font-semibold text-muted-foreground hover:underline"}>
                      {c.active ? "Active" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Grant access manually (by account email)</h3>
              <div className="flex gap-2">
                <Input value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="learner@email.com" type="email" className="flex-1" />
                <Button size="sm" onClick={grant} className="bg-primary text-primary-foreground hover:bg-primary/90">Grant</Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">The learner must have created an account first.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Recent unlocks</h3>
              <div className="divide-y divide-border rounded-lg border border-border max-h-48 overflow-y-auto">
                {data.unlocks.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No unlocks yet.</div>}
                {data.unlocks.map((u) => (
                  <div key={u.id} className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleString()} &middot; {u.method}{u.code ? ` · ${u.code}` : ""}{u.note ? ` · ${u.note}` : ""}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
