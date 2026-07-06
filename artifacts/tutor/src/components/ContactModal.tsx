import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppState } from "@/hooks/use-app-state";
import { submitLead } from "@/lib/tutor-api";

const COPY: Record<string, { title: string; desc: string; placeholder: string; showOrg: boolean }> = {
  partnership: {
    title: "Talk to us about a partnership",
    desc: "Tell us about your organization and how you'd like to use the tutor. We'll reply by email.",
    placeholder: "e.g. We're a home-care agency with 40 caregivers and want seat licences and co-branded editions.",
    showOrg: true,
  },
  sponsored: {
    title: "Ask about sponsored access",
    desc: "Sponsored access is available through partner churches and community organisations. Tell us a little about your situation.",
    placeholder: "e.g. I'm caring for my mother and can't afford full access right now.",
    showOrg: false,
  },
  contact: {
    title: "Get in touch",
    desc: "Send us a message and we'll reply by email.",
    placeholder: "How can we help?",
    showOrg: false,
  },
  payment: {
    title: "Request payment options",
    desc: "Leave your email and we'll send you the ways to pay in your country and unlock full access. Works on any device, no app needed.",
    placeholder: "e.g. I'd like the monthly plan. I'm in Zimbabwe.",
    showOrg: false,
  },
};

export function ContactModal() {
  const { contactOpen, setContactOpen, contactKind, learnerName, currentUser, country } = useAppState();
  const copy = COPY[contactKind] ?? COPY.contact;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Prefill from the signed-in / guest identity each time the form opens.
  useEffect(() => {
    if (contactOpen) {
      setName(currentUser?.name || learnerName || "");
      setEmail(currentUser?.email || "");
      setOrg("");
      setMessage(
        contactKind === "payment"
          ? `I'd like to pay for full access to A Guide to Homecare${country ? ` (I'm in ${country})` : ""}. Please send me the payment options.`
          : "",
      );
    }
  }, [contactOpen, currentUser, learnerName, contactKind, country]);

  const send = async () => {
    if (!message.trim()) { toast.error("Please add a short message."); return; }
    if (!name.trim() && !email.trim()) { toast.error("Please add your name or an email so we can reply."); return; }
    setBusy(true);
    const res = await submitLead({ name, email, org, message, kind: contactKind });
    setBusy(false);
    if (res.ok) {
      toast.success("Thank you. Your message has been sent, and we'll be in touch.");
      setContactOpen(false);
    } else {
      toast.error(res.data?.error ?? "Could not send your message. Please try again.");
    }
  };

  return (
    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{copy.title}</DialogTitle>
          <DialogDescription>{copy.desc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Your name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
          </label>
          {copy.showOrg && (
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Organization</span>
              <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Your organization" className="mt-1.5" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={copy.placeholder}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <Button onClick={send} disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "Sending…" : "Send message"}
          </Button>
          <p className="text-xs text-muted-foreground">Your message goes straight to the A Guide to Homecare team.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
