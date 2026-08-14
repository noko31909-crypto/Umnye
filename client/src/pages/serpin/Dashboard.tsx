import { trpc } from "@/lib/trpc";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Package, AlertTriangle, Truck, ShoppingCart,
  TrendingUp, Coins, Brain, Plus, ChevronRight,
  AlertCircle, Info, Zap, Clock
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const BUSINESS_ID = 1; // Demo business ID

export default function SerpinDashboard() {
  const [, navigate] = useLocation();
  const { user } = useSimpleAuth();

  const { data: metrics, isLoading: metricsLoading } = trpc.serpin.dashboard.metrics.useQuery({
    businessId: BUSINESS_ID,
  });

  const { data: recommendations, isLoading: recsLoading } = trpc.serpin.dashboard.recommendations.useQuery({
    businessId: BUSINESS_ID,
  });

  const utils = trpc.useUtils();
  const simulateSale = trpc.serpin.demo.simulateSale.useMutation({
    onSuccess: (data) => {
      utils.serpin.dashboard.metrics.invalidate({ businessId: BUSINESS_ID });
      utils.serpin.dashboard.recommendations.invalidate({ businessId: BUSINESS_ID });
      utils.serpin.products.list.invalidate({ businessId: BUSINESS_ID });
      const name = data?.product?.name ?? "Товар";
      toast.success(`Продажа: ${name} — остаток обновлён`);
    },
  });

  const typeIcons = {
    urgent: <AlertTriangle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const typeColors = {
    urgent: "border-red-200 bg-red-50",
    warning: "border-orange-200 bg-orange-50",
    info: "border-blue-200 bg-blue-50",
  };

  const statCards = [
    { label: "Товаров всего", value: metrics?.totalProducts ?? 0, icon: Package, color: "text-blue-600 bg-blue-100" },
    { label: "На исходе", value: metrics?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-orange-600 bg-orange-100" },
    { label: "Критический дефицит", value: metrics?.criticalCount ?? 0, icon: AlertCircle, color: "text-red-600 bg-red-100" },
    { label: "Активные заказы", value: metrics?.activeOrders ?? 0, icon: Truck, color: "text-blue-600 bg-blue-100" },
    { label: "Ср. время доставки", value: `${metrics?.avgDeliveryDays ?? "—"} дн.`, icon: Clock, color: "text-indigo-600 bg-indigo-100" },
    { label: "Сорванные поставки", value: metrics?.missedDeliveries ?? 0, icon: AlertTriangle, color: "text-rose-600 bg-rose-100" },
    { label: "Стоимость запасов", value: `${Number(metrics?.totalInventoryValue ?? 0).toLocaleString()} ₸`, icon: Coins, color: "text-green-600 bg-green-100" },
    { label: "Экономия от автозаказа", value: `${Number(metrics?.autoOrderSavings ?? 0).toLocaleString()} ₸`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted-foreground mt-1">AI-управление запасами</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => simulateSale.mutate({ productId: 1, qty: 8 })}
            disabled={simulateSale.isPending}
          >
            <Zap className="w-4 h-4 mr-1" />
            Симулировать продажу (Молоко)
          </Button>
          <Button onClick={() => navigate("/serpin/auto-order")}>
            <Plus className="w-4 h-4 mr-1" />
            Авто-заказ
          </Button>
        </div>
      </div>

      {/* Demo tip */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="w-5 h-5 text-blue-600" />
        <AlertTitle className="text-blue-900">Демо-сценарий (1–2 мин)</AlertTitle>
        <AlertDescription className="text-blue-800 text-sm">
          1) Симулируйте продажу → 2) AI покажет риск дефицита → 3) Авто-заказ → 4) Сравните поставщиков → 5) Прогноз спроса → 6) Отследите статус в Заказах
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recsLoading ? (
              <p className="text-muted-foreground">Загрузка...</p>
            ) : recommendations?.length === 0 ? (
              <p className="text-muted-foreground">Нет рекомендаций. Всё в порядке!</p>
            ) : (
              recommendations?.map((rec: any, i: number) => (
                <Alert key={i} className={typeColors[rec.type as keyof typeof typeColors] || "border-border"}>
                  {typeIcons[rec.type as keyof typeof typeIcons]}
                  <div className="flex-1">
                    <AlertTitle className="font-medium">{rec.productName}</AlertTitle>
                    <AlertDescription className="text-sm">{rec.message}</AlertDescription>
                  </div>
                  {rec.action === "create_order" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/serpin/auto-order")}
                      className="ml-auto"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Заказать
                    </Button>
                  )}
                </Alert>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/inventory")}
            >
              <Plus className="w-5 h-5 text-blue-500" />
              <span className="flex-1 text-sm">Добавить товар</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/suppliers")}
            >
              <Plus className="w-5 h-5 text-blue-500" />
              <span className="flex-1 text-sm">Добавить поставщика</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/inventory")}
            >
              <Package className="w-5 h-5 text-orange-500" />
              <span className="flex-1 text-sm">Проверить остатки</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/auto-order")}
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="flex-1 text-sm">Создать автозаказ</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/comparison")}
            >
              <Truck className="w-5 h-5 text-indigo-500" />
              <span className="flex-1 text-sm">Сравнить поставщиков</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/serpin/forecast")}
            >
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="flex-1 text-sm">Прогноз спроса</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
