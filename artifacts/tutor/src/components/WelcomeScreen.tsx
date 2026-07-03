import React, { useState } from "react";
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
import { TOPICS } from "@/lib/constants";
import { TOPIC_META, COURSE_OUTCOMES, GLOSSARY, RESOURCES } from "@/lib/course-content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Certificate } from "./Certificate";

export function WelcomeScreen() {
  const { setCurrentTopicIndex, sessions } = useAppState();
  const [certOpen, setCertOpen] = useState(false);

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
            A warm, one-question-at-a-time tutor that helps you think like a confident caregiver —
            across 12 real-world topics, grounded in <em>A Guide to Homecare</em> by Dorothy Mooka.
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
              <Button
                onClick={() => setCertOpen(true)}
                className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Award className="w-4 h-4 mr-2" /> View your certificate
              </Button>
            )}
          </div>
        </div>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-foreground text-center mb-6">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MessageCircleQuestion, title: "Socratic dialogue", body: "The tutor never lectures. It poses a real caregiving scenario and asks one focused question at a time, so you build judgement — not just facts." },
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
        <section id="topics" className="mb-12 scroll-mt-4">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl text-foreground">The 12 topics</h2>
            <span className="text-sm text-muted-foreground">{exploredCount} started &middot; {masteredCount} mastered</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map((topic, index) => {
              const meta = TOPIC_META[topic.id];
              const mastered = !!sessions[index]?.completed;
              return (
                <button
                  key={topic.id}
                  onClick={() => setCurrentTopicIndex(index)}
                  className={cn(
                    "bg-card text-left p-5 rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col group h-full",
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

      <Certificate open={certOpen} onOpenChange={setCertOpen} />
    </div>
  );
}
