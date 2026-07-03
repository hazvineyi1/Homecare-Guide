import React, { useState, useEffect } from "react";
import {
  MessageCircleQuestion,
  Lightbulb,
  CheckCircle2,
  Clock,
  Target,
  Award,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
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

  const renderCard = (topic: (typeof TOPICS)[number], index: number, pos = 0) => {
    const meta = TOPIC_META[topic.id];
    const mastered = !!sessions[index]?.completed;
    return (
      <button
        key={topic.id}
        onClick={() => setCurrentTopicIndex(index)}
        style={{ animationDelay: `${pos * 70}ms` }}
        className={cn(
          "hg-fade-up bg-card text-left p-5 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group h-full",
          mastered ? "border-accent/50" : "border-border hover:border-primary/40",
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
            TOPIC {topic.id.toString().padStart(2, "0")}
          </span>
          {mastered ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
            </span>
          ) : (
            meta && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> ~{meta.estMinutes} min
              </span>
            )
          )}
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2 leading-snug">{topic.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{topic.launch}</p>
        {meta && (
          <div className="mt-auto text-[11px] text-muted-foreground/80 flex items-center gap-1">
            <Target className="w-3 h-3" /> {meta.objectives.length} learning objectives
          </div>
        )}
      </button>
    );
  };

  const values = Object.values(sessions);
  const masteredCount = values.filter((s) => s.completed).length;
  const exploredCount = values.filter((s) => s.conversationId).length;
  const allMastered = masteredCount >= TOPICS.length;

  const firstUnmastered = TOPICS.findIndex((_, i) => !sessions[i]?.completed);
  const startIndex = firstUnmastered < 0 ? 0 : firstUnmastered;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
            A guided caregiving course
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground mb-4 leading-tight">
            Learn family caregiving by <span className="text-primary italic">reasoning it through</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-7">
            Meet <b>Nurse Mooka</b>, a warm tutor who helps you think like a confident caregiver —
            one question at a time, across 12 real-world topics, grounded in
            <em>A Guide to Homecare</em> by Dorothy Mooka.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setCurrentTopicIndex(startIndex)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-7 text-base"
            >
              {exploredCount > 0 ? "Continue learning" : "Start learning"}
            </Button>
            <a href="#topics">
              <Button variant="secondary" size="lg" className="h-11 px-6 text-base">
                Browse the 12 topics
              </Button>
            </a>
          </div>

          {/* Progress */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{masteredCount} of {TOPICS.length} topics mastered</span>
              <span>{Math.round((masteredCount / TOPICS.length) * 100)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(masteredCount / TOPICS.length) * 100}%` }}
              />
            </div>
            {allMastered && (
              <a href="#topics">
                <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Award className="w-4 h-4 mr-2" /> Claim your credentials
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-foreground text-center mb-6">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MessageCircleQuestion, title: "Socratic dialogue", body: "Nurse Mooka never lectures. She poses a real caregiving scenario and asks one focused question at a time, so you build judgement — not just facts." },
              { icon: Lightbulb, title: "Support when stuck", body: "Ask for a hint or a simpler version any time. Choose New caregiver for gentle scaffolding, or Experienced to be challenged harder." },
              { icon: CheckCircle2, title: "Check & master", body: "Run “Check my understanding” for a formative recap, then pass a short knowledge check to lock in each topic as mastered." },
            ].map((c) => (
              <div key={c.title} className="bg-card border border-border rounded-xl p-5">
                <c.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-serif text-lg text-foreground mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outcomes + who it's for */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl text-foreground">What you'll be able to do</h2>
            </div>
            <ul className="space-y-2.5">
              {COURSE_OUTCOMES.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl text-foreground">Who it's for</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Anyone caring — or preparing to care — for a family member at home:
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• <b>New caregivers</b> who want plain-language, step-by-step reasoning.</li>
              <li>• <b>Experienced caregivers</b> who want to pressure-test their judgement.</li>
              <li>• Family members coordinating care from near or far.</li>
              <li>• Anyone supporting an elderly, disabled, or chronically ill loved one.</li>
            </ul>
          </div>
        </section>

        {/* Topics grid */}
        {/* Your journey — calm, competence-tied progress */}
        <div className="hg-fade-up mb-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
          {(() => {
            const total = TOPICS.length;
            const pct = Math.round((masteredCount / total) * 100);
            const currentLevel = LEVELS.find((lv) => lv.topicIds.some((id) => {
              const idx = TOPICS.findIndex((t) => t.id === id);
              return !sessions[idx]?.completed;
            }));
            return (
              <>
                <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">Your journey</div>
                    <div className="font-serif text-xl text-foreground">
                      {masteredCount} of {total} topics mastered
                    </div>
                  </div>
                  <div className="text-right">
                    {currentLevel ? (
                      <>
                        <div className="text-[11px] text-muted-foreground">Working toward</div>
                        <div className="text-sm font-semibold text-secondary-foreground">
                          {currentLevel.credential} · Level {currentLevel.level}
                        </div>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                        <Award className="w-4 h-4" /> Diploma complete
                      </div>
                    )}
                  </div>
                </div>
                <div className="hg-bar-track h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <span
                    className="hg-bar-fill block h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {masteredCount === 0
                    ? "Master a topic's knowledge check to begin filling your progress."
                    : masteredCount >= total
                    ? "Every topic mastered — a remarkable achievement."
                    : `${pct}% of the way through the full Diploma.`}
                </div>
              </>
            );
          })()}
        </div>

        <section id="topics" className="mb-12 scroll-mt-4">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-foreground">Three levels to a Diploma</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Master every topic in a level to earn its credential. The levels stack: Certificate &rarr; Advanced Certificate &rarr; Diploma.
            </p>
          </div>

          <div className="space-y-8">
            {LEVELS.map((lv) => {
              const levelTopics = lv.topicIds
                .map((id) => ({ topic: TOPICS.find((t) => t.id === id)!, index: TOPICS.findIndex((t) => t.id === id) }))
                .filter((x) => x.topic);
              const masteredInLevel = levelTopics.filter((x) => sessions[x.index]?.completed).length;
              const levelComplete = levelTopics.length > 0 && masteredInLevel === levelTopics.length;
              const earned = earnedLevels.has(lv.level);
              return (
                <div key={lv.level} className="rounded-2xl border border-border overflow-hidden">
                  <div className="bg-secondary/60 px-5 py-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="relative inline-flex items-center justify-center w-11 h-11 shrink-0" title={`${masteredInLevel} of ${levelTopics.length} mastered`}>
                      <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="3.5" />
                        <circle
                          cx="20" cy="20" r="16" fill="none"
                          stroke={levelComplete ? "var(--marigold)" : "var(--teal)"}
                          strokeWidth="3.5" strokeLinecap="round"
                          className="hg-ring-fill"
                          style={{
                            strokeDasharray: 100.5,
                            strokeDashoffset: 100.5 * (1 - masteredInLevel / Math.max(1, levelTopics.length)),
                            ["--ring-len" as string]: "100.5px",
                          } as React.CSSProperties}
                        />
                      </svg>
                      <span className="absolute font-serif text-primary text-base">{lv.level}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-xl text-foreground">Level {lv.level}: {lv.name}</h3>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground bg-card border border-border rounded-full px-2 py-0.5">
                          {lv.credential} &middot; NCQF {lv.ncqf}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{lv.blurb}</p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {levelTopics.map(({ topic, index }, pos) => renderCard(topic, index, pos))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* About the book */}
        <section className="mb-12 bg-card border border-border rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-foreground">About the book &amp; author</h2>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            This course is adapted from <em>A Guide to Homecare — Caregiver Preparedness</em> by
            <b> Dorothy Mooka</b>, a practical handbook that prepares family caregivers for the role:
            duties and responsibilities, identifying problems and solving them, acquiring caregiving
            knowledge and skills, and making informed decisions.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every scenario and knowledge check here stays grounded in that book's guidance. The tutor won't
            invent medical advice beyond it — it's here to build your reasoning, not replace professional care.
          </p>
        </section>

        {/* Glossary + Resources (collapsible) */}
        <section className="mb-12 grid gap-4 md:grid-cols-2">
          <details className="bg-card border border-border rounded-xl p-5 group">
            <summary className="flex items-center gap-2 cursor-pointer font-serif text-lg text-foreground list-none">
              <BookOpen className="w-5 h-5 text-primary" /> Glossary of key terms
              <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <dl className="mt-4 space-y-3">
              {GLOSSARY.map((g) => (
                <div key={g.term}>
                  <dt className="text-sm font-semibold text-foreground">{g.term}</dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">{g.def}</dd>
                </div>
              ))}
            </dl>
          </details>
          <details className="bg-card border border-border rounded-xl p-5 group">
            <summary className="flex items-center gap-2 cursor-pointer font-serif text-lg text-foreground list-none">
              <ShieldCheck className="w-5 h-5 text-primary" /> Support &amp; resources
              <span className="ml-auto text-muted-foreground text-sm group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-4 space-y-3">
              {RESOURCES.map((r) => (
                <div key={r.title}>
                  <div className="text-sm font-semibold text-foreground">{r.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{r.detail}</div>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed pb-4">
          This course is for education and preparation only. It is not medical advice and does not replace
          professional or emergency care. If someone shows red-flag symptoms — trouble breathing, blood in
          sputum, or signs of sepsis (confusion, rapid breathing, temperature 37.8&deg;C or higher) — seek
          professional medical help without delay.
        </p>
      </div>

      <Certificate level={certLevel} open={certOpen} onOpenChange={setCertOpen} />
    </div>
  );
}
