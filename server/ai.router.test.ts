import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock invokeLLM to avoid real API calls in tests
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "📊 Test Insight",
            description: "Test description",
            action: "Test action",
            urgency: "high",
            estimatedImpact: "₸5,000",
            icon: "💡",
          }),
        },
      },
    ],
  }),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("ai.dashboardInsight", () => {
  it("returns a structured insight object", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.dashboardInsight({
      businessName: "Test Coffee Shop",
      businessType: "coffee_shop",
      activeCustomers: 100,
      atRiskCustomers: 20,
      vipCustomers: 30,
      weeklyRevenue: 50000,
      conversionRate: 25,
      retentionRate: 80,
      peakHoursStart: "09:00",
      peakHoursEnd: "11:00",
      quietHoursStart: "14:00",
      quietHoursEnd: "16:00",
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("action");
    expect(result).toHaveProperty("urgency");
    expect(result).toHaveProperty("estimatedImpact");
    expect(result).toHaveProperty("icon");
    expect(["low", "medium", "high"]).toContain(result.urgency);
  });
});

describe("ai.churnPrediction", () => {
  it("returns churn prediction with correct risk levels", async () => {
    vi.mocked(await import("./_core/llm")).invokeLLM.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              churnRisk: "High",
              churnProbability: 78,
              nextBestAction: "Send urgent offer",
              recommendedOffer: "Free item + 20% off",
              recommendedChannel: "whatsapp",
              reasoning: "Inactive for 35 days",
            }),
          },
        },
      ],
    } as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.churnPrediction({
      customerName: "Aibek Seitkali",
      daysSinceLastVisit: 35,
      totalVisits: 12,
      totalSpent: 34200,
      averageOrderValue: 2850,
    });

    expect(result).toHaveProperty("churnRisk");
    expect(result).toHaveProperty("churnProbability");
    expect(result.churnProbability).toBeGreaterThanOrEqual(0);
    expect(result.churnProbability).toBeLessThanOrEqual(100);
    expect(["Low", "Medium", "High"]).toContain(result.churnRisk);
    expect(result).toHaveProperty("nextBestAction");
    expect(result).toHaveProperty("recommendedOffer");
    expect(result).toHaveProperty("recommendedChannel");
  });
});

describe("ai.campaignCopy", () => {
  it("returns campaign copy with strength score", async () => {
    vi.mocked(await import("./_core/llm")).invokeLLM.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              message: "Hi {First_Name}! 20% off today. Code: SAVE20",
              variables: ["First_Name"],
              strength: 88,
              tips: ["Add urgency", "Use emoji"],
            }),
          },
        },
      ],
    } as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.campaignCopy({
      goal: "Win back inactive customers",
      segment: "Inactive 14+ days",
      tone: "Friendly",
      businessName: "Test Coffee",
      businessType: "coffee_shop",
    });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("strength");
    expect(result.strength).toBeGreaterThanOrEqual(0);
    expect(result.strength).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty("tips");
    expect(Array.isArray(result.tips)).toBe(true);
  });
});
