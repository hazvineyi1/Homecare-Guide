import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

// A verifiable, identity-bound completion credential.
export const certificates = pgTable("certificates", {
  id: text("id").primaryKey(), // uuid
  userId: text("user_id").notNull(),
  code: text("code").notNull().unique(), // public verification code
  learnerName: text("learner_name").notNull(),
  masteredCount: integer("mastered_count").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
