import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { verifyCertificate, VerifyResult } from "@/lib/tutor-api";
import { Button } from "@/components/ui/button";

export function VerifyView({ code }: { code: string }) {
  const [result, setResult] = useState<VerifyResult | null>(null);
  useEffect(() => { verifyCertificate(code).then(setResult); }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4 text-primary">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-serif text-xl text-foreground">Certificate verification</span>
        </div>
        {result === null ? (
          <p className="text-muted-foreground">Checking…</p>
        ) : result.valid ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">This is a genuine certificate.</p>
            <p className="font-serif text-2xl text-foreground mb-1">{result.learnerName}</p>
            <p className="text-sm text-foreground mb-4">completed <b>{result.course}</b></p>
            <div className="text-xs text-muted-foreground">
              Code {result.code} · Issued {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString() : ""} · {result.masteredCount}/12 topics mastered
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-foreground">No certificate found for code <b>{code}</b>.</p>
          </>
        )}
        <a href="/"><Button variant="secondary" className="mt-6">Go to the course</Button></a>
      </div>
    </div>
  );
}
