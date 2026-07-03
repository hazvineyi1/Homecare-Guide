import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

// Full-course access per owner (owner id = user id when signed in, or the
// per-browser guest id otherwise). Topic 1 is always free; other topics require
// full access, granted by redeeming a coupon or by an admin manual grant.
export const entitlements = pgTable("entitlements", {
  ownerId: text("owner_id").primaryKey(),
  fullAccess: boolean("full_access").notNull().default(false),
  source: text("source"), // 'coupon' | 'manual'
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Coupon / unlock codes. A redemption grants full access. percentOff is kept for
// display and future real-payment integration.
export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(),
  percentOff: integer("percent_off"),
  note: text("note"),
  active: boolean("active").notNull().default(true),
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  redemptions: integer("redemptions").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Audit log of every unlock, for the admin dashboard.
export const unlockEvents = pgTable("unlock_events", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  method: text("method").notNull(), // 'coupon' | 'manual'
  code: text("code"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Simple key/value settings (e.g. the Orange Money recipient details shown on
// the paywall), editable from the admin dashboard.
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Entitlement = typeof entitlements.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type UnlockEvent = typeof unlockEvents.$inferSelect;
