import React from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { scenariosFor, type Scenario } from "@/lib/scenarios";
import { ScenarioArt } from "./ScenarioArt";

// Shown when a learner starts a topic. They choose one of several situations;
// the chosen scenario seeds Nurse Mooka's opening (localised to their country).
export function ScenarioPicker({
  topicId,
  topicTitle,
  onPick,
}: {
  topicId: number;
  topicTitle: string;
  onPick: (s: Scenario) => void;
}) {
  const { setCurrentTopicIndex, setMobileSidebarOpen } = useAppState();
  const scenarios = scenariosFor(topicId);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-7">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentTopicIndex(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to roadmap
          </button>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <Menu className="w-4 h-4" /> Menu
          </button>
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-1">Choose your situation</div>
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 leading-tight">{topicTitle}</h1>
        <p className="text-muted-foreground mb-5 leading-relaxed">
          Pick a real-life situation to reason through with Nurse Mooka. Each one builds the same skills through a
          different story, set in your country. You can switch to another any time.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className="hg-fade-up text-left rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-3 items-start"
            >
              <ScenarioArt art={s.art} />
              <span className="min-w-0">
                <span className="block font-serif text-lg text-foreground leading-snug">{s.title}</span>
                <span className="block text-sm text-muted-foreground leading-snug mt-0.5">
                  {s.text.charAt(0).toUpperCase() + s.text.slice(1)}.
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
