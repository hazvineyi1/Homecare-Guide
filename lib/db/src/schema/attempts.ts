import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// Immutable record of every knowledge-check attempt (accreditation evidence).
export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(), // guest owner id or user id
  userId: text("user_id"), // set when the learner is logged in
  topicId: integer("topic_id").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passed: boolean("passed").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Attempt = typeof attempts.$inferSelect;
