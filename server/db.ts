import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, suppliers, supplierProducts, orders, orderItems, salesHistory, businessProfiles } from "../drizzle/schema";
import { ENV } from './_core/env';
import mockStore from './serpin-mock';

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
// Inventory module - Query Helpers
// ============================================================================



// ============================================================================
// Inventory module — use in-memory mock store for reliable demo.
// Falls back / prefers mock so tournament demo always works.
// ============================================================================

const USE_MOCK = true; // Always use mock for stable demo. Set false to prefer real DB.

function useMock(): boolean {
  return USE_MOCK;
}

// --- Products ---
export async function getProducts(businessId: number) {
  if (useMock()) return mockStore.getProducts(businessId);
  const db = await getDb();
  if (!db) return mockStore.getProducts(businessId);
  const rows = await db.select().from(products).where(eq(products.businessId, businessId));
  if (rows.length === 0 && businessId === 1) return mockStore.getProducts(businessId);
  return rows;
}

export async function getProductById(id: number) {
  if (useMock()) return mockStore.getProductById(id);
  const db = await getDb();
  if (!db) return mockStore.getProductById(id);
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? mockStore.getProductById(id);
}

export async function createProduct(data: any) {
  if (useMock()) return mockStore.createProduct(data);
  const db = await getDb();
  if (!db) return mockStore.createProduct(data);
  const [result] = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: any) {
  if (useMock()) return mockStore.updateProduct(id, data);
  const db = await getDb();
  if (!db) return mockStore.updateProduct(id, data);
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  if (useMock()) return mockStore.deleteProduct(id);
  const db = await getDb();
  if (!db) return mockStore.deleteProduct(id);
  await db.delete(products).where(eq(products.id, id));
}

export async function updateStock(id: number, newStock: number) {
  if (useMock()) return mockStore.updateStock(id, newStock);
  const db = await getDb();
  if (!db) return mockStore.updateStock(id, newStock);
  const status = newStock <= 0 ? "out_of_stock" : newStock <= 10 ? "critical" : newStock <= 20 ? "low_stock" : "in_stock";
  await db.update(products).set({
    currentStock: String(newStock),
    status: status as any,
  }).where(eq(products.id, id));
}

// --- Suppliers ---
export async function getSuppliers(businessId: number) {
  if (useMock()) return mockStore.getSuppliers(businessId);
  const db = await getDb();
  if (!db) return mockStore.getSuppliers(businessId);
  const rows = await db.select().from(suppliers).where(eq(suppliers.businessId, businessId));
  if (rows.length === 0 && businessId === 1) return mockStore.getSuppliers(businessId);
  return rows;
}

export async function getSupplierById(id: number) {
  if (useMock()) return mockStore.getSupplierById(id);
  const db = await getDb();
  if (!db) return mockStore.getSupplierById(id);
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0] ?? mockStore.getSupplierById(id);
}

export async function createSupplier(data: any) {
  if (useMock()) return mockStore.createSupplier(data);
  const db = await getDb();
  if (!db) return mockStore.createSupplier(data);
  const [result] = await db.insert(suppliers).values(data);
  return result;
}

export async function updateSupplier(id: number, data: any) {
  if (useMock()) return mockStore.updateSupplier(id, data);
  const db = await getDb();
  if (!db) return mockStore.updateSupplier(id, data);
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  if (useMock()) return mockStore.deleteSupplier(id);
  const db = await getDb();
  if (!db) return mockStore.deleteSupplier(id);
  await db.delete(suppliers).where(eq(suppliers.id, id));
}

// --- Supplier Products / Comparison ---
export async function getSupplierProducts(supplierId: number) {
  if (useMock()) return mockStore.getSupplierProductsBySupplier(supplierId);
  const db = await getDb();
  if (!db) return mockStore.getSupplierProductsBySupplier(supplierId);
  return db.select().from(supplierProducts).where(eq(supplierProducts.supplierId, supplierId));
}

export async function getProductsBySupplier(supplierId: number, productId: number) {
  if (useMock()) {
    const all = mockStore.getSupplierProductsBySupplier(supplierId);
    return all.filter((sp: any) => sp.productId === productId);
  }
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierProducts)
    .where(and(eq(supplierProducts.supplierId, supplierId), eq(supplierProducts.productId, productId)));
}

export async function getSuppliersForProduct(productId: number) {
  if (useMock()) return mockStore.getSupplierProductsForProduct(productId);
  const db = await getDb();
  if (!db) return mockStore.getSupplierProductsForProduct(productId);
  const spList = await db.select().from(supplierProducts).where(eq(supplierProducts.productId, productId));
  if (spList.length === 0) return mockStore.getSupplierProductsForProduct(productId);
  const supplierIds = [...new Set(spList.map((sp: any) => sp.supplierId))];
  const supplierList = supplierIds.length
    ? await db.select().from(suppliers).where(sql`${suppliers.id} IN (${sql.join(supplierIds.map((id: number) => sql`${id}`), sql`, `)})`)
    : [];
  return { supplierProducts: spList, suppliers: supplierList };
}

export async function createSupplierProduct(data: any) {
  if (useMock()) return { insertId: 0 };
  const db = await getDb();
  if (!db) return { insertId: 0 };
  const [result] = await db.insert(supplierProducts).values(data);
  return result;
}

// --- Orders ---
export async function getOrders(businessId: number) {
  if (useMock()) return mockStore.getOrders(businessId);
  const db = await getDb();
  if (!db) return mockStore.getOrders(businessId);
  const rows = await db.select().from(orders).where(eq(orders.businessId, businessId)).orderBy(desc(orders.createdAt));
  if (rows.length === 0 && businessId === 1) return mockStore.getOrders(businessId);
  return rows;
}

export async function getOrderById(id: number) {
  if (useMock()) return mockStore.getOrderById(id);
  const db = await getDb();
  if (!db) return mockStore.getOrderById(id);
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? mockStore.getOrderById(id);
}

export async function createOrder(data: any) {
  if (useMock()) {
    const { items, ...orderData } = data;
    return mockStore.createOrder({ ...orderData, items: items || [] });
  }
  const db = await getDb();
  if (!db) {
    const { items, ...orderData } = data;
    return mockStore.createOrder({ ...orderData, items: items || [] });
  }
  const [result] = await db.insert(orders).values(data);
  return result;
}

export async function createOrderItems(items: any[]) {
  if (useMock()) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(orderItems).values(items);
}

export async function getOrderItems(orderId: number) {
  if (useMock()) return mockStore.getOrderItems(orderId);
  const db = await getDb();
  if (!db) return mockStore.getOrderItems(orderId);
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(id: number, status: string) {
  if (useMock()) return mockStore.updateOrderStatus(id, status as any);
  const db = await getDb();
  if (!db) return mockStore.updateOrderStatus(id, status as any);
  await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, id));
}

// --- Sales History & Forecast ---
export async function getSalesHistory(businessId: number, productId: number, days = 30) {
  if (useMock()) return mockStore.getSalesHistory(businessId, productId, days);
  const db = await getDb();
  if (!db) return mockStore.getSalesHistory(businessId, productId, days);
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

export async function createSale(data: any) {
  if (useMock()) return { insertId: 0 };
  const db = await getDb();
  if (!db) return { insertId: 0 };
  const [result] = await db.insert(salesHistory).values(data);
  return result;
}

export async function getForecast(businessId: number, productId: number) {
  if (useMock()) return mockStore.getForecast(businessId, productId);
  // Real DB path would compute similarly; for now use mock logic with real history if available
  return mockStore.getForecast(businessId, productId);
}

// --- Business Profile ---
export async function getBusinessProfile(userId: number) {
  if (useMock()) return mockStore.getBusinessProfile(userId);
  const db = await getDb();
  if (!db) return mockStore.getBusinessProfile(userId);
  const result = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : mockStore.getBusinessProfile(userId);
}

export async function upsertBusinessProfile(data: any) {
  if (useMock()) return mockStore.upsertBusinessProfile(data);
  const db = await getDb();
  if (!db) return mockStore.upsertBusinessProfile(data);
  const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, data.userId)).limit(1);
  if (existing.length > 0) {
    await db.update(businessProfiles).set(data).where(eq(businessProfiles.userId, data.userId));
  } else {
    await db.insert(businessProfiles).values(data);
  }
}

// --- Dashboard Aggregations ---
export async function getDashboardMetrics(businessId: number) {
  if (useMock()) return mockStore.getDashboardMetrics(businessId);
  const db = await getDb();
  if (!db) return mockStore.getDashboardMetrics(businessId);
  // Prefer mock if empty
  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  if (allProducts.length === 0 && businessId === 1) return mockStore.getDashboardMetrics(businessId);

  const allSuppliers = await db.select().from(suppliers).where(eq(suppliers.businessId, businessId));
  const allOrders = await db.select().from(orders).where(eq(orders.businessId, businessId));

  const totalProducts = allProducts.length;
  const lowStockCount = allProducts.filter(p => p.status === 'low_stock').length;
  const criticalCount = allProducts.filter(p => p.status === 'critical' || p.status === 'out_of_stock').length;
  const activeOrders = allOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
  const totalValue = allProducts.reduce((sum, p) => sum + (Number(p.currentStock) * Number(p.costPrice)), 0);
  const potentialSavings = allOrders.filter(o => o.isAutoOrder).reduce((sum, o) => sum + Number(o.totalAmount) * 0.1, 0);
  const avgDelivery = allSuppliers.length > 0
    ? allSuppliers.reduce((s, x) => s + Number(x.avgDeliveryDays), 0) / allSuppliers.length : 0;
  const missedDeliveries = allSuppliers.reduce((s, x) => s + (x.lateDeliveryCount || 0), 0);

  return {
    totalProducts,
    lowStockCount,
    criticalCount,
    activeOrders,
    deliveredOrders,
    totalSuppliers: allSuppliers.length,
    totalInventoryValue: Math.round(totalValue),
    autoOrderSavings: Math.round(potentialSavings),
    avgDeliveryDays: Math.round(avgDelivery * 10) / 10,
    missedDeliveries,
  };
}

// --- AI Recommendations ---
export async function getAIRecommendations(businessId: number) {
  if (useMock()) return mockStore.getAIRecommendations(businessId);
  const db = await getDb();
  if (!db) return mockStore.getAIRecommendations(businessId);
  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  if (allProducts.length === 0 && businessId === 1) return mockStore.getAIRecommendations(businessId);

  const recommendations: any[] = [];
  for (const product of allProducts) {
    const stock = Number(product.currentStock);
    const minStock = Number(product.minStock);
    const avgSales = Number(product.avgSalesPerDay);
    const daysRemaining = avgSales > 0 ? Math.floor(stock / avgSales) : 999;

    if (stock <= 0) {
      recommendations.push({
        type: 'urgent', productId: product.id, productName: product.name,
        message: `«${product.name}» закончился! Срочно создайте заказ.`,
        action: 'create_order', priority: 1,
      });
    } else if (daysRemaining <= 2) {
      const recommendedQty = Math.ceil(avgSales * 7);
      recommendations.push({
        type: 'warning', productId: product.id, productName: product.name,
        message: `«${product.name}» закончится через ${daysRemaining} дн. Рекомендуемый заказ: ${recommendedQty} ${product.unit}.`,
        action: 'create_order', recommendedQty, priority: 2,
      });
    } else if (daysRemaining <= 5 && daysRemaining > 2) {
      recommendations.push({
        type: 'info', productId: product.id, productName: product.name,
        message: `«${product.name}» — запас на ${daysRemaining} дн. Планируйте заказ.`,
        action: 'plan_order', priority: 3,
      });
    }
  }
  recommendations.sort((a, b) => a.priority - b.priority);
  return recommendations.slice(0, 10);
}

// Simulate sale for demo scenario
export async function simulateSale(productId: number, qty = 5) {
  return mockStore.simulateSale(productId, qty);
}
