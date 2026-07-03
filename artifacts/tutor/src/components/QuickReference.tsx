import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Printer, BookOpen, MessageCircleQuestion, CheckSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TOPICS } from "@/lib/constants";
import { TOPIC_META } from "@/lib/course-content";
import { READINGS } from "@/lib/course-readings";
import { useAppState } from "@/hooks/use-app-state";

// One-page printable / saveable reference for a single topic (no dialogue needed).
function printReference(topicId: number) {
  const topic = TOPICS.find((t) => t.id === topicId);
  const meta = TOPIC_META[topicId];
  if (!topic || !meta) return;
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const li = (arr: string[]) => arr.map((x) => `<li>${esc(x)}</li>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Quick reference: ${esc(topic.title)}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #241f1a; line-height: 1.5; max-width: 720px; margin: 0 auto; }
    .eyebrow { letter-spacing:.18em; text-transform:uppercase; font-size:11px; color:#A85E30; }
    h1 { font-size:23px; margin:4px 0 2px; }
    .meta { font-size:12px; color:#6b6156; margin-bottom:16px; }
    h2 { font-size:14px; color:#A85E30; margin:20px 0 6px; border-bottom:1px solid #E8E4DC; padding-bottom:4px; }
    ul { margin:6px 0; padding-left:20px; } li { margin:4px 0; }
    .safe { margin-top:22px; font-size:11px; color:#6b6156; border-top:1px solid #E8E4DC; padding-top:8px; }
  </style></head><body>
    <div class="eyebrow">A Guide to Homecare, quick reference</div>
    <h1>${esc(topic.title)}</h1>
    <div class="meta">${esc(topic.launch)}</div>
    <h2>What this covers</h2><ul>${li(meta.objectives)}</ul>
    <h2>Key points to remember</h2><ul>${li(meta.takeaways)}</ul>
    <div class="safe">This is a preparation and reference guide. It is not a substitute for professional medical training or advice. If you are unsure, or the person seems unwell, contact a health professional. Grounded in "A Guide to Homecare" by Dorothy Mooka.</div>
    <script>window.onload=function(){window.print();}</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

interface Props {
  topicId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickReference({ topicId, open, onOpenChange }: Props) {
  const { setCurrentTopicIndex } = useAppState();
  const topic = topicId != null ? TOPICS.find((t) => t.id === topicId) : undefined;
  const meta = topic ? TOPIC_META[topic.id] : undefined;
  const reading = topic ? READINGS[topic.id] : undefined;
  const index = topic ? TOPICS.findIndex((t) => t.id === topic.id) : -1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        {topic && meta ? (
          <>
            <SheetHeader>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Quick reference</div>
              <SheetTitle className="font-serif text-2xl">{topic.title}</SheetTitle>
            </SheetHeader>
            <p className="text-sm text-muted-foreground mt-1">{topic.launch}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" onClick={() => printReference(topic.id)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Printer className="w-4 h-4 mr-2" /> Print / save one-page summary
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { onOpenChange(false); if (index >= 0) setCurrentTopicIndex(index); }}>
                <MessageCircleQuestion className="w-4 h-4 mr-2" /> Learn this with Nurse Mooka
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="font-serif text-lg text-foreground mb-2 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent" /> Key points at a glance
              </h3>
              <ul className="space-y-2">
                {meta.takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                    <span className="mt-0.5 w-4 h-4 rounded-[4px] border border-primary/50 shrink-0" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {reading && (
              <div className="mt-6">
                <h3 className="font-serif text-lg text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Full chapter
                </h3>
                <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-serif prose-headings:mb-2 prose-headings:mt-4 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-foreground text-[15px] leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{reading}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
