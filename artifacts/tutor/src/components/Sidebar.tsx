import React from "react";
import { CheckCircle2, LogOut, UserCircle2, FileText, Users, KeyRound, Settings, Lock, ShieldCheck } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { TOPICS } from "@/lib/constants";
import { LEVELS } from "@/lib/course-structure";
import { HydratedSession } from "@/hooks/use-app-state";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/tutor-api";
import { Button } from "@/components/ui/button";

// Printable training record for onboarding / staff files.
function printTrainingRecord(name: string, sessions: Record<number, HydratedSession>) {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const statusOf = (i: number) => {
    const sx = sessions[i];
    return sx?.completed ? "Completed" : sx?.conversationId ? "In progress" : "Not started";
  };
  const rows = TOPICS.map((t, i) =>
    `<tr><td>${t.id.toString().padStart(2, "0")}</td><td>${esc(t.title)}</td><td class="st ${statusOf(i) === "Completed" ? "ok" : ""}">${statusOf(i)}</td></tr>`
  ).join("");
  const modules = LEVELS.map((lv) => {
    const done = lv.topicIds.filter((id) => sessions[TOPICS.findIndex((t) => t.id === id)]?.completed).length;
    const complete = done === lv.topicIds.length;
    return `<li>Module ${lv.level}: ${esc(lv.name)} &mdash; ${done}/${lv.topicIds.length} topics${complete ? " <b>(Certificate of Completion earned)</b>" : ""}</li>`;
  }).join("");
  const completed = TOPICS.filter((_, i) => sessions[i]?.completed).length;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Training record: ${esc(name)}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: Georgia,'Times New Roman',serif; color:#202420; line-height:1.5; max-width:720px; margin:0 auto; }
    .eyebrow { letter-spacing:.18em; text-transform:uppercase; font-size:11px; color:#3E5E3F; }
    h1 { font-size:23px; margin:4px 0 2px; }
    .meta { font-size:12px; color:#4C524B; margin-bottom:14px; }
    h2 { font-size:14px; color:#3E5E3F; margin:20px 0 6px; border-bottom:1px solid #DCE3DA; padding-bottom:4px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th,td { text-align:left; padding:5px 8px; border-bottom:1px solid #E9EFE7; }
    th { color:#4C524B; font-size:11px; text-transform:uppercase; letter-spacing:.05em; }
    td:first-child { width:34px; color:#4C524B; }
    .st.ok { color:#3E5E3F; font-weight:bold; }
    ul { padding-left:20px; } li { margin:4px 0; }
    .sign { margin-top:24px; display:flex; gap:48px; font-size:13px; }
    .sign div { flex:1; border-top:1px solid #202420; padding-top:6px; color:#4C524B; }
    .foot { margin-top:20px; font-size:11px; color:#4C524B; border-top:1px solid #DCE3DA; padding-top:8px; }
  </style></head><body>
    <div class="eyebrow">A Guide to Homecare &mdash; Training record</div>
    <h1>${esc(name)}</h1>
    <div class="meta">Date printed: ${new Date().toLocaleDateString()} &nbsp;&middot;&nbsp; Topics completed: ${completed} of ${TOPICS.length}</div>
    <h2>Modules</h2><ul>${modules}</ul>
    <h2>Topic completion</h2>
    <table><thead><tr><th>#</th><th>Topic</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="sign"><div>Learner signature &amp; date</div><div>Supervisor / manager signature &amp; date</div></div>
    <div class="foot">This record shows completion of the &ldquo;A Guide to Homecare&rdquo; preparation and reference training. It is a Certificate of Completion record, not a licensed or government-accredited qualification, and not a substitute for professional medical training. Keep with the staff member's onboarding file.</div>
    <script>window.onload=function(){window.print();}</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function Sidebar() {
  const {
    level,
    currentTopicIndex, setCurrentTopicIndex,
    sessions,
    setMobileSidebarOpen,
    currentUser,
    setAuthOpen,
    setTeamOpen,
    setAtLanding,
    setPwOpen,
    setSettingsOpen,
    setAdminOpen,
    fullAccess,
    country,
    learnerName,
  } = useAppState();
  const guestFirstName = (learnerName || "").trim().split(" ")[0];
  const firstLockedIndex = Math.max(1, TOPICS.findIndex((t) => t.id !== 1));

  const sessionValues = Object.values(sessions);
  const startedTopicsCount = sessionValues.filter((s) => s.conversationId).length;
  const masteredCount = sessionValues.filter((s) => s.completed).length;

  return (
    <div className="w-full md:w-[300px] h-full bg-sidebar md:border-r border-border flex flex-col shrink-0">
      <button
        onClick={() => { setAtLanding(true); setCurrentTopicIndex(null); setMobileSidebarOpen(false); }}
        className="p-6 pb-4 text-left w-full hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title="Back to the landing page"
      >
        <h1 className="text-sidebar-foreground text-2xl font-serif mb-1 leading-tight">
          A Guide to Homecare
        </h1>
        <p className="text-sidebar-foreground/80 text-[11px] tracking-tight whitespace-nowrap">
          Caregiver preparedness &middot; guided by Dorothy Mooka
        </p>
      </button>

      <div className="px-6 mb-5">
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center justify-between gap-2 rounded-md border border-sidebar-border/60 bg-black/[0.03] px-3 py-2 text-left hover:bg-black/[0.06] transition-colors"
          title="Change your country, name and starting difficulty"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-sidebar-foreground/60 font-semibold">Learning setup</span>
            <span className="block text-sm text-sidebar-foreground truncate">
              {country || "Set your country"} &middot; {level === "experienced" ? "Experienced" : "New caregiver"}
            </span>
          </span>
          <Settings className="w-4 h-4 text-sidebar-foreground/60 shrink-0" />
        </button>
      </div>

      <div className="px-6 pb-2 flex items-baseline justify-between">
        <h2 className="text-xs uppercase tracking-wider text-sidebar-foreground/70 font-bold">
          Dialogue topics
        </h2>
        <span className="text-xs text-sidebar-foreground/70 font-medium">
          {masteredCount}/{TOPICS.length} mastered
        </span>
      </div>

      <div className="hg-scroll flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {TOPICS.map((topic, index) => {
          const isActive = currentTopicIndex === index;
          const session = sessions[index];
          const isCompleted = !!session?.completed;
          const progress = Math.min(5, Math.floor((session?.exchanges || 0) / 2));

          return (
            <button
              key={topic.id}
              onClick={() => {
                setCurrentTopicIndex(index);
                setMobileSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors",
                isActive ? "bg-sidebar-primary/20 text-sidebar-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
              )}
            >
              <span className="font-serif text-sidebar-foreground/60 text-sm mt-0.5 w-5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" aria-label="Mastered" />
                ) : (
                  topic.id.toString().padStart(2, "0")
                )}
              </span>
              <div className="flex-1">
                <div className={cn("text-sm font-medium leading-snug mb-2 text-sidebar-foreground/90", isCompleted && "text-sidebar-foreground")}>
                  {topic.title}
                </div>
                {isCompleted ? (
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                    Mastered
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          i < progress ? "bg-accent" : "bg-sidebar-accent/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-black/[0.02]">
        {currentUser ? (
          <div className="flex items-center gap-2 mb-3">
            <UserCircle2 className="w-5 h-5 text-sidebar-foreground/70 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-sidebar-foreground truncate">{currentUser.name}</div>
              <div className="text-xs text-sidebar-foreground/70 truncate">{currentUser.email}</div>
            </div>
            <button
              onClick={() => setPwOpen(true)}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
              title="Change password"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={async () => { await logout(); window.location.reload(); }}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {guestFirstName && (
              <div className="flex items-center gap-2 mb-2">
                <UserCircle2 className="w-5 h-5 text-sidebar-foreground/70 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-sidebar-foreground truncate">Learning as {guestFirstName}</div>
                  <div className="text-xs text-sidebar-foreground/70 truncate">Sign in to save your progress</div>
                </div>
              </div>
            )}
            <Button
              onClick={() => setAuthOpen(true)}
              className="w-full mb-3 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              Sign in to save progress
            </Button>
          </>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => printTrainingRecord(currentUser?.name ?? (guestFirstName || "Caregiver"), sessions)}
            title="Print your training record"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Print record
          </button>
          {currentUser && (
            <button
              onClick={() => setTeamOpen(true)}
              title="Open the team dashboard"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Team
            </button>
          )}
        </div>

        {!fullAccess && (
          <button
            onClick={() => { setCurrentTopicIndex(firstLockedIndex); setMobileSidebarOpen(false); }}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" /> Unlock full course
          </button>
        )}
        {currentUser?.isAdmin && (
          <button
            onClick={() => { setAdminOpen(true); setMobileSidebarOpen(false); }}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin dashboard
          </button>
        )}
      </div>
    </div>
  );
}
