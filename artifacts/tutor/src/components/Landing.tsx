import React from "react";
import {
  ArrowRight, MessageCircleQuestion, Compass, BookOpen, Check,
  Users, Building2, HeartHandshake, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { Footer } from "./Footer";

const PARTNER_EMAIL = "partners@dorothymooka.com";
const AMAZON_URL = "https://www.amazon.com/dp/B0BS8Z27KK";

// One example exchange shown in the hero, to make the Socratic method tangible.
const DEMO = [
  { who: "tutor", text: "Your mother came home from hospital yesterday and hasn't left her bed. Before we talk about turning her: which parts of her body are carrying her weight right now?" },
  { who: "learner", text: "Her back, her heels… maybe her elbows?" },
  { who: "tutor", text: "Good. Now what do you think happens to the skin over those points if the pressure never moves?" },
  { who: "learner", text: "The blood can't reach it… so the skin starts to break down?" },
  { who: "tutor", text: "Exactly. You've just reasoned your way to why pressure sores form — and why we prevent them before they start. Let's build your turning plan." },
] as const;

const METHOD = [
  { n: "01", icon: Compass, t: "Start with a real situation", b: "Each topic opens with a scenario you might actually face at home, drawn from the guide's real-world cases and set in your own country." },
  { n: "02", icon: MessageCircleQuestion, t: "Reason through it together", b: "Nurse Mooka asks one question at a time, listens to your thinking, and guides you toward safe, correct practice — never just handing you the answer." },
  { n: "03", icon: Sparkles, t: "Keep the judgement you built", b: "Because you worked it out yourself, it stays with you. You walk into your loved one's room calm, and prepared." },
];

export function Landing() {
  const {
    setAtLanding, setCurrentTopicIndex, sessions, currentUser, setAuthOpen, learnerName,
  } = useAppState();

  const firstName = (learnerName || currentUser?.name || "").trim().split(" ")[0];
  const values = Object.values(sessions);
  const mastered = values.filter((s) => s.completed).length;
  const explored = values.filter((s) => s.conversationId).length;
  const firstUnmastered = TOPICS.findIndex((_, i) => !sessions[i]?.completed);
  const startIndex = firstUnmastered < 0 ? 0 : firstUnmastered;

  const enterRoadmap = () => setAtLanding(false);
  const continueLearning = () => { setAtLanding(false); setCurrentTopicIndex(startIndex); };
  const openTopic = (i: number) => { setAtLanding(false); setCurrentTopicIndex(i); };

  const startLabel = explored > 0 ? "Continue where you left off" : "Try your first topic free";

  return (
    <div className="h-screen overflow-y-auto bg-background scroll-smooth">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button onClick={enterRoadmap} className="min-w-0 text-left focus-visible:outline-none">
            <div className="font-serif text-lg sm:text-xl font-semibold text-primary leading-tight">
              A Guide to <span className="text-accent-foreground/90">Homecare</span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">Caregiver preparedness &middot; with Dr Dorothy Mooka</div>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#method" className="text-foreground hover:text-primary">How it works</a>
            <a href="#topics" className="text-foreground hover:text-primary">Topics</a>
            <a href="#book" className="text-foreground hover:text-primary">The book</a>
            <a href="#pricing" className="text-foreground hover:text-primary">Pricing</a>
            <a href="#organizations" className="text-foreground hover:text-primary">Organizations</a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[10rem]">Hi, {currentUser.name.split(" ")[0]}</span>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)} className="hidden sm:inline-flex">Sign in</Button>
            )}
            <Button size="sm" onClick={continueLearning} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Try free
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground mb-4">
              {firstName ? `Welcome back, ${firstName}` : "First topic free · grounded in a published guide"}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.9rem] font-semibold text-foreground leading-[1.12] mb-5">
              Nobody is born knowing how to care for a loved one. <span className="text-primary italic">You can learn.</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed mb-7 max-w-xl">
              When someone you love needs care at home, the questions come fast. This AI tutor — built on
              Dr Dorothy Mooka's <b>A Guide to Homecare: Caregiver Preparedness</b> — walks you through real
              situations with guided questions, so the judgement you build is your own.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={continueLearning} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base">
                {startLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="#method">
                <Button size="lg" variant="secondary" className="h-12 px-6 text-base">See how it works</Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {explored > 0
                ? `${mastered} of ${TOPICS.length} topics mastered so far.`
                : "Your first topic is free, in full. No card, no sign-up to start. Works on any device."}
            </p>
          </div>

          {/* Living-dialogue demo */}
          <div className="border border-border border-t-4 border-t-primary bg-card p-6 sm:p-7 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-foreground mb-4">
              Live tutoring session
            </div>
            <div className="space-y-2.5">
              {DEMO.map((m, i) => (
                <div
                  key={i}
                  className={
                    "hg-fade-up max-w-[90%] px-4 py-2.5 text-sm leading-relaxed " +
                    (m.who === "tutor"
                      ? "bg-primary text-primary-foreground rounded-lg rounded-bl-sm"
                      : "ml-auto bg-secondary text-secondary-foreground font-semibold border border-border rounded-lg rounded-br-sm")
                  }
                  style={{ animationDelay: `${0.25 + i * 0.9}s` }}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs font-bold text-accent-foreground text-right">Topic: preventing pressure sores</div>
          </div>
        </div>
      </section>

      {/* ---------- Method ---------- */}
      <section id="method" className="scroll-mt-20 border-b border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              A tutor that asks questions instead of giving lectures
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Dr Mooka's guide was written to build caregiver judgement — spotting problems, solving them, and
              making informed decisions — not just to hand out instructions. Nurse Mooka teaches the same way,
              through Socratic dialogue. Knowledge you work out for yourself stays with you when you need it.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {METHOD.map((c) => (
              <div key={c.n} className="border border-border border-t-[3px] border-t-accent bg-card p-6">
                <c.icon className="w-6 h-6 text-primary mb-3" />
                <div className="text-xs font-bold tracking-[0.1em] text-accent-foreground mb-1">STEP {c.n}</div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-1.5">{c.t}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Topics ---------- */}
      <section id="topics" className="scroll-mt-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              Seventeen topics. The whole caregiving journey.
            </h2>
            <p className="text-ink-soft leading-relaxed">
              From preparing for the role to the hardest days at the end, each topic is grounded in
              <em> A Guide to Homecare</em> and taught the way its author taught nurses: through questions,
              problems, and practice.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOPICS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => openTopic(i)}
                className="text-left flex gap-3 items-baseline border border-border bg-card px-4 py-3.5 hover:border-primary hover:bg-secondary/50 transition-colors"
              >
                <span className="text-xs font-bold text-accent-foreground min-w-[1.6rem]">{String(t.id).padStart(2, "0")}</span>
                <span className="text-sm font-semibold text-foreground leading-snug">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Book ---------- */}
      <section id="book" className="scroll-mt-20 border-b border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-center">
          {/* On-theme cover treatment */}
          <div className="mx-auto w-full max-w-[280px]">
            <div className="aspect-[3/4] w-full bg-primary text-primary-foreground p-6 flex flex-col justify-between shadow-lg border border-primary">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">A Guide to</div>
              <div>
                <div className="font-serif text-3xl font-semibold leading-tight">Home&shy;care</div>
                <div className="mt-2 text-sm opacity-90">Caregiver Preparedness</div>
              </div>
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-9 h-9 text-accent" />
                <div className="text-xs leading-tight opacity-90">Dr Dorothy&nbsp;Mooka<br />RN, RM, PhD</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground mb-3">The foundation</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-primary mb-4">
              Written by a nurse who spent her career training nurses
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Every conversation is anchored in <b>A Guide to Homecare: Caregiver Preparedness</b> by
              Dr Dorothy Mooka — a registered nurse and midwife with a PhD in community health nursing. She has
              taught in health training schools, hospitals, and community settings, rural and urban, and wrote this
              guide so families could learn what she taught professionals.
            </p>
            <blockquote className="border-l-[3px] border-accent pl-4 my-6 italic text-lg text-primary">
              Preparedness is the difference between caring in fear and caring with confidence.
            </blockquote>
            <p className="text-ink-soft leading-relaxed mb-5">
              Prefer the full text at your bedside? The guide is available in print and on Kindle.
            </p>
            <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <BookOpen className="w-4 h-4 mr-2" /> Get the book on Amazon
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="scroll-mt-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              Start free. Continue when you're ready.
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Your first topic is a complete lesson, not a preview. If it helps you, unlock the remaining sixteen.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {/* Free */}
            <div className="border border-border bg-card p-7 flex flex-col">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-accent-foreground mb-3">First topic</div>
              <div className="font-serif text-4xl font-semibold text-primary leading-none">Free</div>
              <div className="text-sm text-muted-foreground mt-1 mb-5">No card required</div>
              <ul className="space-y-2 text-sm flex-1">
                {["Topic 1 in full, with the AI tutor", "Unlimited practice within the topic", "Works on any phone or computer"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent-foreground shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={continueLearning} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Start your free topic</Button>
            </div>
            {/* Featured */}
            <div className="border border-primary bg-primary text-primary-foreground p-7 flex flex-col shadow-lg">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-accent mb-3">Full access</div>
              <div className="font-serif text-4xl font-semibold leading-none">$9<span className="text-base font-normal opacity-80">/month</span></div>
              <div className="text-sm opacity-80 mt-1 mb-5">Regional pricing across Southern Africa</div>
              <ul className="space-y-2 text-sm flex-1">
                {["All 17 topics, unlimited sessions", "Personalised next-topic guidance", "New scenarios as the guide grows", "Cancel anytime"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={continueLearning} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Unlock all 17 topics</Button>
            </div>
            {/* Annual */}
            <div className="border border-border bg-card p-7 flex flex-col">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-accent-foreground mb-3">Annual + the book</div>
              <div className="font-serif text-4xl font-semibold text-primary leading-none">$90<span className="text-base font-normal text-muted-foreground">/year</span></div>
              <div className="text-sm text-muted-foreground mt-1 mb-5">Two months free, book included</div>
              <ul className="space-y-2 text-sm flex-1">
                {["Everything in Full access", "A copy of A Guide to Homecare", "Best for the full journey"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent-foreground shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={continueLearning} variant="secondary" className="mt-6">Get the annual bundle</Button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            Facing financial hardship? Sponsored access is available through partner churches and community
            organisations. <a href={`mailto:${PARTNER_EMAIL}`} className="font-semibold text-primary hover:underline">Ask about sponsored access</a>.
          </p>
        </div>
      </section>

      {/* ---------- Audiences ---------- */}
      <section id="organizations" className="scroll-mt-20 border-b border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-8 max-w-2xl">
            Built for families. Ready for organizations.
          </h2>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="border border-border bg-card p-8">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="font-serif text-xl font-semibold text-primary">For families</h3>
              </div>
              <p className="text-ink-soft leading-relaxed mb-4">
                Private, patient, and there the moment you need it — on any phone, at any hour. Start with a full topic free.
              </p>
              <ul className="space-y-2 text-sm">
                {["Learn before a crisis, or in the middle of one", "Practise real scenarios without judgement", "Share topics with relatives caring from afar"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent-foreground shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={continueLearning} variant="secondary" className="mt-6">Try your first topic free</Button>
            </div>
            <div className="border border-primary bg-primary text-primary-foreground p-8">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-6 h-6 text-accent" />
                <h3 className="font-serif text-xl font-semibold">For organizations</h3>
              </div>
              <p className="opacity-90 leading-relaxed mb-4">
                Home-care agencies, hospices, hospitals, insurers, ministries, and faith networks use the tutor to
                prepare families and train caregivers at scale.
              </p>
              <ul className="space-y-2 text-sm">
                {["Seat licences and co-branded editions", "Discharge and onboarding education families complete", "Sponsor full access for the families you serve", "Deploy via web or WhatsApp for community programmes"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <a href={`mailto:${PARTNER_EMAIL}`} className="inline-block mt-6">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Talk to us about a partnership</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20 text-center">
          <HeartHandshake className="w-9 h-9 text-accent mx-auto mb-5" />
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">
            The moment will come. <span className="text-accent">Be prepared for it.</span>
          </h2>
          <p className="opacity-90 leading-relaxed mb-8 max-w-xl mx-auto">
            Seventeen topics, one patient tutor, and the confidence of knowing what to do. Your first topic is free,
            because every family deserves to start prepared.
          </p>
          <Button size="lg" onClick={continueLearning} className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-7 text-base">
            {startLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
