import React, { useEffect, useState } from "react";
import { Award, Printer, ShieldCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { issueCertificate, CertificateRecord } from "@/lib/tutor-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COURSE_TITLE = "A Guide to Homecare";
const SUBTITLE = "Caregiver Preparedness — with Nurse Mooka";

function printCertificate(name: string, code: string, verifyUrl: string, dateStr: string) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
  <style>
    @page { size: landscape; margin: 0; }
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; }
    .cert { width: 100%; height: 100vh; box-sizing: border-box; padding: 5vh 8vw;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; color: #38221A; background: #FAF2E7;
      border: 14px solid #3E2318; outline: 3px solid #D98A2B; outline-offset: -22px; }
    .eyebrow { letter-spacing:.35em; text-transform:uppercase; font-size:13px; color:#B4531D; margin-bottom:16px; }
    h1 { font-size:34px; margin:0 0 6px; color:#3E2318; }
    .sub { font-style:italic; color:#7A6152; margin-bottom:32px; }
    .awarded { font-size:15px; color:#7A6152; margin-bottom:10px; }
    .name { font-size:44px; margin:0 0 8px; color:#B4531D; border-bottom:2px solid #D98A2B; padding-bottom:8px; }
    .body { max-width:640px; font-size:15px; line-height:1.6; color:#38221A; margin:22px 0 30px; }
    .meta { display:flex; gap:70px; font-size:13px; color:#7A6152; margin-bottom:18px; }
    .meta b { display:block; color:#38221A; font-size:15px; margin-top:4px; }
    .verify { font-size:11px; color:#7A6152; }
    .verify b { color:#38221A; }
  </style></head><body>
    <div class="cert">
      <div class="eyebrow">Certificate of Completion</div>
      <h1>${COURSE_TITLE}</h1>
      <div class="sub">${SUBTITLE}</div>
      <div class="awarded">This certifies that</div>
      <div class="name">${(name || "Caregiver").replace(/</g, "")}</div>
      <div class="body">has completed all 12 topics of the caregiver-preparedness course —
      reasoning through preparation, everyday care, infection control, common problems, palliative care
      and caregiver wellbeing — and demonstrated understanding through the topic knowledge checks.</div>
      <div class="meta">
        <div>Date<b>${dateStr}</b></div>
        <div>Topics mastered<b>12 of 12</b></div>
      </div>
      <div class="verify">Verify at <b>${verifyUrl}</b> &nbsp;·&nbsp; Certificate code <b>${code}</b></div>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function Certificate({ open, onOpenChange }: Props) {
  const { currentUser, setAuthOpen } = useAppState();
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !currentUser) return;
    setLoading(true);
    setError(null);
    issueCertificate().then((res) => {
      setLoading(false);
      if (res.ok) setCert(res.data.certificate as CertificateRecord);
      else setError(res.data?.error ?? "Could not issue certificate.");
    });
  }, [open, currentUser]);

  const date = cert ? new Date(cert.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
  const verifyUrl = cert ? `${window.location.origin}/verify/${cert.code}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Award className="w-6 h-6 text-accent" /> Your certificate
          </DialogTitle>
        </DialogHeader>

        {!currentUser ? (
          <div className="text-center py-6">
            <p className="text-foreground mb-4">Sign in to claim your <b>verifiable</b> certificate, bound to your name.</p>
            <Button onClick={() => { onOpenChange(false); setAuthOpen(true); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in / create account
            </Button>
          </div>
        ) : loading ? (
          <p className="text-center text-muted-foreground py-8">Preparing your certificate…</p>
        ) : error ? (
          <p className="text-center text-foreground py-8">{error}</p>
        ) : cert ? (
          <>
            <div className="rounded-xl border-2 border-sidebar p-6 sm:p-8 text-center bg-background"
              style={{ outline: "2px solid var(--marigold)", outlineOffset: "-14px" }}>
              <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">Certificate of Completion</div>
              <h3 className="font-serif text-2xl text-sidebar mb-1">{COURSE_TITLE}</h3>
              <p className="italic text-sm text-muted-foreground mb-6">{SUBTITLE}</p>
              <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
              <p className="font-serif text-3xl text-primary border-b-2 border-accent inline-block pb-1 mb-4">
                {cert.learnerName}
              </p>
              <p className="text-sm text-foreground max-w-md mx-auto leading-relaxed mb-6">
                has completed all 12 topics and demonstrated understanding through the knowledge checks.
              </p>
              <div className="flex justify-center gap-12 text-xs text-muted-foreground mb-4">
                <div>Date<div className="text-foreground font-medium mt-0.5">{date}</div></div>
                <div>Mastered<div className="text-foreground font-medium mt-0.5">12 of 12</div></div>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Verifiable at {window.location.host}/verify/<b className="text-foreground">{cert.code}</b>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => printCertificate(cert.learnerName, cert.code, verifyUrl, date)}
                className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
