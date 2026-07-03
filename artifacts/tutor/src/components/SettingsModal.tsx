import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppState, Level } from "@/hooks/use-app-state";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function SettingsModal() {
  const {
    settingsOpen, setSettingsOpen,
    learnerName, setLearnerName,
    country, setCountry,
    level, setLevel,
  } = useAppState();

  const [name, setName] = useState(learnerName);
  const [c, setC] = useState(country);
  const [lv, setLv] = useState<Level>(level);

  // Re-seed the fields each time the modal opens so it reflects current values.
  useEffect(() => {
    if (settingsOpen) { setName(learnerName); setC(country); setLv(level); }
  }, [settingsOpen, learnerName, country, level]);

  const save = () => {
    if (name.trim()) setLearnerName(name.trim());
    setCountry(c);
    setLevel(lv);
    toast.success("Your settings are saved.");
    setSettingsOpen(false);
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Your settings</DialogTitle>
          <DialogDescription>Personalise how this course works for you.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Your first name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" className="mt-1.5" />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Country</span>
            <select
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="" disabled>Select your country…</option>
              {COUNTRIES.map((x) => (<option key={x} value={x}>{x}</option>))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Nurse Mooka sets scenarios in this country, with names and places you'll recognise.</p>
          </label>

          <div>
            <span className="text-sm font-semibold text-foreground">Starting difficulty</span>
            <div className="mt-1.5 inline-flex rounded-lg border border-border p-1 bg-card">
              <button
                onClick={() => setLv("new")}
                className={cn("px-3 py-1.5 rounded-md text-sm font-semibold transition-colors", lv === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                New caregiver
              </button>
              <button
                onClick={() => setLv("experienced")}
                className={cn("px-3 py-1.5 rounded-md text-sm font-semibold transition-colors", lv === "experienced" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Experienced
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Nurse Mooka adapts up or down from here as you go. Changing this restarts the current lesson at the new level.</p>
          </div>

          <Button onClick={save} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Save settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
