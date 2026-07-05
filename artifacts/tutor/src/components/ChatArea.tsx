import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { CheckCircle2, Clock, Target, Award, Printer, ChevronDown, BookOpen, ArrowLeft, RotateCcw, Shuffle, Home } from "lucide-react";
import { useAppState, Message } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WelcomeScreen } from "./WelcomeScreen";
import { Paywall } from "./Paywall";
import { ScenarioPicker } from "./ScenarioPicker";
import { ScenarioArt } from "./ScenarioArt";
import { scenariosFor } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateTutorSession } from "@workspace/api-client-react";
import {
  streamTutorResponse,
  fetchTutorSession,
  completeTutorSession,
} from "@/lib/tutor-api";
import { TOPIC_META } from "@/lib/course-content";
import { LEVELS } from "@/lib/course-structure";
import { READINGS } from "@/lib/course-readings";
import { KnowledgeCheck } from "./KnowledgeCheck";

export function ChatArea() {
  const {
    level,
    setLevel,
    currentTopicIndex,
    sessions,
    setSessionState,
    busy,
    setBusy,
    incrementTotalExchanges,
    setMobileSidebarOpen,
    setCurrentTopicIndex,
    setAtLanding,
    hydrated,
    learnerName,
    country,
    currentUser,
    fullAccess,
    scenarioByTopic,
    setScenarioForTopic,
  } = useAppState();
  const firstName = (learnerName || currentUser?.name || "").trim().split(" ")[0];
  const scenarioTextFor = (topicId: number): string => {
    const sid = scenarioByTopic[topicId];
    return scenariosFor(topicId).find((x) => x.id === sid)?.text ?? "";
  };

  // Guards the programmatic level sync in loadSession from being treated as a
  // user-initiated level switch (which would restart the topic).
  const levelSyncRef = useRef(false);

  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createSessionMutation = useCreateTutorSession();

  const currentTopic = currentTopicIndex !== null ? TOPICS[currentTopicIndex] : null;
  const currentSession = currentTopicIndex !== null ? sessions[currentTopicIndex] : null;

  // Whether the learner has done at least one "understanding check" this session.
  const hasSynthesis = !!currentSession?.messages.some((m) => m.role === "synthesis");

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, streamingContent, isStreaming]);

  // Open a topic: resume its existing conversation (load history) if we have one,
  // otherwise start a fresh session. Gated on `hydrated` so we never create a
  // duplicate before the server's session list has loaded.
  useEffect(() => {
    if (currentTopicIndex === null || !hydrated || busy) return;
    // Don't start or resume a locked topic (paywalled); Topic 1 is always free.
    const t = TOPICS[currentTopicIndex];
    if (t && t.id !== 1 && !fullAccess) return;
    const s = sessions[currentTopicIndex];
    if (s?.conversationId) {
      if (!s.loaded) void loadSession(currentTopicIndex, s.conversationId);
    } else {
      // Wait for the learner to pick a scenario before starting a new session.
      if (scenariosFor(t.id).length > 0 && !scenarioByTopic[t.id]) return;
      void startSession(currentTopicIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopicIndex, hydrated, fullAccess, scenarioByTopic, currentSession?.conversationId, currentSession?.loaded]);

  // When the learner switches the caregiver level while a topic is open, restart
  // that topic at the new level so the tutor actually adapts. Programmatic syncs
  // from opening an existing session are skipped via levelSyncRef.
  useEffect(() => {
    if (levelSyncRef.current) {
      levelSyncRef.current = false;
      return;
    }
    if (currentTopicIndex === null || !hydrated || busy) return;
    const s = sessions[currentTopicIndex];
    if (s?.conversationId && s.loaded && s.level !== level) {
      void startSession(currentTopicIndex, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Stream the tutor's opening turn into the given session.
  const streamOpening = (topicIndex: number, conversationId: number, scenario = "") => {
    setIsStreaming(true);
    setStreamingContent("");
    return streamTutorResponse(
      conversationId,
      "[BEGIN SESSION]",
      "normal",
      (chunk) => setStreamingContent((prev) => prev + chunk),
      () => {
        setIsStreaming(false);
        setStreamingContent((latest) => {
          const message: Message = { role: "assistant", content: latest };
          setSessionState(topicIndex, (p) => ({
            ...p,
            messages: [...p.messages, message],
            loaded: true,
          }));
          return "";
        });
        setBusy(false);
      },
      firstName,
      country,
      scenario,
    );
  };

  const startSession = async (topicIndex: number, isRestart = false) => {
    if (busy) return;
    setBusy(true);
    try {
      const topic = TOPICS[topicIndex];

      if (isRestart) {
        setSessionState(topicIndex, (prev) => ({
          ...prev,
          messages: [...prev.messages, { role: "system", content: "Topic restarted" }],
        }));
      }

      const sessionData = await createSessionMutation.mutateAsync({
        data: { topicId: topic.id, level },
      });

      setSessionState(topicIndex, (prev) => ({
        ...prev,
        conversationId: sessionData.conversationId,
        // A restart begins a new conversation; reset exchanges but keep the
        // topic's mastery badge (it was earned on the prior run).
        exchanges: isRestart ? 0 : prev.exchanges,
        level,
        loaded: false,
      }));

      await streamOpening(topicIndex, sessionData.conversationId, scenarioTextFor(topic.id));
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  // Rehydrate a previously-created session's history from the server.
  const loadSession = async (topicIndex: number, conversationId: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const detail = await fetchTutorSession(conversationId);
      if (!detail) {
        setSessionState(topicIndex, (p) => ({ ...p, loaded: true }));
        setBusy(false);
        return;
      }
      const msgs: Message[] = detail.messages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : "assistant") as Message["role"],
        content: m.content,
      }));
      const sessionLevel = detail.level === "experienced" ? "experienced" : "new";
      // Keep the sidebar toggle honest: show the level THIS session runs at.
      if (sessionLevel !== level) {
        levelSyncRef.current = true;
        setLevel(sessionLevel);
      }
      setSessionState(topicIndex, (p) => ({
        ...p,
        messages: msgs,
        exchanges: detail.exchangeCount,
        completed: p.completed || detail.completed,
        level: sessionLevel,
        loaded: true,
      }));
      // Recover a session that was created but whose opening never landed.
      if (msgs.length === 0) {
        await streamOpening(topicIndex, conversationId, scenarioTextFor(TOPICS[topicIndex].id));
      } else {
        setBusy(false);
      }
    } catch (e) {
      console.error(e);
      setSessionState(topicIndex, (p) => ({ ...p, loaded: true }));
      setBusy(false);
    }
  };

  const handleSend = async (content: string, type: "normal" | "hint" | "stuck" | "synthesis" = "normal") => {
    if (busy || !currentSession?.conversationId || currentTopicIndex === null) return;
    if (!content.trim() && type === "normal") return;

    const topicIndex = currentTopicIndex;

    if (type === "normal") {
      setSessionState(topicIndex, (prev) => ({
        ...prev,
        messages: [...prev.messages, { role: "user", content }],
        exchanges: prev.exchanges + 1,
      }));
      setInput("");
      incrementTotalExchanges();
    }

    setBusy(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      await streamTutorResponse(
        currentSession.conversationId,
        content,
        type,
        (chunk) => setStreamingContent((prev) => prev + chunk),
        () => {
          setIsStreaming(false);
          setStreamingContent((latest) => {
            const role: Message["role"] = type === "synthesis" ? "synthesis" : "assistant";
            const message: Message = { role, content: latest };
            setSessionState(topicIndex, (p) => ({ ...p, messages: [...p.messages, message] }));
            return "";
          });
          setBusy(false);
        },
        firstName,
        country,
        scenarioTextFor(currentTopic?.id ?? -1),
      );
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  const finishMastery = async () => {
    if (!currentSession?.conversationId || currentTopicIndex === null || completing) return;
    setCompleting(true);
    const ok = await completeTutorSession(currentSession.conversationId);
    setCompleting(false);
    if (ok) {
      setSessionState(currentTopicIndex, (p) => ({ ...p, completed: true }));
      toast.success(`Topic mastered: ${currentTopic?.title ?? ""}`, {
        description: "Locked in. Your key takeaways are below \u2014 you can download a summary.",
      });
    } else {
      toast.error("Couldn't save that just now \u2014 please try again.");
    }
  };

  // Open a clean printable one-page summary the learner can save as PDF.
  const printSummary = () => {
    if (!currentTopic) return;
    const meta = TOPIC_META[currentTopic.id];
    const lvl = (currentSession?.level ?? level) === "experienced" ? "Experienced" : "New caregiver";
    const answers = (currentSession?.messages ?? [])
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .filter((c) => c && !c.startsWith("["));
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const li = (arr: string[]) => arr.map((x) => `<li>${esc(x)}</li>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Summary \u2014 ${esc(currentTopic.title)}</title>
    <style>
      @page { margin: 18mm; }
      body { font-family: Georgia, serif; color: #38221A; line-height: 1.55; max-width: 720px; margin: 0 auto; }
      .eyebrow { letter-spacing:.2em; text-transform:uppercase; font-size:11px; color:#B4531D; }
      h1 { font-size: 24px; margin: 4px 0 2px; color:#3E2318; }
      .meta { font-size: 12px; color:#7A6152; margin-bottom: 18px; }
      h2 { font-size: 15px; color:#B4531D; margin: 22px 0 6px; border-bottom:1px solid #EADBC8; padding-bottom:4px; }
      ul { margin: 6px 0; padding-left: 20px; } li { margin: 4px 0; }
      .foot { margin-top: 28px; font-size: 11px; color:#7A6152; border-top:1px solid #EADBC8; padding-top:8px; }
    </style></head><body>
      <div class="eyebrow">A Guide to Homecare \u2014 Topic summary</div>
      <h1>${esc(currentTopic.title)}</h1>
      <div class="meta">Mode: ${lvl} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString()}</div>
      ${meta ? `<h2>Learning objectives</h2><ul>${li(meta.objectives)}</ul>` : ""}
      ${meta ? `<h2>Key takeaways</h2><ul>${li(meta.takeaways)}</ul>` : ""}
      ${answers.length ? `<h2>In your own words</h2><ul>${li(answers)}</ul>` : ""}
      <div class="foot">Grounded in "A Guide to Homecare" by Dorothy Mooka. For education only \u2014 not medical advice.</div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
    else { window.alert("Please allow pop-ups for this site to open and download the summary."); }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input, "normal");
    }
  };

  // Clear the chosen scenario and reset the session so the picker reappears.
  const switchScenario = () => {
    if (currentTopicIndex === null || !currentTopic) return;
    if (window.confirm("Switch to a different situation? This starts the topic again with a new scenario.")) {
      setScenarioForTopic(currentTopic.id, null);
      setSessionState(currentTopicIndex, (p) => ({ ...p, conversationId: null, messages: [], loaded: false, exchanges: 0 }));
    }
  };

  if (!currentTopic) {
    return <WelcomeScreen />;
  }

  // Trial gate: Topic 1 is free; every other topic needs full access.
  if (currentTopic.id !== 1 && !fullAccess) {
    return <Paywall />;
  }

  // Scenario choice: let the learner pick a situation before the lesson starts.
  const topicScenarios = scenariosFor(currentTopic.id);
  const chosenScenario = topicScenarios.find((s) => s.id === scenarioByTopic[currentTopic.id]) ?? null;
  const hasSession = !!currentSession?.conversationId;
  if (topicScenarios.length > 0 && !chosenScenario && !hasSession) {
    return (
      <ScenarioPicker
        topicId={currentTopic.id}
        topicTitle={currentTopic.title}
        onPick={(s) => setScenarioForTopic(currentTopic.id, s.id)}
      />
    );
  }
  const scenarioText = chosenScenario?.text ?? currentTopic.launch;

  const isCompleted = !!currentSession?.completed;
  const meta = TOPIC_META[currentTopic.id];
  const topicPosition = (currentTopicIndex ?? 0) + 1;
  const currentModule = LEVELS.find((lv) => lv.topicIds.includes(currentTopic.id));

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative overflow-hidden">
      <div className="px-4 sm:px-8 py-2 border-b border-border bg-background z-10 shrink-0">
        <div className="flex items-start gap-3 max-w-3xl mx-auto w-full">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 -ml-2 mt-0.5"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 mt-0.5"
            onClick={() => { setAtLanding(true); setCurrentTopicIndex(null); }}
            aria-label="Home"
            title="Back to the homepage"
          >
            <Home className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 mb-2">
              <button
                onClick={() => setCurrentTopicIndex(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="sm:hidden">Back</span>
                <span className="hidden sm:inline">Back to roadmap</span>
              </button>
              <div className="flex items-center gap-3">
                {topicScenarios.length > 0 && (
                  <button
                    onClick={switchScenario}
                    disabled={busy}
                    title="Choose a different situation for this topic"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="sm:hidden">Switch</span>
                    <span className="hidden sm:inline">Switch scenario</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentTopicIndex === null) return;
                    if (window.confirm("Restart this lesson from the beginning? Your current conversation for this topic will be cleared and Nurse Mooka will start again.")) {
                      startSession(currentTopicIndex, true);
                    }
                  }}
                  disabled={busy}
                  title="Start this lesson over from the beginning"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Restart</span>
                  <span className="hidden sm:inline">Restart lesson</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap mb-1 text-xs font-semibold text-muted-foreground">
              {currentModule && (
                <>
                  <span className="uppercase tracking-wider text-primary">Module {currentModule.level} · {currentModule.name}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span className="uppercase tracking-wider">Topic {topicPosition} of {TOPICS.length}</span>
              <span aria-hidden>·</span>
              <span>{(currentSession?.level ?? level) === "experienced" ? "Experienced" : "New caregiver"}</span>
              {country && (
                <>
                  <span aria-hidden>·</span>
                  <span>{country}</span>
                </>
              )}
              {meta && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> ~{meta.estMinutes} min</span>
                </>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-accent"><CheckCircle2 className="w-3.5 h-3.5" /> Mastered</span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-serif text-foreground leading-tight">
              {currentTopic.title}
            </h2>

            {[7, 8, 9, 10].includes(currentTopic.id) && (
              <div className="mt-2 space-y-1.5 max-w-3xl">
                <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-foreground flex gap-2">
                  <span aria-hidden>⚠️</span>
                  <span><b>A quick safety note.</b> This guide helps you prepare and learn, it does not replace a doctor, nurse, or emergency care. If you are unsure about a procedure, or the person seems unwell, contact a health professional. When in doubt, ask.</span>
                </div>
                {[7, 9, 10].includes(currentTopic.id) && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-foreground flex gap-2">
                    <span aria-hidden>🚨</span>
                    <span><b className="text-destructive">Get emergency help now</b> if the person has any of these: trouble breathing, ongoing chest pain, blood in their spit, new confusion, a blue or grey tinge to the lips, gums, tongue, palms or nail beds, or signs of sepsis (confusion, fast breathing, shaking, or a temperature of 37.8°C or higher). Do not wait, call for professional medical help straight away.</span>
                  </div>
                )}
                {currentTopic.id === 8 && (
                  <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-foreground flex gap-2">
                    <span aria-hidden>👐</span>
                    <span><b>Before hands-on care:</b> wash your hands and wear gloves. Always tell the person what you are about to do and get their agreement first. If a task feels unsafe for you or them, for example lifting, stop and ask a home-care nurse to show you.</span>
                  </div>
                )}
              </div>
            )}
            {/* Compact, always-visible scenario. Collapsed shows one line; click to expand the full text. */}
            <button
              onClick={() => setShowScenario((v) => !v)}
              aria-expanded={showScenario}
              className="mt-2 w-full max-w-3xl text-left rounded-lg border-l-4 border-accent bg-accent/10 px-3 py-1.5 flex items-center gap-2 hover:bg-accent/15 transition-colors"
            >
              {chosenScenario && <ScenarioArt art={chosenScenario.art} size="sm" />}
              <span className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                  Scenario{chosenScenario ? ` · ${chosenScenario.title}` : ""}
                </span>
                <span className={cn("block text-sm text-foreground leading-snug", !showScenario && "truncate")}>
                  {scenarioText.charAt(0).toUpperCase() + scenarioText.slice(1)}.
                </span>
              </span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", showScenario && "rotate-180")} />
            </button>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {meta && (
                <button
                  onClick={() => setShowObjectives((v) => !v)}
                  aria-expanded={showObjectives}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border px-3 py-1 transition-colors",
                    showObjectives
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/40 text-primary hover:bg-primary/5",
                  )}
                >
                  <Target className="w-3.5 h-3.5" />
                  Objectives ({meta.objectives.length})
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showObjectives && "rotate-180")} />
                </button>
              )}
              {READINGS[currentTopic.id] && (
                <button
                  onClick={() => setReadingOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-border px-3 py-1 text-secondary-foreground hover:bg-secondary transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read the chapter
                </button>
              )}
            </div>
            {showObjectives && meta && (
              <ul className="mt-2 space-y-1 pl-1 max-w-3xl">
                {meta.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="hg-scroll flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-5">
       <div className="max-w-3xl mx-auto w-full space-y-4">
        {currentSession?.messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} youLabel={firstName || "You"} />
        ))}
        {isStreaming && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreamingActive={true}
          />
        )}
        {isCompleted && meta && (
          <div className="mr-auto max-w-[85%] bg-accent/5 border border-accent/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="font-serif text-lg text-foreground">Key takeaways</span>
            </div>
            <ul className="space-y-2 mb-4">
              {meta.takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mb-2">
              Save a printable one-page recap of this topic, its objectives and these key takeaways, as a PDF.
            </p>
            <Button variant="secondary" size="sm" onClick={printSummary}>
              <Printer className="w-4 h-4 mr-2" /> Download 1-page summary (PDF)
            </Button>
          </div>
        )}
       </div>
      </div>

      <div className="px-4 sm:px-8 py-3 bg-background border-t border-border">
       <div className="max-w-3xl mx-auto w-full">
        {/* Contextual next step: the knowledge check only appears once the learner
            has done an understanding check, so it never clutters the first attempt. */}
        {!isCompleted && hasSynthesis && (
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
            <span className="text-sm text-foreground">Nice reasoning. Ready to lock this topic in?</span>
            <Button
              size="sm"
              disabled={busy || completing || !currentSession?.conversationId}
              onClick={() => setCheckOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Take the knowledge check
            </Button>
          </div>
        )}

        {/* The composer is the primary action */}
        <div className="flex items-end gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy || !currentSession?.conversationId}
            placeholder="Type your answer to Nurse Mooka here, then press Enter..."
            className="min-h-[72px] max-h-[200px] resize-none border-border focus-visible:ring-primary text-base"
          />
          <Button
            onClick={() => handleSend(input, "normal")}
            disabled={busy || !input.trim() || !currentSession?.conversationId}
            className="mb-1 shrink-0 h-10 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send
          </Button>
        </div>

        {/* Quiet assist affordances, subordinate to the composer */}
        {isCompleted ? (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            You have mastered this topic. Keep exploring with Nurse Mooka, or pick your next topic from the roadmap.
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Enter to send, Shift+Enter for a new line.</span>
            <span className="hidden sm:inline text-border" aria-hidden>·</span>
            <span>Stuck?</span>
            <button
              disabled={busy || !currentSession?.conversationId}
              onClick={() => handleSend("[HINT]", "hint")}
              className="font-semibold text-primary hover:underline disabled:opacity-40"
            >
              Give a hint
            </button>
            <span className="text-border" aria-hidden>·</span>
            <button
              disabled={busy || !currentSession?.conversationId}
              onClick={() => handleSend("[SIMPLIFY]", "stuck")}
              className="font-semibold text-primary hover:underline disabled:opacity-40"
            >
              Simplify
            </button>
            <span className="text-border" aria-hidden>·</span>
            <button
              disabled={busy || !currentSession?.conversationId}
              onClick={() => handleSend("[SYNTHESIS]", "synthesis")}
              className="font-semibold text-primary hover:underline disabled:opacity-40"
              title="Get a recap of your reasoning so far, then unlock the knowledge check"
            >
              Check my understanding
            </button>
          </div>
        )}
       </div>
      </div>

      <Sheet open={readingOpen} onOpenChange={setReadingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-serif text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Read the chapter
            </SheetTitle>
          </SheetHeader>
          <p className="text-xs text-muted-foreground italic mt-1 mb-4">from A Guide to Homecare</p>
          {READINGS[currentTopic.id] && <MarkdownContent content={READINGS[currentTopic.id]} />}
        </SheetContent>
      </Sheet>

      <KnowledgeCheck
        topicId={currentTopic.id}
        topicTitle={currentTopic.title}
        open={checkOpen}
        onOpenChange={setCheckOpen}
        onPass={finishMastery}
      />
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/**
 * Renders tutor output as markdown. Assistant messages routinely contain bold
 * terms, numbered steps and emphasis; rendering them (rather than showing raw
 * `**` and `1.`) makes the Socratic questions far more scannable.
 */
function MarkdownContent({ content }: { content: string }) {
  // Guarantee no em dashes in displayed text, regardless of model output or older stored messages.
  const clean = content.replace(/ \u2014 /g, ", ").replace(/\u2014/g, ", ");
  return (
    <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-serif prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary text-base leading-relaxed dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{clean}</ReactMarkdown>
    </div>
  );
}

function MessageBubble({ message, isStreamingActive, youLabel = "You" }: { message: Message; isStreamingActive?: boolean; youLabel?: string }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-accent/10 text-foreground text-xs py-1 px-3 rounded-full font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isSynthesis = message.role === "synthesis";

  return (
    <div className={cn("flex flex-col max-w-[85%]", isUser ? "ml-auto items-end" : "mr-auto items-start")}>
      <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
        {isUser ? youLabel : isSynthesis ? "Understanding check" : "Nurse Mooka"}
      </span>
      <div
        className={cn(
          "px-5 py-4 rounded-2xl text-base leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-card-foreground shadow-sm rounded-tl-sm border border-border",
          !isUser && !isSynthesis && "border-l-4 border-l-primary",
          isSynthesis && "border-l-4 border-l-accent bg-accent/5"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <MarkdownContent content={message.content} />
        )}
        {isStreamingActive && (
          <div className="flex gap-1 mt-2 h-2 items-center opacity-50">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}
