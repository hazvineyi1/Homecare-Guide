import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppState } from "@/hooks/use-app-state";
import { changePassword } from "@/lib/tutor-api";

export function ChangePasswordModal() {
  const { pwOpen, setPwOpen } = useAppState();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setCur(""); setNext(""); setConfirm(""); setError(null); };

  const submit = async () => {
    setError(null);
    if (next.length < 8) { setError("Your new password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("The new passwords do not match."); return; }
    setBusy(true);
    const res = await changePassword(cur, next);
    setBusy(false);
    if (res.ok) {
      toast.success("Your password has been changed.");
      reset();
      setPwOpen(false);
    } else {
      setError(res.data?.error ?? "Could not change your password. Please try again.");
    }
  };

  return (
    <Dialog open={pwOpen} onOpenChange={(v) => { setPwOpen(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Change your password</DialogTitle>
          <DialogDescription>Enter your current password, then choose a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <Input type="password" placeholder="Current password" value={cur}
            onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
          <Input type="password" placeholder="New password (min 8 characters)" value={next}
            onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          <Input type="password" placeholder="Confirm new password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            autoComplete="new-password" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={submit} disabled={busy}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "Please wait…" : "Update password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
