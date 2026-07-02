import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  // Opaque per-browser owner id (see api-server owner middleware). Every read,
  // write, and delete of a conversation is scoped to this value so that
  // integer conversation ids cannot be enumerated across users (IDOR).
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  // Topic mastery: set once the learner locks in a topic as complete.
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
