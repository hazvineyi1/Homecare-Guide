import React, { useState } from "react";
import {
  BookOpen,
  MessageCircleQuestion,
  Target,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lightbulb,
  Map as MapIcon,
} from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { LEVELS } from "@/lib/course-structure";
import { COURSE_OUTCOMES } from "@/lib/course-content";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 5;

/**
 * First-run onboarding. A short, paged welcome (one idea per screen, minimal
 * scrolling) grounded in adult-learning practice: it captures the learner's
 * name for a personal interaction, states the purpose up front (why they are
 * here), names the book the course is built on, explains how the Socratic
 * method works, and shows the outcomes so they know what success looks like.
 * A clear "Step X of 5" keeps them oriented throughout.
 */
export function Onboarding() {
  const {
    learnerName,
    setLearnerName,
    setOnboarded,
    setAtLanding,
    setCurrentTopicIndex,
    currentUser,
  } = useAppState();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(learnerName || currentUser?.name?.split(" ")[0] || "");

  const firstName = (name.trim().split(" ")[0] || "there");
  const canProceed = step !== 1 || name.trim().length >= 1;

  const commitName = () => {
    if (name.trim()) setLearnerName(name.trim());
  };

  const next = () => {
    if (!canProceed) return;
    if (step === 1) commitName();
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = (dest: "topic" | "roadmap") => {
    commitName();
    setOnboarded(true);
    setAtLanding(false);
    setCurrentTopicIndex(dest === "topic" ? 0 : null);
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-background flex flex-col">
      {/* Brand + progress */}
      <header className="shrink-0 border-b border-border">
        <div className="max-w-2xl mx-auto w-full px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-serif text-lg text-foreground leading-tight truncate">A Guide to Homecare</div>
            <div className="text-[11px] text-muted-foreground">Guided by Dorothy Mooka</div>
          </div>
          <div className="text-xs font-semibold text-muted-foreground shrink-0">Step {step} of {TOTAL_STEPS}</div>
        </div>
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      {/* One idea per screen, vertically centered to minimise scrolling */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full">
          {step === 1 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">Welcome</div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                Let's make this personal
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This is a one-to-one conversation with <b className="text-foreground">Nurse Mooka</b>, an experienced
                home-care nurse who will guide you by asking questions and drawing on what you already know. First,
                what should she call you?
              </p>
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Your first name</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                  placeholder="e.g. Naledi"
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>
              <p className="mt-3 text-xs text-muted-foreground">
                We use your name only to personalise this course on this device. You can change it any time.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">What this is &amp; why</div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-4">
                {firstName}, here's why this course exists
              </h1>
              <div className="rounded-xl border border-border bg-card p-4 flex gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  Every topic is built on the book <em>A Guide to Homecare</em> by <b>Dr Dorothy Mooka</b>. You can open and
                  read the relevant chapter at any point, using <b>Read the chapter</b> inside each topic. The course turns
                  that book into guided practice.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Most people become caregivers suddenly, for a parent, partner, or relative, with no training. The purpose of
                this course is simple: to help you give <b className="text-foreground">safe, confident, and compassionate care at
                home</b>, and to protect your own wellbeing while you do it.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">How it works</div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-4">
                You learn by reasoning, not memorising
              </h1>
              <ul className="space-y-3">
                {[
                  { icon: MessageCircleQuestion, t: "One question at a time", b: "Nurse Mooka sets a real situation, then asks a single question. You reply in your own words, there is no single right answer." },
                  { icon: Lightbulb, t: "Help whenever you're stuck", b: "Use Give me a hint or I'm stuck, simplify. Want the source? Open Read the chapter." },
                  { icon: CheckCircle2, t: "Check, then master", b: "When ready, run Check my understanding for a recap, then Take the knowledge check to master the topic." },
                  { icon: Award, t: "Earn certificates", b: "Finish a module to earn a Certificate of Completion. Topic 1 is free to try before you continue." },
                ].map((c) => (
                  <li key={c.t} className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
                    <c.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">{c.t}</div>
                      <div className="text-sm text-muted-foreground leading-snug">{c.b}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">What you'll be able to do</div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-4">
                Where you're headed
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The course is {TOPICS.length} topics across {LEVELS.length} modules. By the end, you will be able to:
              </p>
              <ul className="space-y-2">
                {COURSE_OUTCOMES.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-snug">
                    <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{o.replace(/^By the end of this course you can /, "")}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 flex gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  You'll know you've got each topic when you pass its knowledge check. This is a preparation and reference
                  guide, not a licensed qualification or a substitute for professional medical advice.
                </span>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                You're ready, {firstName}
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-7 max-w-lg mx-auto">
                You'll always see where you are, Topic X of {TOPICS.length} and your module, so you never feel lost. You can
                restart a lesson or come back any time. Where would you like to begin?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => finish("topic")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base"
                >
                  Start Topic 1 (free)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => finish("roadmap")}
                  className="h-12 px-6 text-base"
                >
                  <MapIcon className="w-4 h-4 mr-2" /> See the roadmap first
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer nav (hidden on the final step, which has its own CTAs) */}
      {step < TOTAL_STEPS && (
        <footer className="shrink-0 border-t border-border">
          <div className="max-w-2xl mx-auto w-full px-6 py-3 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={back} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              onClick={next}
              disabled={!canProceed}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
