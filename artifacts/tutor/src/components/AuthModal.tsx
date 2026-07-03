import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/hooks/use-app-state";
import { signup, login } from "@/lib/tutor-api";

export function AuthModal() {
  const { authOpen, setAuthOpen } = useAppState();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const res = mode === "signup" ? await signup(email, name, password) : await login(email, password);
    setBusy(false);
    if (res.ok) {
      // Reload so the session + any claimed guest progress hydrate cleanly.
      window.location.reload();
    } else {
      setError(res.data?.error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Save your progress across devices and earn a verifiable certificate."
              : "Sign in to continue your learning and keep your records."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {mode === "signup" && (
            <Input placeholder="Full name (as it should appear on your certificate)"
              value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Input type="password" placeholder="Password (min 8 characters)" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={submit} disabled={busy}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </Button>
          {mode === "login" && (
            <p className="text-xs text-muted-foreground text-center">
              Forgot your password? Once signed in you can change it from the menu. If you cannot sign in, contact your course administrator to reset it.
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <button className="text-primary font-medium hover:underline"
            onClick={() => { setError(null); setMode(mode === "signup" ? "login" : "signup"); }}>
            {mode === "signup" ? "Log in" : "Create an account"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
