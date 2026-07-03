import React, { useState, useEffect, useCallback } from "react";
import { Users, Copy, Check, Printer, Building2, UserPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/use-app-state";
import { fetchMyOrgs, createOrg, joinOrg, OrgRow, OrgMemberRow } from "@/lib/tutor-api";

function printTeamReport(org: OrgRow) {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = (org.members ?? []).map((m) => {
    const mods = m.modules.map((x) => (x.complete ? "&#10003;" : `${x.done}/${x.total}`)).join("</td><td>");
    return `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${m.role}</td><td>${m.topicsCompleted}/${m.total}</td><td>${mods}</td></tr>`;
  }).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Team training report: ${esc(org.name)}</title>
  <style>
    @page { margin: 14mm; } body { font-family: Georgia,serif; color:#202420; max-width:900px; margin:0 auto; }
    .eyebrow { letter-spacing:.18em; text-transform:uppercase; font-size:11px; color:#3E5E3F; }
    h1 { font-size:22px; margin:4px 0 2px; } .meta { font-size:12px; color:#4C524B; margin-bottom:14px; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th,td { text-align:left; padding:6px 8px; border-bottom:1px solid #E9EFE7; }
    th { color:#4C524B; font-size:10px; text-transform:uppercase; }
    .foot { margin-top:18px; font-size:11px; color:#4C524B; border-top:1px solid #DCE3DA; padding-top:8px; }
  </style></head><body>
    <div class="eyebrow">A Guide to Homecare, team training report</div>
    <h1>${esc(org.name)}</h1>
    <div class="meta">Printed ${new Date().toLocaleDateString()} &middot; ${(org.members ?? []).length} member(s)</div>
    <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Topics</th><th>Module 1</th><th>Module 2</th><th>Module 3</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="foot">Shows completion of the &ldquo;A Guide to Homecare&rdquo; preparation and reference training. A Certificate of Completion record, not a licensed or government-accredited qualification.</div>
    <script>window.onload=function(){window.print();}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

function ModuleDots({ member }: { member: OrgMemberRow }) {
  return (
    <div className="flex items-center gap-1">
      {member.modules.map((m) => (
        <span
          key={m.level}
          title={`Module ${m.level}: ${m.done}/${m.total}`}
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold",
            m.complete ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border",
          )}
        >
          {m.complete ? <Check className="w-3.5 h-3.5" /> : m.done}
        </span>
      ))}
    </div>
  );
}

export function TeamDashboard() {
  const { teamOpen, setTeamOpen, currentUser, setAuthOpen } = useAppState();
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setOrgs(await fetchMyOrgs());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (teamOpen && currentUser) void load();
  }, [teamOpen, currentUser, load]);

  const doCreate = async () => {
    setErr(null); setWorking(true);
    const r = await createOrg(name.trim());
    setWorking(false);
    if (r.ok) { setName(""); await load(); } else setErr(r.data?.error ?? "Could not create the team.");
  };
  const doJoin = async () => {
    setErr(null); setWorking(true);
    const r = await joinOrg(code.trim());
    setWorking(false);
    if (r.ok) { setCode(""); await load(); } else setErr(r.data?.error ?? "Could not join the team.");
  };
  const copyCode = (c: string) => {
    navigator.clipboard?.writeText(c);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const managerOrgs = orgs.filter((o) => o.role === "manager");
  const staffOrgs = orgs.filter((o) => o.role === "staff");

  return (
    <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Team dashboard
          </DialogTitle>
        </DialogHeader>

        {!currentUser ? (
          <div className="text-center py-8">
            <p className="text-foreground mb-4">Sign in to create or manage a team for your care home or agency.</p>
            <Button onClick={() => { setTeamOpen(false); setAuthOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in / create account
            </Button>
          </div>
        ) : loading ? (
          <p className="text-center text-muted-foreground py-10 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading your teams…</p>
        ) : (
          <div className="space-y-6">
            {/* Manager view */}
            {managerOrgs.map((org) => (
              <section key={org.id} className="rounded-2xl border border-border p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-primary">You manage</div>
                    <h3 className="font-serif text-xl text-foreground">{org.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Team code</div>
                    <button onClick={() => copyCode(org.joinCode!)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 font-mono text-sm font-bold tracking-widest text-foreground hover:bg-secondary/70">
                      {org.joinCode} {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => printTeamReport(org)}>
                      <Printer className="w-4 h-4 mr-1.5" /> Print report
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Share the team code with your staff. They sign in, open this dashboard, and choose &ldquo;Join a team&rdquo;.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3 font-semibold">Name</th>
                        <th className="py-2 pr-3 font-semibold">Role</th>
                        <th className="py-2 pr-3 font-semibold">Topics</th>
                        <th className="py-2 pr-3 font-semibold">Modules</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(org.members ?? []).map((m) => (
                        <tr key={m.userId} className="border-b border-border/60">
                          <td className="py-2.5 pr-3">
                            <div className="font-medium text-foreground">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={cn("text-xs font-semibold", m.role === "manager" ? "text-primary" : "text-muted-foreground")}>
                              {m.role === "manager" ? "Manager" : "Staff"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{m.topicsCompleted}/{m.total}</td>
                          <td className="py-2.5 pr-3"><ModuleDots member={m} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            {/* Staff-only memberships */}
            {staffOrgs.map((org) => (
              <section key={org.id} className="rounded-2xl border border-border bg-secondary/40 p-4 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-primary">You are a member of</div>
                <h3 className="font-serif text-xl text-foreground">{org.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Your manager can see the modules you complete. Keep working through the roadmap, and print your own training record from the menu on the left.</p>
              </section>
            ))}

            {/* Create / join */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2 font-serif text-lg text-foreground"><Building2 className="w-5 h-5 text-primary" /> Create a team</div>
                <p className="text-xs text-muted-foreground mb-3">For a care home or agency. You become the manager and get a code to share with staff.</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team or home name" aria-label="Team name"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-primary/30" />
                <Button size="sm" disabled={working || name.trim().length < 2} onClick={doCreate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Create team
                </Button>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2 font-serif text-lg text-foreground"><UserPlus className="w-5 h-5 text-primary" /> Join a team</div>
                <p className="text-xs text-muted-foreground mb-3">Got a code from your manager? Enter it to join as staff.</p>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Team code" aria-label="Team code"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono tracking-widest mb-2 outline-none focus:ring-2 focus:ring-primary/30" />
                <Button size="sm" variant="secondary" disabled={working || code.trim().length < 4} onClick={doJoin} className="w-full">
                  Join team
                </Button>
              </div>
            </div>
            {err && <p className="text-sm text-destructive text-center">{err}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
