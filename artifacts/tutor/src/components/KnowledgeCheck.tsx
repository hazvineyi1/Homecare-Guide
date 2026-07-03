import React, { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOPIC_META } from "@/lib/course-content";

interface Props {
  topicId: number;
  topicTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPass: () => void;
}

export function KnowledgeCheck({ topicId, topicTitle, open, onOpenChange, onPass }: Props) {
  const questions = TOPIC_META[topicId]?.check ?? [];
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0,
  );
  const passed = submitted && correctCount === questions.length;

  const reset = () => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Knowledge check</DialogTitle>
          <DialogDescription>
            {topicTitle} — answer both to lock in this topic as mastered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium text-foreground mb-3">
                {qi + 1}. {q.q}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const isCorrect = q.answer === oi;
                  const showState = submitted && (chosen || isCorrect);
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                      }
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors flex items-start gap-2",
                        !submitted && chosen && "border-primary bg-primary/10",
                        !submitted && !chosen && "border-border hover:bg-secondary",
                        showState && isCorrect && "border-primary bg-primary/10 text-foreground",
                        submitted && chosen && !isCorrect && "border-destructive bg-destructive/10",
                        submitted && !chosen && !isCorrect && "border-border opacity-70",
                      )}
                    >
                      {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                      {submitted && chosen && !isCorrect && <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="text-xs text-muted-foreground mt-2 pl-1">{q.why}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="text-sm">
            {submitted && (
              <span className={passed ? "text-primary font-semibold" : "text-muted-foreground"}>
                {correctCount} / {questions.length} correct
                {passed ? " — well reasoned!" : " — review and try again."}
              </span>
            )}
          </div>
          {!submitted ? (
            <Button
              disabled={!allAnswered}
              onClick={() => setSubmitted(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit
            </Button>
          ) : passed ? (
            <Button
              onClick={() => {
                onPass();
                onOpenChange(false);
                reset();
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Lock in mastery
            </Button>
          ) : (
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
