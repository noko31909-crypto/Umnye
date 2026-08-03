/**
 * Jaqyn AI Copilot Engine
 * Centralized AI infrastructure, prompt templates, and mock data
 */

export type AITone = "friendly" | "professional" | "urgent" | "casual";
export type ChurnRisk = "low" | "medium" | "high";

export interface AIContext {
  businessName: string;
  businessType: string;
  businessHours: { start: string; end: string };
  peakHours: { start: string; end: string };
  quietHours: { start: string; end: string };
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  vipCustomers: number;
  weeklyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  retentionRate: number;
}

export interface AIRecommendation {
  title: string;
  description: string;
  action: string;
  urgency: "low" | "medium" | "high";
  estimatedImpact: string;
  icon: string;
}

export interface AIInsight {
  type: "weather" | "segment" | "trend" | "opportunity";
  title: string;
  description: string;
  data: Record<string, unknown>;
  suggestedAction: string;
  confidence: number; // 0-100
}

export interface AICampaignSuggestion {
  goal: string;
  targetSegment: string;
  channel: string;
  message: string;
  tone: AITone;
  offerStrength: number; // 0-100
  estimatedReach: number;
  estimatedConversion: number;
  estimatedROI: number;
}

export interface AICustomerInsight {
  customerId: number;
  churnRisk: ChurnRisk;
  churnProbability: number; // 0-100
  nextBestAction: string;
  recommendedOffer: string;
  recommendedChannel: string;
  estimatedLifetimeValue: number;
}

// Prompt templates for different AI contexts
export const AI_PROMPTS = {
  // Dashboard insights
  dashboardInsight: (context: AIContext) => `
You are Jaqyn, an AI Growth Copilot for local businesses in Kazakhstan. 
Analyze this business context and provide ONE actionable insight:

Business: ${context.businessName} (${context.businessType})
Active Customers: ${context.activeCustomers}
At-Risk Customers: ${context.atRiskCustomers}
Weekly Revenue: ₸${context.weeklyRevenue.toLocaleString()}
Conversion Rate: ${context.conversionRate}%
Retention Rate: ${context.retentionRate}%
Current Time: ${new Date().toLocaleString("kk-KZ")}

Provide a JSON response with: title, description, action, urgency (low/medium/high), estimatedImpact, icon
Focus on weather-triggered, time-based, or segment-based opportunities.
  `,

  // Campaign copywriting
  campaignCopy: (
    goal: string,
    segment: string,
    tone: AITone,
    businessName: string,
    businessType: string
  ) => `
You are a marketing copywriter for ${businessName}, a ${businessType} in Kazakhstan.
Write a compelling campaign message for: ${goal}
Target segment: ${segment}
Tone: ${tone}

Requirements:
- Max 160 characters (SMS-friendly)
- Include {First_Name} placeholder
- Include a clear call-to-action
- Use Kazakhstani context and preferences
- Be persuasive but authentic

Respond with JSON: { message: "...", variables: [...], strength: 0-100, tips: [...] }
  `,

  // Customer churn prediction
  churnPrediction: (
    customerName: string,
    lastVisit: string,
    totalVisits: number,
    totalSpent: number,
    averageOrderValue: number
  ) => `
Predict churn risk for customer: ${customerName}
Last visit: ${lastVisit}
Total visits: ${totalVisits}
Total spent: ₸${totalSpent}
Average order value: ₸${averageOrderValue}

Respond with JSON: {
  churnRisk: "low" | "medium" | "high",
  churnProbability: 0-100,
  nextBestAction: "...",
  recommendedOffer: "...",
  recommendedChannel: "sms" | "whatsapp" | "email" | "push"
}
  `,

  // Analytics insights
  analyticsInsight: (
    campaignName: string,
    sent: number,
    conversions: number,
    revenue: number,
    roi: number
  ) => `
Analyze campaign performance:
Campaign: ${campaignName}
Sent: ${sent}
Conversions: ${conversions}
Revenue: ₸${revenue}
ROI: ${roi}x

Provide JSON with: explanation (why this ROI?), nextStep (what to do next?), timing (when to execute?)
  `,
};

// Mock AI responses for development/demo
export const MOCK_AI_RESPONSES = {
  dashboardInsight: {
    title: "📊 Rainy Tuesday Opportunity",
    description:
      "Weather forecast shows rain this Tuesday afternoon. Foot traffic typically drops 30% during rain. 47 VIP customers haven't visited in 14+ days.",
    action: "Send 20% discount on Hot Latte via WhatsApp to inactive VIPs",
    urgency: "high" as const,
    estimatedImpact: "₸8,500 additional revenue",
    icon: "☔",
  },

  campaignCopy: {
    message: "Hi {First_Name}! ☕ Rainy day? Warm up with 20% off Hot Latte. Code: COZY20",
    variables: ["First_Name"],
    strength: 92,
    tips: [
      "High urgency + weather trigger = 45% higher open rate",
      "Emoji increases engagement by 32%",
      "Time-sensitive offer drives immediate action",
    ],
  },

  churnPrediction: {
    churnRisk: "high" as const,
    churnProbability: 78,
    nextBestAction: "Send personalized re-engagement offer with free pastry",
    recommendedOffer: "Free croissant on next visit + 15% off total",
    recommendedChannel: "whatsapp" as const,
  },

  analyticsInsight: {
    explanation:
      "Campaign 'Coffee Comeback' generated ₸31,400 with a 3.2x ROI because it targeted customers inactive for 14+ days using WhatsApp (highest engagement channel for this segment). Time-sensitive offer (48-hour validity) created urgency.",
    nextStep:
      "Re-engage 'At Risk' segment (currently 23 customers) next Thursday at 15:00 for maximum conversion during quiet hours.",
    timing: "Thursday 15:00-17:00",
  },

  quickActions: [
    {
      title: "Analyze Quiet Hours",
      description: "Get recommendations for boosting traffic during slow periods",
      icon: "⏰",
    },
    {
      title: "Generate Offer",
      description: "AI-powered promo for your inactive customer segment",
      icon: "🎁",
    },
    {
      title: "Predict Traffic",
      description: "Forecast today's foot traffic based on weather & trends",
      icon: "📈",
    },
    {
      title: "Customer Health",
      description: "Identify at-risk customers and retention opportunities",
      icon: "❤️",
    },
  ],
};

// Utility functions for AI operations
export function generateAIContext(businessData: Partial<AIContext>): AIContext {
  return {
    businessName: businessData.businessName || "Coffee Shop",
    businessType: businessData.businessType || "coffee_shop",
    businessHours: businessData.businessHours || { start: "08:00", end: "22:00" },
    peakHours: businessData.peakHours || { start: "09:00", end: "11:00" },
    quietHours: businessData.quietHours || { start: "14:00", end: "16:00" },
    totalCustomers: businessData.totalCustomers || 1250,
    activeCustomers: businessData.activeCustomers || 890,
    atRiskCustomers: businessData.atRiskCustomers || 47,
    vipCustomers: businessData.vipCustomers || 156,
    weeklyRevenue: businessData.weeklyRevenue || 112100,
    averageOrderValue: businessData.averageOrderValue || 2850,
    conversionRate: businessData.conversionRate || 23.4,
    retentionRate: businessData.retentionRate || 82,
  };
}

export function calculateOfferStrength(
  tone: AITone,
  discountPercent: number,
  urgency: boolean,
  personalization: boolean
): number {
  let score = 50;

  // Tone impact
  if (tone === "urgent") score += 15;
  if (tone === "friendly") score += 10;

  // Discount impact
  if (discountPercent >= 20) score += 15;
  if (discountPercent >= 30) score += 10;

  // Urgency impact
  if (urgency) score += 10;

  // Personalization impact
  if (personalization) score += 15;

  return Math.min(100, score);
}

export function predictChurnRisk(
  daysSinceLastVisit: number,
  totalVisits: number,
  averageVisitFrequency: number
): ChurnRisk {
  const expectedDaysBetweenVisits = 30 / averageVisitFrequency;
  const daysOverdue = daysSinceLastVisit - expectedDaysBetweenVisits;

  if (daysOverdue > 30) return "high";
  if (daysOverdue > 14) return "medium";
  return "low";
}

export function getChurnProbability(churnRisk: ChurnRisk): number {
  switch (churnRisk) {
    case "high":
      return 70 + Math.random() * 30;
    case "medium":
      return 40 + Math.random() * 30;
    case "low":
      return Math.random() * 20;
  }
}
