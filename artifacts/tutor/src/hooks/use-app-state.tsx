import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { AuthUser } from "@/lib/tutor-api";

export interface Message {
  role: "user" | "assistant" | "system" | "synthesis";
  content: string;
}

export interface SessionState {
  messages: Message[];
  exchanges: number;
  conversationId: number | null;
  completed: boolean;
  // The caregiver level this session was created with (fixed per session).
  level: Level;
  // Whether the full message history has been loaded from the server. A session
  // rehydrated from the summary list starts `loaded: false` until opened.
  loaded: boolean;
}

export type Level = "new" | "experienced";

const emptySession = (): SessionState => ({
  messages: [],
  exchanges: 0,
  conversationId: null,
  completed: false,
  loaded: false,
  level: "new",
});

export interface HydratedSession {
  topicIndex: number;
  conversationId: number;
  exchanges: number;
  completed: boolean;
  level: Level;
}

interface AppState {
  level: Level;
  setLevel: (level: Level) => void;
  currentTopicIndex: number | null;
  setCurrentTopicIndex: (index: number | null) => void;
  sessions: Record<number, SessionState>;
  setSessionState: (topicIndex: number, updater: (prev: SessionState) => SessionState) => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  totalExchanges: number;
  incrementTotalExchanges: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  hydrated: boolean;
  hydrateSessions: (records: HydratedSession[]) => void;
  learnerName: string;
  setLearnerName: (name: string) => void;
  country: string;
  setCountry: (country: string) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (u: AuthUser | null) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  teamOpen: boolean;
  setTeamOpen: (open: boolean) => void;
  pwOpen: boolean;
  setPwOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  fullAccess: boolean;
  setFullAccess: (v: boolean) => void;
  atLanding: boolean;
  setAtLanding: (v: boolean) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [level, setLevel] = useState<Level>("new");
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Record<number, SessionState>>({});
  const [busy, setBusy] = useState(false);
  const [totalExchanges, setTotalExchanges] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  // Defaults to true because the paywall is currently disabled server-side
  // (see PAYWALL_ENABLED in billing.ts). Set back to false if re-enabling.
  const [fullAccess, setFullAccess] = useState(true);
  const [atLanding, setAtLanding] = useState(true);
  const [learnerName, setLearnerNameState] = useState<string>(() => {
    try {
      return localStorage.getItem("hg_learner_name") ?? "";
    } catch {
      return "";
    }
  });
  const setLearnerName = useCallback((name: string) => {
    setLearnerNameState(name);
    try {
      localStorage.setItem("hg_learner_name", name);
    } catch {
      /* ignore */
    }
  }, []);
  const [country, setCountryState] = useState<string>(() => {
    try {
      return localStorage.getItem("hg_country") ?? "";
    } catch {
      return "";
    }
  });
  const setCountry = useCallback((c: string) => {
    setCountryState(c);
    try {
      localStorage.setItem("hg_country", c);
    } catch {
      /* ignore */
    }
  }, []);
  const [onboarded, setOnboardedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem("hg_onboarded") === "1";
    } catch {
      return false;
    }
  });
  const setOnboarded = useCallback((v: boolean) => {
    setOnboardedState(v);
    try {
      localStorage.setItem("hg_onboarded", v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const setSessionState = useCallback((topicIndex: number, updater: (prev: SessionState) => SessionState) => {
    setSessions((prev) => {
      const existing = prev[topicIndex] || emptySession();
      return { ...prev, [topicIndex]: updater(existing) };
    });
  }, []);

  const hydrateSessions = useCallback((records: HydratedSession[]) => {
    setSessions((prev) => {
      const next = { ...prev };
      let total = 0;
      for (const r of records) {
        next[r.topicIndex] = {
          ...(next[r.topicIndex] || emptySession()),
          conversationId: r.conversationId,
          exchanges: r.exchanges,
          completed: r.completed,
          level: r.level,
          loaded: false,
        };
        total += r.exchanges;
      }
      setTotalExchanges((t) => t + total);
      return next;
    });
    setHydrated(true);
  }, []);

  const incrementTotalExchanges = useCallback(() => {
    setTotalExchanges((prev) => prev + 1);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        level,
        setLevel,
        currentTopicIndex,
        setCurrentTopicIndex,
        sessions,
        setSessionState,
        busy,
        setBusy,
        totalExchanges,
        incrementTotalExchanges,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        hydrated,
        hydrateSessions,
        learnerName,
        setLearnerName,
        country,
        setCountry,
        currentUser,
        setCurrentUser,
        authOpen,
        setAuthOpen,
        teamOpen,
        setTeamOpen,
        pwOpen,
        setPwOpen,
        settingsOpen,
        setSettingsOpen,
        adminOpen,
        setAdminOpen,
        fullAccess,
        setFullAccess,
        atLanding,
        setAtLanding,
        onboarded,
        setOnboarded,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
