import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

// ─── Prompt Templates ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Jaqyn AI, an expert AI Growth Copilot for local businesses in Kazakhstan.
You help business owners grow revenue through data-driven campaign recommendations, customer insights, and marketing strategies.
Always respond in a concise, actionable manner. Use ₸ (Tenge) for currency.
Format your responses with clear sections using markdown when appropriate.`;

function dashboardInsightPrompt(ctx: {
  businessName: string;
  businessType: string;
  activeCustomers: number;
  atRiskCustomers: number;
  vipCustomers: number;
  weeklyRevenue: number;
  conversionRate: number;
  retentionRate: number;
  peakHoursStart: string;
  peakHoursEnd: string;
  quietHoursStart: string;
  quietHoursEnd: string;
}) {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return `Analyze this business context and provide ONE high-priority actionable insight for today:

Business: ${ctx.businessName} (${ctx.businessType})
Current time: ${timeOfDay} on ${dayOfWeek}
Active Customers: ${ctx.activeCustomers}
At-Risk Customers: ${ctx.atRiskCustomers}
VIP Customers: ${ctx.vipCustomers}
Weekly Revenue: ₸${ctx.weeklyRevenue.toLocaleString()}
Conversion Rate: ${ctx.conversionRate}%
Retention Rate: ${ctx.retentionRate}%
Peak Hours: ${ctx.peakHoursStart}–${ctx.peakHoursEnd}
Quiet Hours: ${ctx.quietHoursStart}–${ctx.quietHoursEnd}

Respond with a JSON object (no markdown, just raw JSON):
{
  "title": "short emoji + title",
  "description": "2-3 sentence insight with specific numbers",
  "action": "specific recommended action",
  "urgency": "low|medium|high",
  "estimatedImpact": "₸X,XXX additional revenue",
  "icon": "single emoji"
}`;
}

function campaignCopyPrompt(
  goal: string,
  segment: string,
  tone: string,
  businessName: string,
  businessType: string
) {
  return `Write a compelling SMS/WhatsApp campaign message for ${businessName} (${businessType}).

Campaign Goal: ${goal}
Target Segment: ${segment}
Tone of Voice: ${tone}

Requirements:
- Max 160 characters (SMS-friendly)
- Include {First_Name} placeholder for personalization
- Include a clear call-to-action
- Use Kazakhstani context and preferences
- Be persuasive and authentic

Respond with a JSON object (no markdown, just raw JSON):
{
  "message": "the campaign message with {First_Name}",
  "variables": ["First_Name"],
  "strength": 0-100,
  "tips": ["tip1", "tip2", "tip3"]
}`;
}

function churnPredictionPrompt(
  customerName: string,
  daysSinceLastVisit: number,
  totalVisits: number,
  totalSpent: number,
  averageOrderValue: number
) {
  return `Predict churn risk for this customer and recommend an action:

Customer: ${customerName}
Days since last visit: ${daysSinceLastVisit}
Total visits: ${totalVisits}
Total spent: ₸${totalSpent.toLocaleString()}
Average order value: ₸${averageOrderValue.toLocaleString()}

Respond with a JSON object (no markdown, just raw JSON):
{
  "churnRisk": "Low|Medium|High",
  "churnProbability": 0-100,
  "nextBestAction": "specific action to take",
  "recommendedOffer": "specific offer text",
  "recommendedChannel": "sms|whatsapp|email|push",
  "reasoning": "brief explanation"
}`;
}

function analyticsInsightPrompt(
  campaignName: string,
  sent: number,
  conversions: number,
  revenue: number,
  roi: number
) {
  const conversionRate = sent > 0 ? ((conversions / sent) * 100).toFixed(1) : "0";
  return `Analyze this campaign performance and provide actionable next steps:

Campaign: ${campaignName}
Messages Sent: ${sent.toLocaleString()}
Conversions: ${conversions}
Conversion Rate: ${conversionRate}%
Revenue Generated: ₸${revenue.toLocaleString()}
ROI: ${roi}x

Respond with a JSON object (no markdown, just raw JSON):
{
  "explanation": "why this performance happened (2-3 sentences with specific factors)",
  "nextStep": "specific recommended next action",
  "timing": "optimal timing for next campaign",
  "projectedRevenue": "₸X,XXX-₸X,XXX range",
  "successFactors": ["factor1", "factor2", "factor3"]
}`;
}

function toolsRecommendationPrompt(
  businessType: string,
  activeIntegrations: string[],
  missingIntegrations: string[]
) {
  return `Recommend integrations for this business:

Business Type: ${businessType}
Active Integrations: ${activeIntegrations.join(", ") || "None"}
Available but not connected: ${missingIntegrations.join(", ")}

Respond with a JSON object (no markdown, just raw JSON):
{
  "topPriority": "most important integration to add",
  "reason": "why this is the top priority",
  "recommendations": [
    { "name": "integration name", "priority": "high|medium|low", "reason": "why", "estimatedImpact": "impact description" }
  ],
  "setupTip": "quick tip for getting started"
}`;
}

// ─── AI Router ───────────────────────────────────────────────────────────────

export const aiRouter = router({
  // General chat with Jaqyn AI
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        businessContext: z
          .object({
            businessName: z.string().optional(),
            businessType: z.string().optional(),
            activeCustomers: z.number().optional(),
            atRiskCustomers: z.number().optional(),
            weeklyRevenue: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemContent = input.businessContext
        ? `${SYSTEM_PROMPT}\n\nCurrent business context:\n- Business: ${input.businessContext.businessName || "Unknown"} (${input.businessContext.businessType || "local business"})\n- Active Customers: ${input.businessContext.activeCustomers || 0}\n- At-Risk Customers: ${input.businessContext.atRiskCustomers || 0}\n- Weekly Revenue: ₸${(input.businessContext.weeklyRevenue || 0).toLocaleString()}`
        : SYSTEM_PROMPT;

      const messages = [
        { role: "system" as const, content: systemContent },
        ...input.messages.filter((m) => m.role !== "system"),
      ];

      const result = await invokeLLM({ messages });
      return {
        content: extractContent(result.choices[0]?.message?.content) || "I couldn't generate a response. Please try again.",
      };
    }),

  // Dashboard AI insight
  dashboardInsight: publicProcedure
    .input(
      z.object({
        businessName: z.string(),
        businessType: z.string(),
        activeCustomers: z.number(),
        atRiskCustomers: z.number(),
        vipCustomers: z.number(),
        weeklyRevenue: z.number(),
        conversionRate: z.number(),
        retentionRate: z.number(),
        peakHoursStart: z.string().default("09:00"),
        peakHoursEnd: z.string().default("11:00"),
        quietHoursStart: z.string().default("14:00"),
        quietHoursEnd: z.string().default("16:00"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: dashboardInsightPrompt(input) },
        ],
      });

      const raw = extractContent(result.choices[0]?.message?.content) || "{}";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return {
          title: parsed.title || "📊 Business Insight",
          description: parsed.description || "Analyzing your business data...",
          action: parsed.action || "Review your customer segments",
          urgency: (parsed.urgency as "low" | "medium" | "high") || "medium",
          estimatedImpact: parsed.estimatedImpact || "₸5,000+ potential revenue",
          icon: parsed.icon || "💡",
        };
      } catch {
        return {
          title: "💡 AI Insight Ready",
          description: raw.slice(0, 200),
          action: "Review your business dashboard",
          urgency: "medium" as const,
          estimatedImpact: "₸5,000+ potential revenue",
          icon: "💡",
        };
      }
    }),

  // Campaign copywriting
  campaignCopy: publicProcedure
    .input(
      z.object({
        goal: z.string(),
        segment: z.string(),
        tone: z.enum(["Friendly", "Professional", "Urgent", "Casual"]),
        businessName: z.string(),
        businessType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: campaignCopyPrompt(
              input.goal,
              input.segment,
              input.tone,
              input.businessName,
              input.businessType
            ),
          },
        ],
      });

      const raw = extractContent(result.choices[0]?.message?.content) || "{}";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return {
          message: parsed.message || `Hi {First_Name}! Special offer just for you. Visit us today!`,
          variables: parsed.variables || ["First_Name"],
          strength: Math.min(100, Math.max(0, parsed.strength || 75)),
          tips: parsed.tips || ["Add personalization", "Include urgency", "Clear CTA"],
        };
      } catch {
        return {
          message: `Hi {First_Name}! ${input.goal}. Visit us today for an exclusive offer!`,
          variables: ["First_Name"],
          strength: 70,
          tips: ["Add personalization with {First_Name}", "Include a time-sensitive offer", "Keep under 160 characters"],
        };
      }
    }),

  // Customer churn prediction
  churnPrediction: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        daysSinceLastVisit: z.number(),
        totalVisits: z.number(),
        totalSpent: z.number(),
        averageOrderValue: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: churnPredictionPrompt(
              input.customerName,
              input.daysSinceLastVisit,
              input.totalVisits,
              input.totalSpent,
              input.averageOrderValue
            ),
          },
        ],
      });

      const raw = extractContent(result.choices[0]?.message?.content) || "{}";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return {
          churnRisk: (parsed.churnRisk as "Low" | "Medium" | "High") || "Medium",
          churnProbability: Math.min(100, Math.max(0, parsed.churnProbability || 50)),
          nextBestAction: parsed.nextBestAction || "Send a personalized re-engagement offer",
          recommendedOffer: parsed.recommendedOffer || "15% off on next visit",
          recommendedChannel: (parsed.recommendedChannel as "sms" | "whatsapp" | "email" | "push") || "whatsapp",
          reasoning: parsed.reasoning || "Based on visit frequency analysis",
        };
      } catch {
        const risk = input.daysSinceLastVisit > 30 ? "High" : input.daysSinceLastVisit > 14 ? "Medium" : "Low";
        return {
          churnRisk: risk as "Low" | "Medium" | "High",
          churnProbability: risk === "High" ? 75 : risk === "Medium" ? 50 : 20,
          nextBestAction: "Send a personalized re-engagement offer",
          recommendedOffer: "Free item on next visit + 15% off",
          recommendedChannel: "whatsapp" as const,
          reasoning: `Customer inactive for ${input.daysSinceLastVisit} days`,
        };
      }
    }),

  // Analytics diagnostics
  analyticsInsight: publicProcedure
    .input(
      z.object({
        campaignName: z.string(),
        sent: z.number(),
        conversions: z.number(),
        revenue: z.number(),
        roi: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: analyticsInsightPrompt(
              input.campaignName,
              input.sent,
              input.conversions,
              input.revenue,
              input.roi
            ),
          },
        ],
      });

      const raw = extractContent(result.choices[0]?.message?.content) || "{}";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return {
          explanation: parsed.explanation || "Campaign performed well based on targeting and timing.",
          nextStep: parsed.nextStep || "Re-engage the at-risk segment with a similar offer.",
          timing: parsed.timing || "Thursday 15:00-17:00",
          projectedRevenue: parsed.projectedRevenue || "₸7,000-₸10,000",
          successFactors: parsed.successFactors || ["Precise targeting", "Right channel", "Compelling offer"],
        };
      } catch {
        return {
          explanation: `Campaign '${input.campaignName}' generated ₸${input.revenue.toLocaleString()} with ${input.roi}x ROI through targeted messaging.`,
          nextStep: "Re-engage the at-risk segment with a similar offer next week.",
          timing: "Thursday 15:00-17:00",
          projectedRevenue: "₸7,000-₸10,000",
          successFactors: ["Precise targeting", "High-engagement channel", "Time-sensitive offer"],
        };
      }
    }),

  // Tools & integrations recommendation
  toolsRecommendation: publicProcedure
    .input(
      z.object({
        businessType: z.string(),
        activeIntegrations: z.array(z.string()),
        missingIntegrations: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: toolsRecommendationPrompt(
              input.businessType,
              input.activeIntegrations,
              input.missingIntegrations
            ),
          },
        ],
      });

      const raw = extractContent(result.choices[0]?.message?.content) || "{}";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return {
          topPriority: parsed.topPriority || input.missingIntegrations[0] || "WhatsApp Business",
          reason: parsed.reason || "Essential for customer communication",
          recommendations: parsed.recommendations || [],
          setupTip: parsed.setupTip || "Start with your most-used communication channel",
        };
      } catch {
        return {
          topPriority: input.missingIntegrations[0] || "WhatsApp Business",
          reason: "Most impactful for customer engagement in Kazakhstan",
          recommendations: input.missingIntegrations.slice(0, 3).map((name, i) => ({
            name,
            priority: i === 0 ? "high" : i === 1 ? "medium" : "low",
            reason: "Improves customer reach and engagement",
            estimatedImpact: "15-25% increase in campaign response rate",
          })),
          setupTip: "Connect WhatsApp Business first for immediate impact",
        };
      }
    }),
});
function extractContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: { type?: string; text?: string }) => (c.type === "text" ? c.text || "" : ""))
      .join("");
  }
  return "";
}
