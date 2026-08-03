import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIInsightsCardProps {
  businessName?: string;
  businessType?: string;
  activeCustomers?: number;
  atRiskCustomers?: number;
  vipCustomers?: number;
  weeklyRevenue?: number;
  conversionRate?: number;
  retentionRate?: number;
  peakHoursStart?: string;
  peakHoursEnd?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  onGenerateCampaign?: () => void;
}

interface Insight {
  title: string;
  description: string;
  action: string;
  urgency: "low" | "medium" | "high";
  estimatedImpact: string;
  icon: string;
}

const URGENCY_BADGE = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-green-100 text-green-700 border border-green-200",
};

function detectTriggers(atRiskCustomers: number, vipCustomers: number, quietHoursStart: string): string[] {
  const triggers: string[] = [];
  const hour = new Date().getHours();
  const quietStart = parseInt(quietHoursStart.split(":")[0]);
  if (hour >= quietStart - 1 && hour <= quietStart + 2) triggers.push("⏰ Quiet Hours Approaching");
  if (atRiskCustomers > 20) triggers.push(`⚠️ ${atRiskCustomers} At-Risk`);
  if (vipCustomers > 50) triggers.push(`⭐ ${vipCustomers} VIPs Active`);
  const day = new Date().getDay();
  if (day === 5) triggers.push("🎉 Friday Surge");
  if (day === 2 || day === 3) triggers.push("📊 Mid-Week");
  return triggers;
}

export default function AIInsightsCard({
  businessName = "Your Business",
  businessType = "coffee_shop",
  activeCustomers = 890,
  atRiskCustomers = 47,
  vipCustomers = 156,
  weeklyRevenue = 112100,
  conversionRate = 23.4,
  retentionRate = 82,
  peakHoursStart = "09:00",
  peakHoursEnd = "11:00",
  quietHoursStart = "14:00",
  quietHoursEnd = "16:00",
  onGenerateCampaign,
}: AIInsightsCardProps) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const insightMutation = trpc.ai.dashboardInsight.useMutation({
    onSuccess: (data) => { setInsight(data); setHasLoaded(true); },
    onError: () => toast.error("Failed to generate AI insight. Please try again."),
  });

  const handleRefresh = () => {
    insightMutation.mutate({ businessName, businessType, activeCustomers, atRiskCustomers, vipCustomers, weeklyRevenue, conversionRate, retentionRate, peakHoursStart, peakHoursEnd, quietHoursStart, quietHoursEnd });
  };

  const isLoading = insightMutation.isPending;
  const triggers = detectTriggers(atRiskCustomers, vipCustomers, quietHoursStart);

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Jaqyn AI Growth Copilot</h3>
              <p className="text-xs text-blue-200">Real-time business intelligence</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading} className="text-white hover:bg-white/20 h-8 px-3 gap-1.5">
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span className="text-xs">{isLoading ? "Analyzing..." : hasLoaded ? "Refresh" : "Analyze Now"}</span>
          </Button>
        </div>
        {triggers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {triggers.map((t, i) => <span key={i} className="text-xs bg-white/15 rounded-full px-2.5 py-1 font-medium">{t}</span>)}
          </div>
        )}
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm text-blue-600 font-medium animate-pulse">Jaqyn AI is analyzing your business data...</span>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
        ) : !hasLoaded ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Ready to analyze your business</p>
            <p className="text-xs text-gray-500 mb-4">Get AI-powered insights based on your customers, revenue, and timing</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Sparkles className="w-4 h-4" />Generate AI Insight
            </Button>
          </div>
        ) : insight ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{insight.icon}</span>
                <h4 className="font-semibold text-gray-900 flex-1">{insight.title}</h4>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", URGENCY_BADGE[insight.urgency])}>
                  {insight.urgency.charAt(0).toUpperCase() + insight.urgency.slice(1)} Priority
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-0.5">Suggested Action</p>
                  <p className="text-sm text-blue-900">{insight.action}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-gray-500">Estimated Impact</p>
                <p className="text-lg font-bold text-green-600">{insight.estimatedImpact}</p>
              </div>
              <Button onClick={() => { toast.success("Opening Campaign Studio..."); onGenerateCampaign?.(); }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                Generate & Review <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
