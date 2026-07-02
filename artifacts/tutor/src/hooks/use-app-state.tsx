import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Message {
  role: "user" | "assistant" | "system" | "synthesis";
  content: string;
}

export interface SessionState {
  messages: Message[];
  exchanges: number;
  conversationId: number | null;
}

export type Level = "new" | "experienced";

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
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [level, setLevel] = useState<Level>("new");
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Record<number, SessionState>>({});
  const [busy, setBusy] = useState(false);
  const [totalExchanges, setTotalExchanges] = useState(0);

  const setSessionState = useCallback((topicIndex: number, updater: (prev: SessionState) => SessionState) => {
    setSessions((prev) => {
      const existing = prev[topicIndex] || { messages: [], exchanges: 0, conversationId: null };
      return { ...prev, [topicIndex]: updater(existing) };
    });
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
