import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

// Re-export eq for use in appended code
import { desc, sql, and, gte } from "drizzle-orm";

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

// TODO: add feature queries here as your schema grows.

// ============================================================================
// SERPIN MVP - Query Helpers
// ============================================================================

import {
  products, suppliers, supplierProducts, orders, orderItems,
  salesHistory, businessProfiles
} from "../drizzle/schema";

// --- Products ---
export async function getProducts(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.businessId, businessId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function updateStock(id: number, newStock: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock' = 'in_stock';
  if (newStock <= 0) status = 'out_of_stock';
  else if (newStock <= 5) status = 'critical';
  else if (newStock <= 10) status = 'low_stock';
  await db.update(products).set({
    currentStock: String(newStock),
    status,
  }).where(eq(products.id, id));
}

// --- Suppliers ---
export async function getSuppliers(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.businessId, businessId));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSupplier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(suppliers).values(data);
  return result;
}

export async function updateSupplier(id: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

// --- Supplier Products ---
export async function getSupplierProducts(supplierId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierProducts).where(eq(supplierProducts.supplierId, supplierId));
}

export async function getProductsBySupplier(supplierId: number, productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierProducts)
    .where(and(eq(supplierProducts.supplierId, supplierId), eq(supplierProducts.productId, productId)));
}

export async function getSuppliersForProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  const spList = await db.select().from(supplierProducts).where(eq(supplierProducts.productId, productId));
  if (spList.length === 0) return [];
  const supplierIds = spList.map(sp => sp.supplierId);
  const supplierList = await db.select().from(suppliers).where(sql`${suppliers.id} IN (${sql.join(supplierIds.map(id => sql`${id}`), sql`, `)})`);
  return { supplierProducts: spList, suppliers: supplierList };
}

export async function createSupplierProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(supplierProducts).values(data);
  return result;
}

// --- Orders ---
export async function getOrders(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.businessId, businessId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(orders).values(data);
  return result;
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { status };
  if (status === 'delivered') {
    updates.actualDeliveryDate = new Date();
  }
  await db.update(orders).set(updates).where(eq(orders.id, id));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItems(items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(items);
}

// --- Sales History ---
export async function getSalesHistory(businessId: number, productId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return db.select().from(salesHistory)
    .where(and(
      eq(salesHistory.businessId, businessId),
      eq(salesHistory.productId, productId),
      gte(salesHistory.saleDate, cutoff)
    ))
    .orderBy(salesHistory.saleDate);
}

export async function createSalesHistory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(salesHistory).values(data);
  return result;
}

// --- Business Profiles ---
export async function getBusinessProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBusinessProfile(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, data.userId)).limit(1);
  if (existing.length > 0) {
    await db.update(businessProfiles).set(data).where(eq(businessProfiles.userId, data.userId));
  } else {
    await db.insert(businessProfiles).values(data);
  }
}

// --- Dashboard Aggregations ---
export async function getDashboardMetrics(businessId: number) {
  const db = await getDb();
  if (!db) return null;

  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  const allSuppliers = await db.select().from(suppliers).where(eq(suppliers.businessId, businessId));
  const allOrders = await db.select().from(orders).where(eq(orders.businessId, businessId));

  const totalProducts = allProducts.length;
  const lowStockCount = allProducts.filter(p => p.status === 'low_stock').length;
  const criticalCount = allProducts.filter(p => p.status === 'critical' || p.status === 'out_of_stock').length;
  const activeOrders = allOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;

  // Calculate total inventory value
  const totalValue = allProducts.reduce((sum, p) => sum + (Number(p.currentStock) * Number(p.costPrice)), 0);

  // Calculate potential savings from auto-order (mock: 10% of order value)
  const potentialSavings = allOrders
    .filter(o => o.isAutoOrder)
    .reduce((sum, o) => sum + Number(o.totalAmount) * 0.1, 0);

  return {
    totalProducts,
    lowStockCount,
    criticalCount,
    activeOrders,
    deliveredOrders,
    totalSuppliers: allSuppliers.length,
    totalInventoryValue: totalValue,
    autoOrderSavings: potentialSavings,
  };
}

// --- AI Recommendations ---
export async function getAIRecommendations(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  const recommendations: any[] = [];

  for (const product of allProducts) {
    const stock = Number(product.currentStock);
    const minStock = Number(product.minStock);
    const avgSales = Number(product.avgSalesPerDay);
    const daysRemaining = avgSales > 0 ? Math.floor(stock / avgSales) : 999;

    if (stock <= 0) {
      recommendations.push({
        type: 'urgent',
        productId: product.id,
        productName: product.name,
        message: `«${product.name}» закончился! Срочно создайте заказ.`,
        action: 'create_order',
        priority: 1,
      });
    } else if (daysRemaining <= 2) {
      const recommendedQty = Math.ceil(avgSales * 7); // 7 days supply
      recommendations.push({
        type: 'warning',
        productId: product.id,
        productName: product.name,
        message: `«${product.name}» закончится через ${daysRemaining} дн. Рекомендуемый заказ: ${recommendedQty} ${product.unit}.`,
        action: 'create_order',
        recommendedQty,
        priority: 2,
      });
    } else if (daysRemaining <= 5 && daysRemaining > 2) {
      recommendations.push({
        type: 'info',
        productId: product.id,
        productName: product.name,
        message: `«${product.name}» — запас на ${daysRemaining} дн. Планируйте заказ.`,
        action: 'plan_order',
        priority: 3,
      });
    }

    // Suggest min stock adjustment based on sales trend
    if (avgSales > 0 && stock > minStock * 3) {
      recommendations.push({
        type: 'info',
        productId: product.id,
        productName: product.name,
        message: `«${product.name}» — рассмотрите снижение минимального остатка (текущий: ${minStock}).`,
        action: 'adjust_threshold',
        priority: 4,
      });
    }
  }

  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority);
  return recommendations.slice(0, 10);
}
