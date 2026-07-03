export const streamTutorResponse = async (
  conversationId: number,
  content: string,
  messageType: string,
  onChunk: (text: string) => void,
  onDone: () => void
) => {
  const response = await fetch(`/api/tutor/sessions/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, messageType }),
  });
  
  if (!response.body) {
    onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) {
            onDone();
            return;
          }
          if (data.content) {
            onChunk(data.content);
          }
        } catch (e) {
          console.error("Error parsing SSE JSON", e);
        }
      }
    }
  }
  onDone();
};

export interface TutorSessionSummary {
  conversationId: number;
  topicId: number;
  topicTitle: string;
  level: string;
  exchangeCount: number;
  messageCount: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface TutorMessageRecord {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface TutorSessionDetail {
  conversationId: number;
  topicId: number;
  topicTitle: string;
  level: string;
  completed: boolean;
  completedAt: string | null;
  exchangeCount: number;
  messages: TutorMessageRecord[];
}

// List the current owner's tutor sessions (for rehydration after a reload).
export const fetchTutorSessions = async (): Promise<TutorSessionSummary[]> => {
  try {
    const res = await fetch("/api/tutor/sessions", { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.sessions) ? data.sessions : [];
  } catch {
    return [];
  }
};

// Load a single session's full (rehydrated) history.
export const fetchTutorSession = async (id: number): Promise<TutorSessionDetail | null> => {
  try {
    const res = await fetch(`/api/tutor/sessions/${id}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as TutorSessionDetail;
  } catch {
    return null;
  }
};

// Mark a topic as mastered.
export const completeTutorSession = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`/api/tutor/sessions/${id}/complete`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
};

// ---- Accounts, attempts, certificates (Phase 1) ----
export interface AuthUser { id: string; email: string; name: string; }

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data } as { ok: boolean; status: number; data: any };
}

export const fetchMe = async (): Promise<AuthUser | null> => {
  try {
    const res = await fetch("/api/auth/me", { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
};

export const signup = (email: string, name: string, password: string) =>
  postJson("/api/auth/signup", { email, name, password });
export const login = (email: string, password: string) =>
  postJson("/api/auth/login", { email, password });
export const logout = () => postJson("/api/auth/logout");

export const recordAttempt = (a: {
  topicId: number; score: number; total: number; passed: boolean; durationSeconds: number;
}) => postJson("/api/tutor/attempts", a);

export interface CertificateRecord {
  id: string; code: string; learnerName: string; masteredCount: number; issuedAt: string;
}
export const issueCertificate = () => postJson("/api/certificate");

export interface VerifyResult {
  valid: boolean; code?: string; learnerName?: string; course?: string;
  masteredCount?: number; issuedAt?: string;
}
export const verifyCertificate = async (code: string): Promise<VerifyResult> => {
  try {
    const res = await fetch(`/api/verify/${encodeURIComponent(code)}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return { valid: false };
    return await res.json();
  } catch {
    return { valid: false };
  }
};
