import React, { useState, useEffect, useRef } from "react";
import { useAppState, Message } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WelcomeScreen } from "./WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTutorSession } from "@workspace/api-client-react";
import { streamTutorResponse } from "@/lib/tutor-api";

export function ChatArea() {
  const {
    level,
    currentTopicIndex,
    sessions,
    setSessionState,
    busy,
    setBusy,
    incrementTotalExchanges
  } = useAppState();

  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const createSessionMutation = useCreateTutorSession();

  const currentTopic = currentTopicIndex !== null ? TOPICS[currentTopicIndex] : null;
  const currentSession = currentTopicIndex !== null ? sessions[currentTopicIndex] : null;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, streamingContent, isStreaming]);

  // Start session if empty
  useEffect(() => {
    if (currentTopicIndex !== null && !currentSession?.conversationId && !busy) {
      startSession(currentTopicIndex);
    }
  }, [currentTopicIndex, currentSession?.conversationId]);

  const startSession = async (topicIndex: number, isRestart = false) => {
    if (busy) return;
    setBusy(true);
    try {
      const topic = TOPICS[topicIndex];
      
      if (isRestart) {
        setSessionState(topicIndex, (prev) => ({
          ...prev,
          messages: [...prev.messages, { role: "system", content: "Topic restarted" }]
        }));
      }

      const sessionData = await createSessionMutation.mutateAsync({
        data: {
          topicId: topic.id,
          level
        }
      });

      setSessionState(topicIndex, (prev) => ({
        ...prev,
        conversationId: sessionData.conversationId
      }));

      setIsStreaming(true);
      setStreamingContent("");

      await streamTutorResponse(
        sessionData.conversationId,
        "[BEGIN SESSION]",
        "normal",
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          setSessionState(topicIndex, (prev) => {
            const finalContent = setStreamingContent((latestContent) => {
              const updatedMessages = [...prev.messages, { role: "assistant", content: latestContent }];
              setSessionState(topicIndex, (p) => ({ ...p, messages: updatedMessages }));
              return "";
            });
            return prev;
          });
          setBusy(false);
        }
      );

    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  const handleSend = async (content: string, type: "normal" | "hint" | "stuck" | "synthesis" = "normal") => {
    if (busy || !currentSession?.conversationId || !currentTopicIndex) return;
    if (!content.trim() && type === "normal") return;

    const topicIndex = currentTopicIndex;
    
    if (type === "normal") {
      setSessionState(topicIndex, (prev) => ({
        ...prev,
        messages: [...prev.messages, { role: "user", content }],
        exchanges: prev.exchanges + 1
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
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          setSessionState(topicIndex, (prev) => {
            setStreamingContent((latestContent) => {
              const role = type === "synthesis" ? "synthesis" : "assistant";
              const updatedMessages = [...prev.messages, { role, content: latestContent }];
              setSessionState(topicIndex, (p) => ({ ...p, messages: updatedMessages }));
              return "";
            });
            return prev;
          });
          setBusy(false);
        }
      );
    } catch (e) {
      console.error(e);
      setBusy(false);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <div className="px-8 py-6 border-b border-border bg-background z-10">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Topic {currentTopic.id.toString().padStart(2, "0")}
        </div>
        <h2 className="text-3xl font-serif text-foreground leading-tight mb-2">
          {currentTopic.title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Scenario: {currentTopic.launch}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
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

      <div className="px-8 py-4 bg-background border-t border-border">
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
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={busy}
            onClick={() => startSession(currentTopicIndex, true)}
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
            className="mb-1 shrink-0 h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send
          </Button>
        </div>
        
        <div className="text-center mt-3 text-xs text-muted-foreground">
          Enter to send &middot; Shift+Enter for new line &middot; The tutor asks one question at a time
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isStreamingActive }: { message: Message, isStreamingActive?: boolean }) {
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
        <div className="whitespace-pre-wrap">{message.content}</div>
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
