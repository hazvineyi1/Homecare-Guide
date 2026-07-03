import React from "react";
import { MessageCircleQuestion, Search, Award, ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";

export function Landing() {
  const { setAtLanding, setCurrentTopicIndex, sessions, currentUser, setAuthOpen, learnerName } = useAppState();
  const firstName = (learnerName || currentUser?.name || "").trim().split(" ")[0];
  const values = Object.values(sessions);
  const mastered = values.filter((s) => s.completed).length;
  const explored = values.filter((s) => s.conversationId).length;
  const firstUnmastered = TOPICS.findIndex((_, i) => !sessions[i]?.completed);
  const startIndex = firstUnmastered < 0 ? 0 : firstUnmastered;

  const enterRoadmap = () => setAtLanding(false);
  const continueLearning = () => { setAtLanding(false); setCurrentTopicIndex(startIndex); };

  const features = [
    { icon: MessageCircleQuestion, t: "Learn by reasoning", b: "Nurse Mooka poses a real caregiving situation and asks one question at a time, so you build judgement, not just facts." },
    { icon: Search, t: "Quick reference", b: "Need a fast answer? Search any topic for the plain-language chapter and a printable one-page summary, no dialogue needed." },
    { icon: Award, t: "Certificates & teams", b: "Earn a Certificate of Completion for each module. Care homes can track staff progress and print training records." },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button onClick={enterRoadmap} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="font-serif text-xl text-foreground leading-tight">A Guide to Homecare</div>
            <div className="text-xs text-muted-foreground">Caregiver preparedness &middot; guided by Dorothy Mooka</div>
          </button>
          {currentUser ? (
            <div className="text-sm text-muted-foreground truncate">Signed in as {currentUser.name}</div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setAuthOpen(true)}>Sign in</Button>
          )}
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-14 sm:py-20 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
          {firstName ? `Welcome back, ${firstName}` : "A guided caregiving course"}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-5 leading-tight">
          Learn home caregiving, one real situation at a time
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Work through {TOPICS.length} real-world topics with <b>Nurse Mooka</b>, based on <em>A Guide to Homecare</em> by
          Dorothy Mooka. Reason through each one, check your understanding, and earn your Certificate of Completion.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={continueLearning}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base">
            {explored > 0 ? "Continue where you left off" : "Start the course"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="secondary" onClick={enterRoadmap} className="h-12 px-6 text-base">
            View the roadmap
          </Button>
        </div>
        {explored > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">{mastered} of {TOPICS.length} topics mastered so far</p>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12 grid gap-4 sm:grid-cols-3">
        {features.map((c) => (
          <div key={c.t} className="border border-border bg-card p-5">
            <c.icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-serif text-lg text-foreground mb-1.5">{c.t}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.b}</p>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl text-foreground">Who it's for</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground">
            <li>&bull; Family and new caregivers who want plain-language, step-by-step guidance.</li>
            <li>&bull; Experienced caregivers who want to pressure-test their judgement.</li>
            <li>&bull; Care homes and agencies using it as staff orientation or an in-service reference guide.</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            This course gives you a Certificate of Completion showing you finished the training. It is a preparation and
            reference guide, not a licensed or government-accredited qualification, and not a substitute for professional
            medical training or advice.
          </p>
        </div>
      </section>
    </div>
  );
}
