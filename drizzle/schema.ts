import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Businesses table - stores business information for each user
 */
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  workingHoursStart: varchar("workingHoursStart", { length: 5 }),
  workingHoursEnd: varchar("workingHoursEnd", { length: 5 }),
  peakHoursStart: varchar("peakHoursStart", { length: 5 }),
  peakHoursEnd: varchar("peakHoursEnd", { length: 5 }),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }),
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }),
  targetROI: decimal("targetROI", { precision: 5, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("KZT").notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

/**
 * Customers table - stores customer information
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  status: mysqlEnum("status", ["new", "regular", "vip", "at_risk", "inactive"]).default("new").notNull(),
  totalVisits: int("totalVisits").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  lastVisit: timestamp("lastVisit").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Campaigns table - stores marketing campaigns
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  goal: varchar("goal", { length: 255 }),
  targetSegment: varchar("targetSegment", { length: 100 }),
  message: text("message"),
  channels: varchar("channels", { length: 255 }),
  sentCount: int("sentCount").default(0).notNull(),
  returnedCount: int("returnedCount").default(0).notNull(),
  generatedRevenue: decimal("generatedRevenue", { precision: 12, scale: 2 }).default("0").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0").notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "sent", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
