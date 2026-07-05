import React from "react";
import { shareUrl, SHARE_COURSE } from "@/lib/whatsapp";
import { useAppState } from "@/hooks/use-app-state";

export function Footer() {
  const { setContactOpen, setContactKind } = useAppState();
  const openContact = () => { setContactKind("contact"); setContactOpen(true); };
  return (
    <footer className="border-t border-border mt-6">
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-muted-foreground">
        <p className="mb-3 leading-relaxed max-w-3xl">
          Based on the book <em className="text-foreground not-italic font-medium">A Guide to Homecare</em> by{" "}
          <b className="text-foreground">Dr Dorothy Mooka</b>. This course is a preparation and reference guide, not a
          licensed or government-accredited qualification, and not a substitute for professional medical training or advice.
          In an emergency, contact professional medical help.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href="/topics" className="hover:text-foreground hover:underline">All topics</a>
          <span aria-hidden>&middot;</span>
          <a href="/privacy" className="hover:text-foreground hover:underline">Privacy</a>
          <span aria-hidden>&middot;</span>
          <a href="/terms" className="hover:text-foreground hover:underline">Terms</a>
          <span aria-hidden>&middot;</span>
          <button onClick={openContact} className="hover:text-foreground hover:underline">Contact</button>
          <span aria-hidden>&middot;</span>
          <a href={shareUrl(SHARE_COURSE)} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Share on WhatsApp</a>
          <span className="sm:ml-auto text-xs">&copy; {new Date().getFullYear()} A Guide to Homecare</span>
        </div>
      </div>
    </footer>
  );
}
