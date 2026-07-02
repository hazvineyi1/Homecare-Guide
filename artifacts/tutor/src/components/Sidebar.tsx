import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const {
    level, setLevel,
    currentTopicIndex, setCurrentTopicIndex,
    sessions,
    setMobileSidebarOpen,
  } = useAppState();

  const sessionValues = Object.values(sessions);
  const startedTopicsCount = sessionValues.filter((s) => s.conversationId).length;
  const masteredCount = sessionValues.filter((s) => s.completed).length;

  return (
    <div className="w-full md:w-[300px] h-full bg-sidebar md:border-r border-sidebar-accent flex flex-col shrink-0">
      <div className="p-6 pb-4">
        <h1 className="text-sidebar-foreground text-2xl font-serif mb-1 leading-tight">
          Socratic Homecare Tutor
        </h1>
        <p className="text-sidebar-foreground/70 text-xs tracking-wide">
          AI-guided inquiry &middot; grounded in A Guide to Homecare
        </p>
      </div>

      <div className="px-6 mb-6">
        <div className="flex bg-sidebar-accent/20 rounded-md p-1">
          <button
            onClick={() => setLevel("new")}
            className={cn(
              "flex-1 py-1.5 text-sm rounded-sm font-medium transition-colors",
              level === "new" ? "bg-accent text-accent-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            New caregiver
          </button>
          <button
            onClick={() => setLevel("experienced")}
            className={cn(
              "flex-1 py-1.5 text-sm rounded-sm font-medium transition-colors",
              level === "experienced" ? "bg-accent text-accent-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            Experienced
          </button>
        </div>
      </div>

      <div className="px-6 pb-2 flex items-baseline justify-between">
        <h2 className="text-xs uppercase tracking-wider text-sidebar-foreground/50 font-bold">
          Dialogue topics
        </h2>
        <span className="text-xs text-sidebar-foreground/50 font-medium">
          {masteredCount}/12 mastered
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {TOPICS.map((topic, index) => {
          const isActive = currentTopicIndex === index;
          const session = sessions[index];
          const isCompleted = !!session?.completed;
          const progress = Math.min(5, Math.floor((session?.exchanges || 0) / 2));

          return (
            <button
              key={topic.id}
              onClick={() => {
                setCurrentTopicIndex(index);
                setMobileSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors",
                isActive ? "bg-sidebar-primary/20 text-sidebar-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
              )}
            >
              <span className="font-serif text-sidebar-foreground/40 text-sm mt-0.5 w-5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" aria-label="Mastered" />
                ) : (
                  topic.id.toString().padStart(2, "0")
                )}
              </span>
              <div className="flex-1">
                <div className={cn("text-sm font-medium leading-snug mb-2", isCompleted && "text-sidebar-foreground")}>
                  {topic.title}
                </div>
                {isCompleted ? (
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                    Mastered
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          i < progress ? "bg-accent" : "bg-sidebar-accent/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-sidebar-accent/30 bg-sidebar-accent/5">
        <div className="text-xs text-sidebar-foreground/60 flex flex-col gap-1">
          <div>Exchanges this topic: {sessions[currentTopicIndex ?? -1]?.exchanges || 0}</div>
          <div>Mastered {masteredCount} &middot; Explored {startedTopicsCount} of 12</div>
        </div>
      </div>
    </div>
  );
}
