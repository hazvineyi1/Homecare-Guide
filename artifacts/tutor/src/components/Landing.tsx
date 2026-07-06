import React, { useEffect, useState } from "react";
import {
  ArrowRight, MessageCircleQuestion, Compass, BookOpen, Check,
  Users, Building2, HeartHandshake, Sparkles, MessageCircle, Share2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { LEVELS } from "@/lib/course-structure";
import { moneyFor, priceLabel } from "@/lib/pricing";
import { fetchPayInfo } from "@/lib/tutor-api";
import { chatUrl, shareUrl, SHARE_COURSE, CONTACT_MSG, PARTNER_MSG } from "@/lib/whatsapp";
import { Footer } from "./Footer";

const PARTNER_EMAIL = "info@synops-consulting.com";
const AMAZON_URL = "https://www.amazon.com/dp/B0BS8Z27KK";

// Match the server-rendered SEO page slugs (routes/seo.ts) so topic links resolve.
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// A short, plain-language brief for a topic, drawn from the first sentences of its
// chapter content.
const topicBrief = (kb: string) => {
  let s = kb.split(". ").slice(0, 2).join(". ").trim();
  if (!s.endsWith(".")) s += ".";
  if (s.length > 260) s = s.slice(0, 255).replace(/\s+\S*$/, "") + "…";
  return s;
};

// One example exchange shown in the hero, to make the Socratic method tangible.
const DEMO = [
  { who: "tutor", text: "Your mother came home from hospital yesterday and hasn't left her bed. Before we talk about turning her: which parts of her body are carrying her weight right now?" },
  { who: "learner", text: "Her back, her heels… maybe her elbows?" },
  { who: "tutor", text: "Good. Now what do you think happens to the skin over those points if the pressure never moves?" },
  { who: "learner", text: "The blood can't reach it… so the skin starts to break down?" },
  { who: "tutor", text: "Exactly. You've just reasoned your way to why pressure sores form, and why we prevent them before they start. Let's build your turning plan." },
] as const;

const METHOD = [
  { n: "01", icon: Compass, t: "Start with a real situation", b: "Each topic opens with a scenario you might actually face at home, drawn from the guide's real-world cases and set in your own country." },
  { n: "02", icon: MessageCircleQuestion, t: "Reason through it together", b: "Nurse Mooka asks one question at a time, listens to your thinking, and guides you toward safe, correct practice, never just handing you the answer." },
  { n: "03", icon: Sparkles, t: "Keep the judgement you built", b: "Because you worked it out yourself, it stays with you. You walk into your loved one's room calm, and prepared." },
];

export function Landing() {
  const {
    setAtLanding, setCurrentTopicIndex, sessions, currentUser, setAuthOpen, learnerName, country, onboarded,
    setContactOpen, setContactKind,
  } = useAppState();

  const firstName = (learnerName || currentUser?.name || "").trim().split(" ")[0];
  // Default to US dollars until the learner has actually chosen a country (in
  // onboarding); only then price in their local currency.
  const money = moneyFor(onboarded ? country : "");
  const [wa, setWa] = useState("");
  const [coverError, setCoverError] = useState(false);
  const [openTopicId, setOpenTopicId] = useState<number | null>(null);
  useEffect(() => { fetchPayInfo().then((p) => setWa(p.whatsapp || "")).catch(() => {}); }, []);
  const values = Object.values(sessions);
  const mastered = values.filter((s) => s.completed).length;
  const explored = values.filter((s) => s.conversationId).length;
  const firstUnmastered = TOPICS.findIndex((_, i) => !sessions[i]?.completed);
  const startIndex = firstUnmastered < 0 ? 0 : firstUnmastered;

  const continueLearning = () => { setAtLanding(false); setCurrentTopicIndex(startIndex); };
  const openTopic = (i: number) => { setAtLanding(false); setCurrentTopicIndex(i); };
  // Paid CTAs send the visitor to a locked topic, which renders the unlock/paywall
  // page (coupon, WhatsApp, and payment options) instead of the free topic.
  const goUnlock = () => { setAtLanding(false); setCurrentTopicIndex(1); };
  const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const goTop = () => document.getElementById("hg-top")?.scrollTo({ top: 0, behavior: "smooth" });
  const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const openContact = (kind: string) => { setContactKind(kind); setContactOpen(true); };

  const startLabel = explored > 0 ? "Continue where you left off" : "Try your first topic free";

  return (
    <div id="hg-top" className="h-screen overflow-y-auto bg-background scroll-smooth">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button onClick={goTop} aria-label="A Guide to Homecare, back to top" className="min-w-0 text-left focus-visible:outline-none">
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
              When someone you love needs care at home, the questions come fast. This AI tutor, built on
              Dr Dorothy Mooka's <b>A Guide to Homecare: Caregiver Preparedness</b>, walks you through real
              situations with guided questions, so the judgement you build is your own.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={continueLearning} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base">
                {startLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => scrollToId("method")} className="h-12 px-6 text-base">See how it works</Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {explored > 0
                ? `${mastered} of ${TOPICS.length} topics mastered so far.`
                : "Your first topic is free, in full. No card, no sign-up to start. Works on any device."}
            </p>
            <a
              href={shareUrl(SHARE_COURSE)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Share2 className="w-4 h-4" /> Share with a family member on WhatsApp
            </a>
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
              Dr Mooka's guide was written to build caregiver judgement (spotting problems, solving them, and
              making informed decisions), not just to hand out instructions. Nurse Mooka teaches the same way,
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
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {LEVELS.map((lv) => (
              <div key={lv.level} className="break-inside-avoid mb-5">
                <div className="mb-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-foreground">Module {lv.level}</div>
                  <div className="font-serif text-lg font-semibold text-primary leading-tight">{lv.name}</div>
                </div>
                <div className="border border-border rounded-lg bg-card overflow-hidden divide-y divide-border">
                  {lv.topicIds.map((id) => {
                    const t = TOPICS.find((x) => x.id === id);
                    if (!t) return null;
                    const isOpen = openTopicId === t.id;
                    return (
                      <div key={t.id}>
                        <button
                          onClick={() => setOpenTopicId(isOpen ? null : t.id)}
                          aria-expanded={isOpen}
                          className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary/50 transition-colors"
                        >
                          <span className="text-[11px] font-bold text-accent-foreground min-w-[1.6rem]">{String(t.id).padStart(2, "0")}</span>
                          <span className="flex-1 text-sm font-semibold text-foreground leading-snug">{t.title}</span>
                          <ChevronDown className={"w-4 h-4 text-muted-foreground shrink-0 transition-transform" + (isOpen ? " rotate-180" : "")} />
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3 bg-secondary/20">
                            <p className="text-sm text-ink-soft leading-relaxed pt-1.5">{topicBrief(t.kb)}</p>
                            {t.id === 1 ? (
                              <button
                                onClick={() => openTopic(0)}
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                              >
                                Try this topic free <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <p className="mt-2 text-xs text-muted-foreground">Taught in full with Nurse Mooka inside the course.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Book ---------- */}
      <section id="book" className="scroll-mt-20 border-b border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-center">
          {/* The actual book cover; falls back to an on-theme cover only if the
              image file is missing. */}
          <div className="mx-auto w-full max-w-[280px]">
            {!coverError ? (
              <img
                src="https://m.media-amazon.com/images/I/61OyhbbexJL._SY600_.jpg"
                alt="Cover of A Guide to Homecare: Caregiver Preparedness by Dr Dorothy Mooka: two clasped hands"
                width={280}
                height={420}
                loading="lazy"
                onError={() => setCoverError(true)}
                className="w-full h-auto shadow-lg border border-line"
                style={{ borderRadius: "6px" }}
              />
            ) : (
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
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent-foreground mb-3">The foundation</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-primary mb-4">
              Written by a nurse who spent her career training nurses
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Every conversation is anchored in <b>A Guide to Homecare: Caregiver Preparedness</b> by
              Dr Dorothy Mooka, a registered nurse and midwife with a PhD in community health nursing. She has
              taught in health training schools, hospitals, and community settings, rural and urban, and wrote this
              guide so families could learn what she taught professionals.
            </p>
            <blockquote className="border-l-[3px] border-accent pl-4 my-6 italic text-lg text-primary">
              Preparedness is the difference between caring in fear and caring with confidence.
            </blockquote>
            <p className="text-ink-soft leading-relaxed mb-5">
              Prefer the full text at your bedside? The guide is available in print and on Kindle.
            </p>
            <Button onClick={() => openExternal(AMAZON_URL)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <BookOpen className="w-4 h-4 mr-2" /> Get the book on Amazon
            </Button>
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
              <div className="font-serif text-4xl font-semibold leading-none">{priceLabel(money, "month")}<span className="text-base font-normal opacity-80">/month</span></div>
              <div className="text-sm opacity-80 mt-1 mb-5">Priced in {money.code} for your region</div>
              <ul className="space-y-2 text-sm flex-1">
                {["All 17 topics, unlimited sessions", "Personalised next-topic guidance", "New scenarios as the guide grows", "Cancel anytime"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={goUnlock} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Unlock all 17 topics</Button>
            </div>
            {/* Annual */}
            <div className="border border-border bg-card p-7 flex flex-col">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-accent-foreground mb-3">Annual + the book</div>
              <div className="font-serif text-4xl font-semibold text-primary leading-none">{priceLabel(money, "year")}<span className="text-base font-normal text-muted-foreground">/year</span></div>
              <div className="text-sm text-muted-foreground mt-1 mb-5">Two months free, book included</div>
              <ul className="space-y-2 text-sm flex-1">
                {["Everything in Full access", "A copy of A Guide to Homecare", "Best for the full journey"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-accent-foreground shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button onClick={goUnlock} variant="secondary" className="mt-6">Get the annual bundle</Button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            Facing financial hardship? Sponsored access is available through partner churches and community
            organisations. <button onClick={() => openContact("sponsored")} className="font-semibold text-primary hover:underline">Ask about sponsored access</button>.
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
                Private, patient, and there the moment you need it, on any phone, at any hour. Start with a full topic free.
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
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => openContact("partnership")} className="bg-accent text-accent-foreground hover:bg-accent/90">Talk to us about a partnership</Button>
                {wa && (
                  <Button
                    onClick={() => openExternal(chatUrl(wa, PARTNER_MSG))}
                    variant="secondary"
                    className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                  </Button>
                )}
              </div>
              <p className="mt-3 text-sm opacity-90">
                Or email <a href={`mailto:${PARTNER_EMAIL}`} className="font-semibold underline">{PARTNER_EMAIL}</a>
              </p>
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

      {wa && (
        <a
          href={chatUrl(wa, CONTACT_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{ borderRadius: "9999px" }}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 shadow-lg hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
        </a>
      )}
    </div>
  );
}
