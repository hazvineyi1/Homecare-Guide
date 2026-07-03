import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AppStateProvider, useAppState, HydratedSession } from "@/hooks/use-app-state";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { TOPICS } from "@/lib/constants";
import { fetchTutorSessions } from "@/lib/tutor-api";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function MainLayout() {
  const { mobileSidebarOpen, setMobileSidebarOpen, hydrateSessions } = useAppState();

  // Rehydrate the sidebar + resumable topics from the server on first load, so
  // reloading the tab doesn't lose the learner's place.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const summaries = await fetchTutorSessions();
      if (cancelled) return;

      // Group by topic: the active conversation is the most recent one, and a
      // topic is "mastered" if any of its sessions was completed.
      const byTopic = new Map<number, HydratedSession & { createdAt: string }>();
      for (const s of summaries) {
        const topicIndex = TOPICS.findIndex((t) => t.id === s.topicId);
        if (topicIndex < 0) continue;
        const prev = byTopic.get(topicIndex);
        const isNewer = !prev || s.createdAt > prev.createdAt;
        byTopic.set(topicIndex, {
          topicIndex,
          conversationId: isNewer ? s.conversationId : prev!.conversationId,
          exchanges: isNewer ? s.exchangeCount : prev!.exchanges,
          completed: (prev?.completed ?? false) || s.completed,
          level: isNewer ? (s.level === "experienced" ? "experienced" : "new") : prev!.level,
          createdAt: isNewer ? s.createdAt : prev!.createdAt,
        });
      }
      hydrateSessions([...byTopic.values()].map(({ createdAt, ...rest }) => rest));
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateSessions]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop: persistent sidebar column */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile: sidebar in a slide-in drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-[320px] bg-sidebar border-sidebar-accent">
          <SheetTitle className="sr-only">Dialogue topics</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <ChatArea />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;
