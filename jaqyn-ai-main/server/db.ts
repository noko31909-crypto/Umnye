import { eq, and, desc, asc, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, businesses, customers, campaigns } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Business queries
export async function getBusinessesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businesses).where(eq(businesses.userId, userId));
}

export async function getBusinessById(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBusiness(data: typeof businesses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(businesses).values(data);
  return result;
}

export async function updateBusiness(businessId: number, data: Partial<typeof businesses.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(businesses).set(data).where(eq(businesses.id, businessId));
}

// Customer queries
export async function getCustomersByBusinessId(businessId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers)
    .where(eq(customers.businessId, businessId))
    .orderBy(desc(customers.lastVisit))
    .limit(limit)
    .offset(offset);
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchCustomers(businessId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers)
    .where(and(
      eq(customers.businessId, businessId),
      like(customers.name, `%${query}%`)
    ))
    .limit(20);
}

export async function getCustomersByStatus(businessId: number, status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers)
    .where(and(
      eq(customers.businessId, businessId),
      eq(customers.status, status as any)
    ))
    .orderBy(desc(customers.lastVisit));
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(data);
  return result;
}

export async function updateCustomer(customerId: number, data: Partial<typeof customers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customers).set(data).where(eq(customers.id, customerId));
}

// Campaign queries
export async function getCampaignsByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns)
    .where(eq(campaigns.businessId, businessId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(campaignId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCampaign(data: typeof campaigns.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(data);
  return result;
}

export async function updateCampaign(campaignId: number, data: Partial<typeof campaigns.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(campaigns).set(data).where(eq(campaigns.id, campaignId));
}

// Integration queries
export async function getIntegrationsByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.businessId, businessId));
}

export async function getIntegrationById(integrationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(integrations).where(eq(integrations.id, integrationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createIntegration(data: typeof integrations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(integrations).values(data);
  return result;
}

export async function updateIntegration(integrationId: number, data: Partial<typeof integrations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(integrations).set(data).where(eq(integrations.id, integrationId));
}

// Analytics queries
export async function getAnalyticsByBusinessAndDateRange(businessId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analytics)
    .where(and(
      eq(analytics.businessId, businessId),
      gte(analytics.date, startDate),
      lte(analytics.date, endDate)
    ))
    .orderBy(asc(analytics.date));
}

export async function createAnalytics(data: typeof analytics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analytics).values(data);
  return result;
}

// Customer Interactions queries
export async function getCustomerInteractionsByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerInteractions)
    .where(eq(customerInteractions.customerId, customerId))
    .orderBy(desc(customerInteractions.createdAt));
}

export async function createCustomerInteraction(data: typeof customerInteractions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerInteractions).values(data);
  return result;
}
