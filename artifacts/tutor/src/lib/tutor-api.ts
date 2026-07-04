export const streamTutorResponse = async (
  conversationId: number,
  content: string,
  messageType: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  learnerName?: string,
  country?: string,
  scenario?: string,
) => {
  const response = await fetch(`/api/tutor/sessions/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, messageType, learnerName, country, scenario }),
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
export interface AuthUser { id: string; email: string; name: string; isAdmin?: boolean; }

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
export const changePassword = (currentPassword: string, newPassword: string) =>
  postJson("/api/auth/change-password", { currentPassword, newPassword });

// ---------- Billing / access ----------
export interface PayInfo {
  price: string; currency: string; method: string;
  recipient: string; name: string; instructions: string;
}
export const fetchAccess = async (): Promise<{ fullAccess: boolean; freeTopicId: number }> => {
  try {
    const res = await fetch("/api/access", { headers: { Accept: "application/json" } });
    if (!res.ok) return { fullAccess: false, freeTopicId: 1 };
    return await res.json();
  } catch { return { fullAccess: false, freeTopicId: 1 }; }
};
export const fetchPayInfo = async (): Promise<PayInfo> => {
  const res = await fetch("/api/pay-info", { headers: { Accept: "application/json" } });
  return await res.json();
};
export const redeemCoupon = (code: string) => postJson("/api/access/redeem", { code });

export interface AdminCoupon {
  code: string; percentOff: number | null; note: string | null;
  active: boolean; maxRedemptions: number | null; redemptions: number; createdAt: string;
}
export interface AdminUnlock {
  id: number; ownerId: string; method: string; code: string | null; note: string | null; createdAt: string;
}
export interface AdminOverview {
  payInfo: PayInfo; coupons: AdminCoupon[]; unlocks: AdminUnlock[];
  counts: { fullAccessOwners: number; coupons: number; redemptions: number };
}
export const fetchAdminOverview = async (): Promise<AdminOverview | null> => {
  try {
    const res = await fetch("/api/admin/overview", { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
};
export const adminCreateCoupon = (body: { code: string; percentOff?: number; maxRedemptions?: number; note?: string }) =>
  postJson("/api/admin/coupons", body);
export const adminToggleCoupon = (code: string) =>
  postJson(`/api/admin/coupons/${encodeURIComponent(code)}/toggle`);
export const adminGrant = (email: string) => postJson("/api/admin/grant", { email });
export const adminSetPayInfo = (body: { recipient?: string; name?: string; instructions?: string }) =>
  postJson("/api/admin/pay-info", body);

export const recordAttempt = (a: {
  topicId: number; score: number; total: number; passed: boolean; durationSeconds: number;
}) => postJson("/api/tutor/attempts", a);

export interface CertificateRecord {
  id: string; code: string; learnerName: string; masteredCount: number;
  level?: number | null; credential?: string | null; issuedAt: string;
}
export const issueCertificate = (level: number) => postJson("/api/certificate", { level });
export const fetchCertificates = async (): Promise<CertificateRecord[]> => {
  try {
    const res = await fetch("/api/certificates", { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.certificates) ? data.certificates : [];
  } catch {
    return [];
  }
};

export interface VerifyResult {
  valid: boolean; code?: string; learnerName?: string; course?: string;
  credential?: string; level?: number | null; masteredCount?: number; issuedAt?: string;
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

export interface OrgModuleProgress { level: number; done: number; total: number; complete: boolean; }
export interface OrgMemberRow {
  userId: string; name: string; email: string; role: string; joinedAt: string;
  topicsCompleted: number; total: number; modules: OrgModuleProgress[];
}
export interface OrgRow {
  id: string; name: string; role: string; joinCode?: string; members?: OrgMemberRow[];
}
export const fetchMyOrgs = async (): Promise<OrgRow[]> => {
  try {
    const res = await fetch("/api/org/mine", { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.orgs) ? data.orgs : [];
  } catch {
    return [];
  }
};
export const createOrg = (name: string) => postJson("/api/org/create", { name });
export const joinOrg = (code: string) => postJson("/api/org/join", { code });
