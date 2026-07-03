import React from "react";
import { Award, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/hooks/use-app-state";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COURSE_TITLE = "The Socratic Homecare Course";
const SUBTITLE = 'Grounded in "A Guide to Homecare" by Dorothy Mooka';

function printCertificate(name: string) {
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
  <style>
    @page { size: landscape; margin: 0; }
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; }
    .cert { width: 100%; height: 100vh; box-sizing: border-box; padding: 6vh 8vw;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; color: #38221A; background: #FAF2E7;
      border: 14px solid #3E2318; outline: 3px solid #D98A2B; outline-offset: -22px; }
    .eyebrow { letter-spacing: .35em; text-transform: uppercase; font-size: 13px; color: #B4531D; margin-bottom: 18px; }
    h1 { font-size: 34px; margin: 0 0 6px; color: #3E2318; }
    .sub { font-style: italic; color: #7A6152; margin-bottom: 40px; }
    .awarded { font-size: 15px; color: #7A6152; margin-bottom: 10px; }
    .name { font-size: 44px; margin: 0 0 8px; color: #B4531D; border-bottom: 2px solid #D98A2B; padding-bottom: 8px; }
    .body { max-width: 640px; font-size: 15px; line-height: 1.6; color: #38221A; margin: 24px 0 40px; }
    .meta { display: flex; gap: 80px; font-size: 13px; color: #7A6152; }
    .meta b { display: block; color: #38221A; font-size: 15px; margin-top: 4px; }
  </style></head><body>
    <div class="cert">
      <div class="eyebrow">Certificate of Completion</div>
      <h1>${COURSE_TITLE}</h1>
      <div class="sub">${SUBTITLE}</div>
      <div class="awarded">This certifies that</div>
      <div class="name">${(name || "Caregiver").replace(/</g, "")}</div>
      <div class="body">has completed all 12 Socratic dialogues on family home caregiving —
      reasoning through preparation, everyday care, infection control, common problems,
      palliative care, and caregiver wellbeing — and demonstrated understanding through knowledge checks.</div>
      <div class="meta">
        <div>Date<b>${date}</b></div>
        <div>Topics mastered<b>12 of 12</b></div>
      </div>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function Certificate({ open, onOpenChange }: Props) {
  const { learnerName, setLearnerName } = useAppState();
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Award className="w-6 h-6 text-accent" /> Your certificate
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border-2 border-sidebar p-6 sm:p-8 text-center bg-background"
          style={{ outline: "2px solid var(--marigold)", outlineOffset: "-14px" }}>
          <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">Certificate of Completion</div>
          <h3 className="font-serif text-2xl text-sidebar mb-1">{COURSE_TITLE}</h3>
          <p className="italic text-sm text-muted-foreground mb-6">{SUBTITLE}</p>
          <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
          <p className="font-serif text-3xl text-primary border-b-2 border-accent inline-block pb-1 mb-4">
            {learnerName || "Caregiver"}
          </p>
          <p className="text-sm text-foreground max-w-md mx-auto leading-relaxed mb-6">
            has completed all 12 Socratic dialogues and demonstrated understanding through the topic knowledge checks.
          </p>
          <div className="flex justify-center gap-12 text-xs text-muted-foreground">
            <div>Date<div className="text-foreground font-medium mt-0.5">{date}</div></div>
            <div>Mastered<div className="text-foreground font-medium mt-0.5">12 of 12</div></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Input
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            placeholder="Type your name for the certificate"
            className="flex-1"
          />
          <Button
            onClick={() => printCertificate(learnerName)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
