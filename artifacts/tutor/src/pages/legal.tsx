import React from "react";
import { ArrowLeft } from "lucide-react";

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <a href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to A Guide to Homecare
        </a>
        <h1 className="font-serif text-3xl text-foreground mb-1">{title}</h1>
        <p className="text-xs text-muted-foreground mb-6">Last updated: {updated}</p>
        <div className="space-y-4 text-sm text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-lg text-foreground mt-6 mb-1">{children}</h2>;
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        A Guide to Homecare is an educational course. We collect only what is needed to run the course and keep your place.
        We do not sell your data or show advertising.
      </p>
      <H>What we store</H>
      <p>
        Your first name and country are saved in your own browser to personalise the course. Your learning progress and your
        conversations with Nurse Mooka are stored so the course works and you can resume where you left off. If you create an
        account, we store your name, email address, and a securely hashed password (we never store your password in plain text).
      </p>
      <H>How your messages are used</H>
      <p>
        To generate Nurse Mooka's responses, the messages in a lesson are sent to our AI provider. They are used only to
        produce the tutoring reply for you.
      </p>
      <H>Your choices</H>
      <p>
        You can clear the course data held in your browser at any time. To access or delete an account and its records,
        contact us and we will help.
      </p>
      <H>Contact</H>
      <p>
        Questions about privacy: <a className="text-primary hover:underline" href="mailto:info@synops-consulting.com">info@synops-consulting.com</a>.
      </p>
      <p className="text-xs text-muted-foreground pt-2">
        This course is a preparation and reference guide, not a substitute for professional medical advice.
      </p>
    </LegalShell>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms of Use" updated="July 2026">
      <p>
        A Guide to Homecare is an educational and reference tool for family and professional caregivers, based on the book
        <em> A Guide to Homecare</em> by Dr Dorothy Mooka. By using it, you agree to these terms.
      </p>
      <H>Not medical advice</H>
      <p>
        The course helps you prepare and learn. It is not medical advice, not a diagnosis, and not a licensed or
        government-accredited qualification. It does not replace a doctor, nurse, or emergency care. If someone is unwell or
        you are unsure, contact a health professional. In an emergency, seek professional medical help immediately.
      </p>
      <H>Certificate of Completion</H>
      <p>
        A Certificate of Completion records that you finished the training. It is not a professional accreditation or licence.
      </p>
      <H>Provided as is</H>
      <p>
        The course is provided "as is" without warranties of any kind. We work to keep the content accurate and grounded in
        the book, but we do not guarantee it is complete or error-free for every situation.
      </p>
      <H>Contact</H>
      <p>
        Questions about these terms: <a className="text-primary hover:underline" href="mailto:info@synops-consulting.com">info@synops-consulting.com</a>.
      </p>
    </LegalShell>
  );
}
