import React from "react";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
  const { setCurrentTopicIndex } = useAppState();

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-foreground mb-4">
            Welcome to the Socratic Homecare Tutor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This space is designed to help you explore and prepare for family caregiving.
            Select a topic below to begin a guided dialogue grounded in real-world scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic, index) => (
            <button
              key={topic.id}
              onClick={() => setCurrentTopicIndex(index)}
              className="bg-card text-left p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col group h-full"
            >
              <div className="text-xs font-bold text-muted-foreground mb-2 group-hover:text-primary transition-colors">
                TOPIC {topic.id.toString().padStart(2, "0")}
              </div>
              <h3 className="font-serif text-lg text-foreground mb-3 leading-snug">
                {topic.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">
                {topic.launch}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
