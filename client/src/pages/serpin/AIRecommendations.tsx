import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Brain, AlertTriangle, TrendingUp, ShoppingBag,
  Zap, Lightbulb, Target, Coins
} from "lucide-react";
import { useLocation } from "wouter";

const BUSINESS_ID = 1;

const typeIcons = {
  urgent: <AlertTriangle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  info: <Lightbulb className="w-5 h-5 text-blue-500" />,
  opportunity: <TrendingUp className="w-5 h-5 text-green-500" />,
};

const typeColors = {
  urgent: "border-red-200 bg-red-50",
  warning: "border-orange-200 bg-orange-50",
  info: "border-blue-200 bg-blue-50",
  opportunity: "border-green-200 bg-green-50",
};

export default function SerpinAIRecommendations() {
  const [, navigate] = useLocation();

  const { data: recommendations, isLoading } = trpc.serpin.dashboard.recommendations.useQuery({
    businessId: BUSINESS_ID,
  });

  const { data: metrics } = trpc.serpin.dashboard.metrics.useQuery({ businessId: BUSINESS_ID });

  // Group by type
  const urgentRecs = recommendations?.filter(r => r.type === "urgent") || [];
  const warningRecs = recommendations?.filter(r => r.type === "warning") || [];
  const infoRecs = recommendations?.filter(r => r.type === "info") || [];
  const opportunityRecs = recommendations?.filter(r => r.type === "opportunity") || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Рекомендации</h1>
        <p className="text-gray-500 mt-1">Интеллектуальные советы по управлению запасами</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{urgentRecs.length}</p>
            <p className="text-sm text-gray-500">Срочные</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{warningRecs.length}</p>
            <p className="text-sm text-gray-500">Предупреждения</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Lightbulb className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{infoRecs.length}</p>
            <p className="text-sm text-gray-500">Советы</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{opportunityRecs.length}</p>
            <p className="text-sm text-gray-500">Возможности</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-400">
              <Brain className="w-8 h-8 mx-auto mb-4 animate-pulse" />
              <p>AI анализирует ваши данные...</p>
            </CardContent>
          </Card>
        ) : recommendations?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Brain className="w-8 h-8 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold text-lg">Всё в порядке!</h3>
              <p className="text-gray-500 mt-2">AI не нашёл критических рекомендаций. Запасы на оптимальном уровне.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Urgent */}
            {urgentRecs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Срочные ({urgentRecs.length})
                </h2>
                {urgentRecs.map((rec, i) => (
                  <Alert key={`urgent-${i}`} className={`${typeColors[rec.type as keyof typeof typeColors] || typeColors.urgent} mb-3`}>
                    {typeIcons[rec.type as keyof typeof typeIcons]}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold">{rec.productName}</AlertTitle>
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                    {rec.action === "create_order" && (
                      <Button size="sm" onClick={() => navigate("/serpin/auto-order")}>
                        <Zap className="w-3 h-3 mr-1" /> Заказать
                      </Button>
                    )}
                  </Alert>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warningRecs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Предупреждения ({warningRecs.length})
                </h2>
                {warningRecs.map((rec, i) => (
                  <Alert key={`warning-${i}`} className={`${typeColors[rec.type as keyof typeof typeColors] || typeColors.warning} mb-3`}>
                    {typeIcons[rec.type as keyof typeof typeIcons]}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold">{rec.productName}</AlertTitle>
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                    {rec.action === "create_order" && (
                      <Button size="sm" variant="outline" onClick={() => navigate("/serpin/auto-order")}>
                        <Zap className="w-3 h-3 mr-1" /> Заказать
                      </Button>
                    )}
                  </Alert>
                ))}
              </div>
            )}

            {/* Info */}
            {infoRecs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  Советы ({infoRecs.length})
                </h2>
                {infoRecs.map((rec, i) => (
                  <Alert key={`info-${i}`} className={`${typeColors[rec.type as keyof typeof typeColors] || typeColors.info} mb-3`}>
                    {typeIcons[rec.type as keyof typeof typeIcons]}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold">{rec.productName}</AlertTitle>
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {/* Opportunities */}
            {opportunityRecs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Возможности ({opportunityRecs.length})
                </h2>
                {opportunityRecs.map((rec, i) => (
                  <Alert key={`opp-${i}`} className={`${typeColors[rec.type as keyof typeof typeColors] || typeColors.opportunity} mb-3`}>
                    {typeIcons[rec.type as keyof typeof typeIcons]}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold">{rec.productName}</AlertTitle>
                      <AlertDescription>{rec.message}</AlertDescription>
                    </div>
                    {rec.action === "create_order" && (
                      <Button size="sm" variant="outline" onClick={() => navigate("/serpin/auto-order")}>
                        <Zap className="w-3 h-3 mr-1" /> Заказать
                      </Button>
                    )}
                  </Alert>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
