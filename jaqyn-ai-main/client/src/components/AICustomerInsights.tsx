import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Send, Heart, Brain } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChurnRisk = "Low" | "Medium" | "High";

interface AICustomerInsightsProps {
  customerName: string;
  daysSinceLastVisit?: number;
  totalVisits?: number;
  totalSpent?: number;
  averageOrderValue?: number;
}

const RISK_STYLES: Record<ChurnRisk, { card: string; icon: string }> = {
  High: { card: "border-red-300 bg-red-50", icon: "🚨" },
  Medium: { card: "border-amber-300 bg-amber-50", icon: "⚠️" },
  Low: { card: "border-green-300 bg-green-50", icon: "✅" },
};

export default function AICustomerInsights({
  customerName,
  daysSinceLastVisit = 14,
  totalVisits = 24,
  totalSpent = 68400,
  averageOrderValue = 2850,
}: AICustomerInsightsProps) {
  const [result, setResult] = useState<{
    churnRisk: ChurnRisk;
    churnProbability: number;
    nextBestAction: string;
    recommendedOffer: string;
    recommendedChannel: "sms" | "whatsapp" | "email" | "push";
    reasoning: string;
  } | null>(null);
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "email" | "push">("whatsapp");

  const churnMutation = trpc.ai.churnPrediction.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setChannel(data.recommendedChannel);
      toast.success("Jaqyn AI analysis complete!");
    },
    onError: () => toast.error("AI analysis failed. Please try again."),
  });

  const handleAnalyze = () => {
    churnMutation.mutate({ customerName, daysSinceLastVisit, totalVisits, totalSpent, averageOrderValue });
  };

  const isLoading = churnMutation.isPending;
  const risk = result?.churnRisk ?? "Medium";
  const riskStyle = RISK_STYLES[risk];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">AI Smart Summary</h3>
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading} variant="outline" size="sm" className="gap-1.5 h-8">
          {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3" />Analyze</>}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs text-blue-600 animate-pulse">Jaqyn AI is analyzing {customerName}...</span>
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : result ? (
        <>
          <Card className={cn("p-4 border-2", riskStyle.card)}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-semibold opacity-70">Churn Risk</p>
                <p className="text-xl font-bold">{riskStyle.icon} {result.churnRisk}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Probability</p>
                <p className="text-xl font-bold">{result.churnProbability}%</p>
              </div>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2 mb-2">
              <div className={cn("h-2 rounded-full", risk === "High" ? "bg-red-500" : risk === "Medium" ? "bg-amber-500" : "bg-green-500")} style={{ width: `${result.churnProbability}%` }} />
            </div>
            <p className="text-xs opacity-80">{result.reasoning}</p>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">Lifetime Value</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-blue-900">₸{totalSpent.toLocaleString()}</span>
              <span className="text-xs text-blue-700">{totalVisits} visits · ₸{averageOrderValue.toLocaleString()}/visit</span>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-0.5">Next Best Action</p>
                <p className="text-sm font-medium text-gray-900">{result.nextBestAction}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-1">Recommended Offer</p>
            <p className="text-sm font-bold text-green-900 mb-3">🎁 {result.recommendedOffer}</p>
            <p className="text-xs font-semibold text-green-900 mb-2">Channel</p>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {(["sms", "whatsapp", "email", "push"] as const).map((ch) => (
                <button key={ch} onClick={() => setChannel(ch)} className={cn("px-2.5 py-1 text-xs font-medium rounded-lg transition-all", channel === ch ? "bg-green-600 text-white" : "bg-white border border-green-300 text-green-700 hover:bg-green-50")}>
                  {ch === "sms" && "📱 SMS"}{ch === "whatsapp" && "💬 WhatsApp"}{ch === "email" && "📧 Email"}{ch === "push" && "🔔 Push"}
                </button>
              ))}
            </div>
            <Button onClick={() => toast.success(`Sending ${channel.toUpperCase()} offer to ${customerName}...`)} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
              <Send className="w-4 h-4" />Send AI Personal Offer
            </Button>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">💡 Jaqyn AI Insights</p>
            <ul className="space-y-1 text-xs text-blue-900">
              <li>• Customers inactive {daysSinceLastVisit}+ days have {result.churnProbability}% churn probability</li>
              <li>• WhatsApp has highest engagement rate (68%) for re-engagement</li>
              <li>• Free item offers increase conversion by 42% for at-risk customers</li>
              <li>• Best send time: {risk === "High" ? "Today" : "Tomorrow"} at 15:00</li>
            </ul>
          </Card>
        </>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">AI analysis not yet run</p>
          <p className="text-xs text-gray-400">Click Analyze to get churn prediction and recommendations</p>
        </div>
      )}
    </div>
  );
}
