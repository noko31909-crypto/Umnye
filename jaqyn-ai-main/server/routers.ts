import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { aiRouter } from "./ai.router";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
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

  // Business procedures
  business: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getBusinessesByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return db.getBusinessById(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createBusiness({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        workingHoursStart: z.string().optional(),
        workingHoursEnd: z.string().optional(),
        peakHoursStart: z.string().optional(),
        peakHoursEnd: z.string().optional(),
        quietHoursStart: z.string().optional(),
        quietHoursEnd: z.string().optional(),
        targetROI: z.string().optional(),
        onboardingComplete: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { businessId, ...data } = input;
        await db.updateBusiness(businessId, data);
        return { success: true };
      }),
  }),

  // Customer procedures
  customer: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getCustomersByBusinessId(input.businessId, input.limit, input.offset);
      }),

    getById: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getCustomerById(input.customerId);
      }),

    search: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        query: z.string().min(1),
      }))
      .query(async ({ input }) => {
        return db.searchCustomers(input.businessId, input.query);
      }),

    getByStatus: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.enum(["active", "at_risk", "churned", "vip"]),
      }))
      .query(async ({ input }) => {
        return db.getCustomersByStatus(input.businessId, input.status);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        name: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        status: z.enum(["active", "at_risk", "churned", "vip"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomer(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.enum(["active", "at_risk", "churned", "vip"]).optional(),
        totalVisits: z.number().optional(),
        totalSpent: z.string().optional(),
        averageOrderValue: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { customerId, ...data } = input;
        await db.updateCustomer(customerId, data);
        return { success: true };
      }),

    getInteractions: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getCustomerInteractionsByCustomerId(input.customerId);
      }),
  }),

  // Campaign procedures
  campaign: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return db.getCampaignsByBusinessId(input.businessId);
      }),

    getById: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return db.getCampaignById(input.campaignId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        name: z.string().min(1),
        goal: z.string().min(1),
        targetSegment: z.string().min(1),
        message: z.string().min(1),
        channels: z.string().min(1),
        scheduledFor: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCampaign(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        status: z.enum(["draft", "scheduled", "sent", "completed"]).optional(),
        sentCount: z.number().optional(),
        deliveredCount: z.number().optional(),
        clickCount: z.number().optional(),
        conversionCount: z.number().optional(),
        revenueGenerated: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...data } = input;
        await db.updateCampaign(campaignId, data);
        return { success: true };
      }),

    launch: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        sentCount: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateCampaign(input.campaignId, {
          status: "sent",
          sentCount: input.sentCount,
        });
        return { success: true };
      }),
  }),

  // Integration procedures
  integration: router({
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return db.getIntegrationsByBusinessId(input.businessId);
      }),

    getById: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .query(async ({ input }) => {
        return db.getIntegrationById(input.integrationId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        type: z.string().min(1),
        name: z.string().min(1),
        category: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.createIntegration(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        integrationId: z.number(),
        isActive: z.boolean().optional(),
        config: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { integrationId, ...data } = input;
        await db.updateIntegration(integrationId, data);
        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({
        integrationId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await db.updateIntegration(input.integrationId, { isActive: input.isActive });
        return { success: true };
      }),
  }),

  // Analytics procedures
  analytics: router({
    getByDateRange: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return db.getAnalyticsByBusinessAndDateRange(input.businessId, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        date: z.date(),
        revenue: z.string(),
        newCustomers: z.number(),
        repeatVisits: z.number(),
        totalVisits: z.number(),
        averageOrderValue: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createAnalytics(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
