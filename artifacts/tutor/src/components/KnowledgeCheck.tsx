import React, { useState, useRef, useEffect } from "react";
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
import { ASSESSMENT, ASSESSMENT_PASS_RATIO } from "@/lib/course-assessment";
import { recordAttempt } from "@/lib/tutor-api";

interface Props {
  topicId: number;
  topicTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPass: () => void;
}

export function KnowledgeCheck({ topicId, topicTitle, open, onOpenChange, onPass }: Props) {
  const questions = ASSESSMENT[topicId] ?? TOPIC_META[topicId]?.check ?? [];
  const passThreshold = Math.max(1, Math.ceil(questions.length * ASSESSMENT_PASS_RATIO));
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const startRef = useRef<number>(Date.now());
  useEffect(() => { if (open) startRef.current = Date.now(); }, [open]);

  const handleSubmit = () => {
    const sc = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    void recordAttempt({ topicId, score: sc, total: questions.length, passed: sc >= passThreshold, durationSeconds });
    setSubmitted(true);
  };

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0,
  );
  const passed = submitted && correctCount >= passThreshold;

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
            {topicTitle}: score {Math.round(ASSESSMENT_PASS_RATIO * 100)}% or more ({passThreshold} of {questions.length}) to lock in this topic as mastered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {questions.map((q, qi) => (
            <div key={qi}>
              {q.scenario && (
                <div className="mb-3 rounded-lg border-l-2 border-accent bg-secondary/50 px-3 py-2 text-sm text-muted-foreground italic">
                  <span className="not-italic font-semibold text-foreground">Scenario. </span>
                  {q.scenario}
                </div>
              )}
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

        {submitted && passed && (
          <div className="hg-pop flex flex-col items-center gap-1 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="var(--marigold)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path className="hg-draw" d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-serif text-lg text-foreground">Topic mastered</p>
            <p className="text-xs text-muted-foreground">You reasoned this through. Well done.</p>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-2 pt-2 border-t border-border">
          <div className="text-sm min-w-0">
            {submitted && (
              <span className={passed ? "text-primary font-semibold" : "text-muted-foreground"}>
                {correctCount} / {questions.length} correct
                {passed ? ", well reasoned!" : `, you need ${passThreshold} to master. Review and try again.`}
              </span>
            )}
          </div>
          {!submitted ? (
            <Button
              disabled={!allAnswered}
              onClick={handleSubmit}
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
