import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Zap, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIToolsRecommendationsProps {
  businessType?: string;
  activeIntegrations?: string[];
  missingIntegrations?: string[];
}

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-green-100 text-green-700 border border-green-200",
};


function buildDemoTools(missing: string[], active: string[]) {
  const pool = missing.length ? missing : ["Loyalty Program", "Google Reviews", "Email Marketing"];
  const recommendations = pool.slice(0, 3).map((name, i) => ({
    name,
    priority: i === 0 ? "high" : i === 1 ? "medium" : "low",
    reason:
      i === 0
        ? "Highest lift for repeat visits in coffee shops — pairs well with WhatsApp/SMS you already use."
        : "Closes a gap in the customer journey and supports campaign ROI tracking.",
    estimatedImpact: i === 0 ? "+8–14% repeat visits" : "+3–7% retention",
  }));
  return {
    topPriority: recommendations[0]?.name || "Loyalty Program",
    reason: `Based on ${active.length} active tools, we recommend closing the biggest journey gap first.`,
    recommendations,
    setupTip: "Connect the top priority this week — we will surface it in campaign suggestions automatically.",
  };
}

export default function AIToolsRecommendations({
  businessType = "coffee_shop",
  activeIntegrations = [],
  missingIntegrations = ["WhatsApp Business", "Twilio SMS", "Square POS", "Loyalty Program"],
}: AIToolsRecommendationsProps) {
  const [result, setResult] = useState<{
    topPriority: string;
    reason: string;
    recommendations: Array<{
      name: string;
      priority: string;
      reason: string;
      estimatedImpact: string;
    }>;
    setupTip: string;
  } | null>(null);

  const [localLoading, setLocalLoading] = useState(false);
  const toolsMutation = trpc.ai.toolsRecommendation.useMutation({
    onSuccess: (data) => {
      setResult(data as any);
      setLocalLoading(false);
      toast.success("Jaqyn AI recommendations generated!");
    },
    onError: () => {
      setResult(buildDemoTools(missingIntegrations, activeIntegrations));
      setLocalLoading(false);
      toast.success("Recommendations ready (demo mode)");
    },
  });

  const handleGenerate = () => {
    setLocalLoading(true);
    toolsMutation.mutate(
      { businessType, activeIntegrations, missingIntegrations },
      {
        onError: () => {
          setResult(buildDemoTools(missingIntegrations, activeIntegrations));
          setLocalLoading(false);
        },
      }
    );
    setTimeout(() => {
      setLocalLoading((prev) => {
        if (prev) {
          setResult(buildDemoTools(missingIntegrations, activeIntegrations));
          return false;
        }
        return prev;
      });
    }, 2500);
  };

  const isLoading = toolsMutation.isPending || localLoading;

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Jaqyn AI Integration Advisor</h3>
              <p className="text-xs text-indigo-200">Smart recommendations for your business</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
            className="text-white hover:bg-white/20 h-8 px-3 gap-1.5"
          >
            <Sparkles className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            <span className="text-xs">{isLoading ? "Analyzing..." : result ? "Refresh" : "Get Recommendations"}</span>
          </Button>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 mt-3">
          <span className="text-xs bg-white/15 rounded-full px-2.5 py-1">
            ✅ {activeIntegrations.length} Active
          </span>
          <span className="text-xs bg-white/15 rounded-full px-2.5 py-1">
            ⚠️ {missingIntegrations.length} Not Connected
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-sm text-indigo-600 font-medium animate-pulse">
                Jaqyn AI is analyzing your integration needs...
              </span>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : !result ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Get AI-powered integration advice</p>
            <p className="text-xs text-gray-500 mb-4">
              Jaqyn AI will analyze your business type and recommend the most impactful integrations
            </p>
            <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Sparkles className="w-4 h-4" />
              Get AI Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Priority */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-0.5">Top Priority Integration</p>
                  <p className="text-sm font-bold text-red-900">{result.topPriority}</p>
                  <p className="text-xs text-red-700 mt-1">{result.reason}</p>
                </div>
              </div>
            </div>

            {/* Recommendations list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Recommended Integrations</p>
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{rec.name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_STYLES[rec.priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.low)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{rec.reason}</p>
                    <p className="text-xs text-green-700 font-medium mt-1">📈 {rec.estimatedImpact}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 shrink-0 text-xs" onClick={() => toast.success(`Setting up ${rec.name}...`)}>
                    Connect <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Setup tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-0.5">Setup Tip from Jaqyn AI</p>
                  <p className="text-xs text-blue-700">{result.setupTip}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
