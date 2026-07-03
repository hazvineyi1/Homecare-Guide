import React, { useState, useEffect } from "react";
import {
  MessageCircleQuestion,
  Lightbulb,
  CheckCircle2,
  Target,
  Award,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { fetchCertificates } from "@/lib/tutor-api";
import { TOPICS } from "@/lib/constants";
import { TOPIC_META, COURSE_OUTCOMES, GLOSSARY, RESOURCES } from "@/lib/course-content";
import { LEVELS } from "@/lib/course-structure";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Certificate } from "./Certificate";

export function WelcomeScreen() {
  const { setCurrentTopicIndex, sessions, currentUser } = useAppState();
  const [certOpen, setCertOpen] = useState(false);
  const [certLevel, setCertLevel] = useState(1);
  const [earnedLevels, setEarnedLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!currentUser) { setEarnedLevels(new Set()); return; }
    fetchCertificates().then((certs) =>
      setEarnedLevels(new Set(certs.map((c) => c.level ?? 0).filter(Boolean))),
    );
  }, [currentUser, certOpen]);

  const total = TOPICS.length;
  const masteredCount = Object.values(sessions).filter((s) => s.completed).length;
  const exploredCount = Object.values(sessions).filter((s) => s.conversationId).length;
  const pct = Math.round((masteredCount / total) * 100);
  const allMastered = masteredCount >= total;

  // Ordered learning path: by level, then within level.
  const orderedIds = LEVELS.flatMap((lv) => lv.topicIds);
  const stepOf: Record<number, number> = {};
  orderedIds.forEach((id, i) => (stepOf[id] = i));
  const indexOfId = (id: number) => TOPICS.findIndex((t) => t.id === id);
  const currentTopicId = orderedIds.find((id) => !sessions[indexOfId(id)]?.completed);
  const startIndex = currentTopicId != null ? indexOfId(currentTopicId) : 0;
  const currentLevel = LEVELS.find((lv) => lv.topicIds.includes(currentTopicId ?? -1));

  const ring = (masteredInLevel: number, count: number, complete: boolean, label: string | number) => (
    <span className="relative inline-flex items-center justify-center w-12 h-12 shrink-0" title={`${masteredInLevel} of ${count} mastered`}>
      <svg viewBox="0 0 40 40" className="w-12 h-12 -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r="16" fill="none"
          stroke={complete ? "var(--marigold)" : "var(--teal)"}
          strokeWidth="3.5" strokeLinecap="round" className="hg-ring-fill"
          style={{
            strokeDasharray: 100.5,
            strokeDashoffset: 100.5 * (1 - masteredInLevel / Math.max(1, count)),
            ["--ring-len" as string]: "100.5px",
          } as React.CSSProperties}
        />
      </svg>
      <span className="absolute font-serif text-primary text-base">{label}</span>
    </span>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-9 sm:py-12">

        {/* Compact header */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">A guided caregiving course</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2 leading-tight">Your caregiving roadmap</h1>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Reason through 12 real-world topics with <b>Nurse Mooka</b>, grounded in <em>A Guide to Homecare</em>.
            Master each stop to light up your path and earn three stacked certificates.
          </p>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span className="truncate">
                  {masteredCount} of {total} mastered
                  {currentLevel && !allMastered ? ` · working toward ${currentLevel.credential}` : ""}
                </span>
                <span className="shrink-0 ml-2">{pct}%</span>
              </div>
              <div className="hg-bar-track h-2.5 rounded-full bg-secondary overflow-hidden">
                <span className="hg-bar-fill block h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <Button
              onClick={() => setCurrentTopicIndex(startIndex)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 shrink-0"
            >
              {allMastered ? "Review topics" : exploredCount > 0 ? "Continue" : "Start learning"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* The roadmap */}
        <div className="space-y-3">
          {LEVELS.map((lv) => {
            const levelTopics = lv.topicIds.map((id) => ({ topic: TOPICS.find((t) => t.id === id)!, index: indexOfId(id) })).filter((x) => x.topic);
            const masteredInLevel = levelTopics.filter((x) => sessions[x.index]?.completed).length;
            const levelComplete = levelTopics.length > 0 && masteredInLevel === levelTopics.length;
            const earned = earnedLevels.has(lv.level);
            return (
              <section key={lv.level} className="pt-2">
                {/* Level checkpoint */}
                <div className="hg-fade-up rounded-2xl border border-border bg-secondary/50 px-4 py-4 sm:px-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {ring(masteredInLevel, levelTopics.length, levelComplete, lv.level)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-lg sm:text-xl text-foreground">Level {lv.level}: {lv.name}</h2>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground bg-card border border-border rounded-full px-2 py-0.5">
                        {lv.credential} &middot; NCQF {lv.ncqf}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{lv.blurb}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">{masteredInLevel}/{levelTopics.length} mastered</div>
                    {earned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                        <Award className="w-4 h-4" /> {lv.credential} earned
                      </span>
                    ) : levelComplete ? (
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => { setCertLevel(lv.level); setCertOpen(true); }}>
                        <Award className="w-4 h-4 mr-1" /> Claim {lv.credential}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Topic nodes along the path */}
                <div className="pt-1">
                  {levelTopics.map(({ topic, index }, i) => {
                    const mastered = !!sessions[index]?.completed;
                    const isCurrent = topic.id === currentTopicId;
                    const meta = TOPIC_META[topic.id];
                    const side = stepOf[topic.id] % 2 === 0 ? "left" : "right";
                    const stateLabel = mastered
                      ? "Mastered"
                      : isCurrent
                      ? exploredCount > 0 ? "Continue here" : "Start here"
                      : meta ? `~${meta.estMinutes} min · ${meta.objectives.length} objectives` : "";
                    return (
                      <div key={topic.id} className="relative grid grid-cols-[3.5rem_1fr] sm:grid-cols-[1fr_3.5rem_1fr] items-stretch gap-x-3 sm:gap-x-4">
                        {/* spine + node */}
                        <div className="relative col-start-1 sm:col-start-2 flex justify-center">
                          <span className={cn("absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 rounded-full", mastered ? "bg-accent/70" : "bg-line")} />
                          <button
                            onClick={() => setCurrentTopicIndex(index)}
                            aria-label={`Open ${topic.title}`}
                            className={cn(
                              "relative z-10 my-2.5 w-12 h-12 rounded-full flex items-center justify-center font-serif text-base shrink-0 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              mastered
                                ? "bg-accent text-accent-foreground shadow"
                                : isCurrent
                                ? "bg-card border-2 border-primary text-primary shadow hg-pulse"
                                : "bg-secondary border border-border text-muted-foreground hover:border-primary/40",
                            )}
                          >
                            {mastered ? <CheckCircle2 className="w-6 h-6" /> : topic.id}
                          </button>
                        </div>

                        {/* label card */}
                        <button
                          onClick={() => setCurrentTopicIndex(index)}
                          style={{ animationDelay: `${i * 55}ms` }}
                          className={cn(
                            "hg-fade-up self-center col-start-2 rounded-xl border bg-card p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all",
                            side === "left" ? "sm:col-start-1 sm:text-right" : "sm:col-start-3 sm:text-left",
                            mastered ? "border-accent/40" : isCurrent ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
                          )}
                        >
                          <div className={cn("flex items-center gap-2 mb-0.5", side === "left" && "sm:flex-row-reverse")}>
                            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                              Topic {topic.id.toString().padStart(2, "0")}
                            </span>
                            <span className={cn("text-[11px] font-semibold", mastered ? "text-accent" : isCurrent ? "text-primary" : "text-muted-foreground/80")}>
                              {stateLabel}
                            </span>
                          </div>
                          <h3 className="font-serif text-base sm:text-lg text-foreground leading-snug">{topic.title}</h3>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Learn more — compact, collapsed by default */}
        <div className="mt-10">
          <h2 className="font-serif text-lg text-foreground mb-3">Learn more</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <MessageCircleQuestion className="w-5 h-5 text-primary" /> How it works
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 space-y-3">
                {[
                  { icon: MessageCircleQuestion, title: "Socratic dialogue", body: "Nurse Mooka never lectures. She poses a real caregiving scenario and asks one focused question at a time, so you build judgement, not just facts." },
                  { icon: Lightbulb, title: "Support when stuck", body: "Ask for a hint or a simpler version any time. Choose New caregiver for gentle scaffolding, or Experienced to be challenged harder." },
                  { icon: CheckCircle2, title: "Check & master", body: "Run “Check my understanding”, then pass a short knowledge check to lock in each topic as mastered." },
                ].map((c) => (
                  <div key={c.title} className="flex gap-3">
                    <c.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">{c.title}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <Target className="w-5 h-5 text-primary" /> What you'll be able to do
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <ul className="mt-3 space-y-2">
                {COURSE_OUTCOMES.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span>{o}</span>
                  </li>
                ))}
              </ul>
            </details>

            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <HeartHandshake className="w-5 h-5 text-primary" /> Who it's for
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>• <b>New caregivers</b> who want plain-language, step-by-step reasoning.</li>
                <li>• <b>Experienced caregivers</b> who want to pressure-test their judgement.</li>
                <li>• Family members coordinating care from near or far.</li>
                <li>• Anyone supporting an elderly, disabled, or chronically ill loved one.</li>
              </ul>
            </details>

            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <BookOpen className="w-5 h-5 text-primary" /> About the book &amp; author
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-foreground leading-relaxed">
                This course is adapted from <em>A Guide to Homecare: Caregiver Preparedness</em> by <b>Dorothy Mooka</b>,
                a practical handbook for family caregivers. Every scenario and knowledge check stays grounded in that
                book's guidance. The tutor won't invent medical advice beyond it. It's here to build your reasoning,
                not replace professional care.
              </p>
            </details>

            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <BookOpen className="w-5 h-5 text-primary" /> Glossary of key terms
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <dl className="mt-3 space-y-2.5">
                {GLOSSARY.map((g) => (
                  <div key={g.term}>
                    <dt className="text-sm font-semibold text-foreground">{g.term}</dt>
                    <dd className="text-sm text-muted-foreground leading-relaxed">{g.def}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <details className="bg-card border border-border rounded-xl p-4 group">
              <summary className="flex items-center gap-2 cursor-pointer font-serif text-base text-foreground list-none">
                <ShieldCheck className="w-5 h-5 text-primary" /> Support &amp; resources
                <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 space-y-2.5">
                {RESOURCES.map((r) => (
                  <div key={r.title}>
                    <div className="text-sm font-semibold text-foreground">{r.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{r.detail}</div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed mt-8">
          This course is for education and preparation only. It is not medical advice and does not replace
          professional or emergency care. If someone shows red-flag symptoms such as trouble breathing, blood in
          sputum, or signs of sepsis (confusion, rapid breathing, temperature 37.8&deg;C or higher), seek
          professional medical help without delay.
        </p>
      </div>

      <Certificate level={certLevel} open={certOpen} onOpenChange={setCertOpen} />
    </div>
  );
}
