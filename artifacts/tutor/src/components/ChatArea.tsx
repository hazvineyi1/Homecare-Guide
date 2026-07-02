import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useAppState, Message } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WelcomeScreen } from "./WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTutorSession } from "@workspace/api-client-react";
import {
  streamTutorResponse,
  fetchTutorSession,
  completeTutorSession,
} from "@/lib/tutor-api";

export function ChatArea() {
  const {
    level,
    currentTopicIndex,
    sessions,
    setSessionState,
    busy,
    setBusy,
    incrementTotalExchanges,
    setMobileSidebarOpen,
    hydrated,
  } = useAppState();

  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [completing, setCompleting] = useState(false);
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
    const s = sessions[currentTopicIndex];
    if (s?.conversationId) {
      if (!s.loaded) void loadSession(currentTopicIndex, s.conversationId);
    } else {
      void startSession(currentTopicIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopicIndex, hydrated, currentSession?.conversationId, currentSession?.loaded]);

  // Stream the tutor's opening turn into the given session.
  const streamOpening = (topicIndex: number, conversationId: number) => {
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
      }
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
        loaded: false,
      }));

      await streamOpening(topicIndex, sessionData.conversationId);
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
      setSessionState(topicIndex, (p) => ({
        ...p,
        messages: msgs,
        exchanges: detail.exchangeCount,
        completed: p.completed || detail.completed,
        loaded: true,
      }));
      // Recover a session that was created but whose opening never landed.
      if (msgs.length === 0) {
        await streamOpening(topicIndex, conversationId);
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
        }
      );
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    if (!currentSession?.conversationId || currentTopicIndex === null || completing) return;
    setCompleting(true);
    const ok = await completeTutorSession(currentSession.conversationId);
    setCompleting(false);
    if (ok) {
      setSessionState(currentTopicIndex, (p) => ({ ...p, completed: true }));
      toast.success(`Topic mastered: ${currentTopic?.title ?? ""}`, {
        description: "Locked in. Your reasoning on this topic is saved.",
      });
    } else {
      toast.error("Couldn't save that just now — please try again.");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input, "normal");
    }
  };

  if (!currentTopic) {
    return <WelcomeScreen />;
  }

  const isCompleted = !!currentSession?.completed;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative overflow-hidden">
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-border bg-background z-10">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden shrink-0 -ml-2 mt-0.5"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open topics menu"
          >
            <MenuIcon />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Topic {currentTopic.id.toString().padStart(2, "0")}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground bg-accent/15 border border-accent/30 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-foreground leading-tight mb-2">
              {currentTopic.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Scenario: {currentTopic.launch}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {currentSession?.messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {isStreaming && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreamingActive={true}
          />
        )}
      </div>

      <div className="px-4 sm:px-8 py-4 bg-background border-t border-border">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy || !currentSession?.conversationId}
            onClick={() => handleSend("[HINT]", "hint")}
            className="text-secondary-foreground hover:bg-secondary/80"
          >
            Give me a hint
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy || !currentSession?.conversationId}
            onClick={() => handleSend("[SIMPLIFY]", "stuck")}
            className="text-secondary-foreground hover:bg-secondary/80"
          >
            I'm stuck, simplify
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !currentSession?.conversationId}
            onClick={() => handleSend("[SYNTHESIS]", "synthesis")}
            className="border-accent text-accent-foreground bg-accent/10 hover:bg-accent/20"
          >
            Check my understanding
          </Button>
          {!isCompleted && (
            <Button
              variant="default"
              size="sm"
              disabled={busy || completing || !currentSession?.conversationId || !hasSynthesis}
              onClick={handleComplete}
              title={hasSynthesis ? "Lock in this topic as mastered" : "Run 'Check my understanding' first"}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {completing ? "Saving…" : "Mark as mastered"}
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => currentTopicIndex !== null && startSession(currentTopicIndex, true)}
            className="text-muted-foreground"
          >
            Restart topic
          </Button>
        </div>

        <div className="relative flex items-end gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy || !currentSession?.conversationId}
            placeholder="Type your response..."
            className="min-h-[80px] max-h-[200px] resize-none border-border focus-visible:ring-primary text-base"
          />
          <Button
            onClick={() => handleSend(input, "normal")}
            disabled={busy || !input.trim() || !currentSession?.conversationId}
            className="mb-1 shrink-0 h-10 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send
          </Button>
        </div>

        <div className="text-center mt-3 text-xs text-muted-foreground">
          {hasSynthesis && !isCompleted
            ? "Ready? Lock in this topic with “Mark as mastered.”"
            : "Enter to send · Shift+Enter for new line · The tutor asks one question at a time"}
        </div>
      </div>
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
  return (
    <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-serif prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-primary text-[15px] leading-relaxed dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function MessageBubble({ message, isStreamingActive }: { message: Message; isStreamingActive?: boolean }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-accent/10 text-accent-foreground text-xs py-1 px-3 rounded-full font-medium">
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
        {isUser ? "You" : isSynthesis ? "Understanding check" : "Socratic tutor"}
      </span>
      <div
        className={cn(
          "px-5 py-4 rounded-2xl text-[15px] leading-relaxed",
          isUser
            ? "bg-sidebar text-sidebar-foreground rounded-tr-sm"
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
