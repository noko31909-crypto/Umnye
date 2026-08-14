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

// ============================================================================
// SERPIN MVP Tables
// ============================================================================

/**
 * Products table - inventory items tracked by the business
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  unit: varchar("unit", { length: 32 }).default("шт").notNull(),
  currentStock: decimal("currentStock", { precision: 10, scale: 2 }).default("0").notNull(),
  minStock: decimal("minStock", { precision: 10, scale: 2 }).default("10").notNull(),
  maxStock: decimal("maxStock", { precision: 10, scale: 2 }).default("100").notNull(),
  avgSalesPerDay: decimal("avgSalesPerDay", { precision: 10, scale: 2 }).default("0").notNull(),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  preferredSupplierId: int("preferredSupplierId"),
  autoOrderEnabled: boolean("autoOrderEnabled").default(true).notNull(),
  status: mysqlEnum("status", ["in_stock", "low_stock", "critical", "out_of_stock"]).default("in_stock").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Suppliers table - supplier information
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 128 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  avgDeliveryDays: decimal("avgDeliveryDays", { precision: 3, scale: 1 }).default("3").notNull(),
  reliabilityScore: decimal("reliabilityScore", { precision: 3, scale: 1 }).default("90").notNull(),
  lateDeliveryCount: int("lateDeliveryCount").default(0).notNull(),
  totalOrders: int("totalOrders").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Supplier products - price catalog linking suppliers to products
 */
export const supplierProducts = mysqlTable("supplierProducts", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId").notNull(),
  productId: int("productId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  minOrderQty: decimal("minOrderQty", { precision: 10, scale: 2 }).default("1").notNull(),
  inStock: boolean("inStock").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplierProduct = typeof supplierProducts.$inferSelect;
export type InsertSupplierProduct = typeof supplierProducts.$inferInsert;

/**
 * Orders table - purchase orders to suppliers
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  supplierId: int("supplierId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "collecting", "in_transit", "delivered", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  expectedDeliveryDate: timestamp("expectedDeliveryDate"),
  actualDeliveryDate: timestamp("actualDeliveryDate"),
  notes: text("notes"),
  isAutoOrder: boolean("isAutoOrder").default(false).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - products within an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  deliveredQty: decimal("deliveredQty", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Sales history - daily sales records for forecasting
 */
export const salesHistory = mysqlTable("salesHistory", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  productId: int("productId").notNull(),
  saleDate: timestamp("saleDate").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesHistory = typeof salesHistory.$inferSelect;
export type InsertSalesHistory = typeof salesHistory.$inferInsert;

/**
 * Business profile - SERPIN-specific profile settings
 */
export const businessProfiles = mysqlTable("businessProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessType: mysqlEnum("businessType", ["coffee_shop", "store", "pharmacy", "bakery", "restaurant", "other"]).default("store").notNull(),
  locationsCount: int("locationsCount").default(1).notNull(),
  productCategories: text("productCategories"),
  autoOrderThreshold: decimal("autoOrderThreshold", { precision: 3, scale: 1 }).default("1.5").notNull(),
  preferredDeliveryDays: int("preferredDeliveryDays").default(3).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = typeof businessProfiles.$inferInsert;
