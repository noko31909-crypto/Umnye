import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aiRouter } from "./ai.router";
import { z } from "zod";
import * as db from "./db";

// ============================================================================
// SERPIN MVP Routers
// ============================================================================

// --- Products Router ---
export const productsRouter = router({
  list: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(({ input }) => db.getProducts(input.businessId)),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getProductById(input.id)),

  create: publicProcedure
    .input(z.object({
      businessId: z.number(),
      name: z.string(),
      category: z.string(),
      unit: z.string().default("шт"),
      currentStock: z.string().default("0"),
      minStock: z.string().default("10"),
      maxStock: z.string().default("100"),
      avgSalesPerDay: z.string().default("0"),
      costPrice: z.string().default("0"),
      sellingPrice: z.string().default("0"),
      preferredSupplierId: z.number().nullable().optional(),
      autoOrderEnabled: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const result = await db.createProduct(input);
      return { success: true, insertId: result?.insertId };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        minStock: z.string().optional(),
        maxStock: z.string().optional(),
        avgSalesPerDay: z.string().optional(),
        costPrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        autoOrderEnabled: z.boolean().optional(),
        preferredSupplierId: z.number().nullable().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      await db.updateProduct(input.id, input.data);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteProduct(input.id);
      return { success: true };
    }),

  updateStock: publicProcedure
    .input(z.object({ id: z.number(), newStock: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateStock(input.id, input.newStock);
      return { success: true };
    }),
});

// --- Suppliers Router ---
export const suppliersRouter = router({
  list: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(({ input }) => db.getSuppliers(input.businessId)),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getSupplierById(input.id)),

  forProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(({ input }) => db.getSuppliersForProduct(input.productId)),

  create: publicProcedure
    .input(z.object({
      businessId: z.number(),
      name: z.string(),
      category: z.string(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      avgDeliveryDays: z.string().default("3"),
      reliabilityScore: z.string().default("90"),
    }))
    .mutation(async ({ input }) => {
      const result = await db.createSupplier(input);
      return { success: true, insertId: result?.insertId };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        avgDeliveryDays: z.string().optional(),
        reliabilityScore: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      await db.updateSupplier(input.id, input.data);
      return { success: true };
    }),

  products: publicProcedure
    .input(z.object({ supplierId: z.number() }))
    .query(({ input }) => db.getSupplierProducts(input.supplierId)),
});

// --- Supplier Products Router ---
export const supplierProductsRouter = router({
  create: publicProcedure
    .input(z.object({
      supplierId: z.number(),
      productId: z.number(),
      price: z.string(),
      minOrderQty: z.string().default("1"),
      inStock: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      await db.createSupplierProduct(input);
      return { success: true };
    }),
});

// --- Orders Router ---
export const ordersRouter = router({
  list: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(({ input }) => db.getOrders(input.businessId)),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await db.getOrderById(input.id);
      const items = order ? await db.getOrderItems(order.id) : [];
      return { order, items };
    }),

  create: publicProcedure
    .input(z.object({
      businessId: z.number(),
      supplierId: z.number(),
      totalAmount: z.string().default("0"),
      expectedDeliveryDate: z.date().optional(),
      notes: z.string().optional(),
      isAutoOrder: z.boolean().default(false),
      createdBy: z.number().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.string(),
        price: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const { items, ...orderData } = input;
      // Pass items so mock store can create order + items atomically
      const result = await db.createOrder({ ...orderData, items });
      const orderId = result?.orderId ?? result?.insertId;
      // Real DB path may still need separate insert
      if (orderId && result && !result.orderId) {
        await db.createOrderItems(items.map(item => ({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })));
      }
      return { success: true, orderId };
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
});

// --- Sales History Router ---
export const salesRouter = router({
  history: publicProcedure
    .input(z.object({ businessId: z.number(), productId: z.number(), days: z.number().default(30) }))
    .query(({ input }) => db.getSalesHistory(input.businessId, input.productId, input.days)),

  create: publicProcedure
    .input(z.object({
      businessId: z.number(),
      productId: z.number(),
      saleDate: z.date(),
      quantity: z.string(),
      revenue: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.createSale(input);
      return { success: true };
    }),
});

// --- Business Profile Router ---
export const profileRouter = router({
  get: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => db.getBusinessProfile(input.userId)),

  upsert: publicProcedure
    .input(z.object({
      userId: z.number(),
      businessType: z.enum(["coffee_shop", "store", "pharmacy", "bakery", "restaurant", "other"]),
      locationsCount: z.number().default(1),
      productCategories: z.string().optional(),
      autoOrderThreshold: z.string().default("1.5"),
      preferredDeliveryDays: z.number().default(3),
    }))
    .mutation(async ({ input }) => {
      await db.upsertBusinessProfile(input);
      return { success: true };
    }),
});

// --- Forecast Router ---
export const forecastRouter = router({
  demand: publicProcedure
    .input(z.object({
      businessId: z.number(),
      productId: z.number(),
      forecastDays: z.number().default(14),
    }))
    .query(async ({ input }) => {
      const data = await db.getForecast(input.businessId, input.productId);
      return data;
    }),
});

// --- Demo helpers ---
export const demoRouter = router({
  simulateSale: publicProcedure
    .input(z.object({ productId: z.number(), qty: z.number().default(5) }))
    .mutation(async ({ input }) => {
      const result = await db.simulateSale(input.productId, input.qty);
      return { success: true, product: result };
    }),
});

// --- Dashboard Router ---
export const dashboardRouter = router({
  metrics: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(({ input }) => db.getDashboardMetrics(input.businessId)),

  recommendations: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(({ input }) => db.getAIRecommendations(input.businessId)),
});

// --- Combined SERPIN Router ---
export const serpinRouter = router({
  products: productsRouter,
  suppliers: suppliersRouter,
  supplierProducts: supplierProductsRouter,
  orders: ordersRouter,
  sales: salesRouter,
  forecast: forecastRouter,
  profile: profileRouter,
  dashboard: dashboardRouter,
  demo: demoRouter,
});

// ============================================================================
// Main App Router
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  ai: aiRouter,
  serpin: serpinRouter,
});

export type AppRouter = typeof appRouter;
