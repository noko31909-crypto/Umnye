/**
 * Lightweight inventory tRPC router for Vercel serverless.
 * Uses in-memory mock only — no mysql2 / OAuth imports.
 */
import { z } from "zod";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import mockStore from "./serpin-mock";

const t = initTRPC.create({ transformer: superjson });
const publicProcedure = t.procedure;
const router = t.router;

export const inventoryAppRouter = router({
  serpin: router({
    products: router({
      list: publicProcedure
        .input(z.object({ businessId: z.number() }))
        .query(({ input }) => mockStore.getProducts(input.businessId)),
      byId: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => mockStore.getProductById(input.id)),
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
        .mutation(({ input }) => {
          const result = mockStore.createProduct(input);
          return { success: true, insertId: result.insertId };
        }),
      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ input }) => {
          mockStore.deleteProduct(input.id);
          return { success: true };
        }),
      updateStock: publicProcedure
        .input(z.object({ id: z.number(), newStock: z.number() }))
        .mutation(({ input }) => {
          mockStore.updateStock(input.id, input.newStock);
          return { success: true };
        }),
    }),
    suppliers: router({
      list: publicProcedure
        .input(z.object({ businessId: z.number() }))
        .query(({ input }) => mockStore.getSuppliers(input.businessId)),
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
        .mutation(({ input }) => {
          const result = mockStore.createSupplier(input as any);
          return { success: true, insertId: result.insertId };
        }),
      forProduct: publicProcedure
        .input(z.object({ productId: z.number() }))
        .query(({ input }) => mockStore.getSupplierProductsForProduct(input.productId)),
    }),
    orders: router({
      list: publicProcedure
        .input(z.object({ businessId: z.number() }))
        .query(({ input }) => mockStore.getOrders(input.businessId)),
      byId: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => {
          const order = mockStore.getOrderById(input.id);
          const items = order ? mockStore.getOrderItems(order.id) : [];
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
        .mutation(({ input }) => {
          const { items, ...orderData } = input;
          const result = mockStore.createOrder({ ...orderData, items });
          return { success: true, orderId: result.orderId };
        }),
      updateStatus: publicProcedure
        .input(z.object({ id: z.number(), status: z.string() }))
        .mutation(({ input }) => {
          mockStore.updateOrderStatus(input.id, input.status as any);
          return { success: true };
        }),
    }),
    forecast: router({
      demand: publicProcedure
        .input(z.object({
          businessId: z.number(),
          productId: z.number(),
          forecastDays: z.number().default(14),
        }))
        .query(({ input }) => mockStore.getForecast(input.businessId, input.productId)),
    }),
    profile: router({
      get: publicProcedure
        .input(z.object({ userId: z.number() }))
        .query(({ input }) => mockStore.getBusinessProfile(input.userId)),
      upsert: publicProcedure
        .input(z.object({
          userId: z.number(),
          businessType: z.enum(["coffee_shop", "store", "pharmacy", "bakery", "restaurant", "other"]),
          locationsCount: z.number().default(1),
          productCategories: z.string().optional(),
          autoOrderThreshold: z.string().default("1.5"),
          preferredDeliveryDays: z.number().default(3),
        }))
        .mutation(({ input }) => {
          mockStore.upsertBusinessProfile(input);
          return { success: true };
        }),
    }),
    dashboard: router({
      metrics: publicProcedure
        .input(z.object({ businessId: z.number() }))
        .query(({ input }) => mockStore.getDashboardMetrics(input.businessId)),
      recommendations: publicProcedure
        .input(z.object({ businessId: z.number() }))
        .query(({ input }) => mockStore.getAIRecommendations(input.businessId)),
    }),
    demo: router({
      simulateSale: publicProcedure
        .input(z.object({ productId: z.number(), qty: z.number().default(5) }))
        .mutation(({ input }) => {
          const product = mockStore.simulateSale(input.productId, input.qty);
          return { success: true, product };
        }),
    }),
  }),
});

export type InventoryAppRouter = typeof inventoryAppRouter;
