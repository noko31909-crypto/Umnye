import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, Package, Brain, Calendar } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const BUSINESS_ID = 1;

export default function SerpinDemandForecast() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(1); // default to Молоко
  const [forecastDays, setForecastDays] = useState(14);

  const { data: products } = trpc.serpin.products.list.useQuery({ businessId: BUSINESS_ID });

  const { data: forecastData, isLoading } = trpc.serpin.forecast.demand.useQuery(
    {
      businessId: BUSINESS_ID,
      productId: selectedProductId ?? 0,
      forecastDays,
    },
    { enabled: selectedProductId !== null }
  );

  const chartData = (() => {
    if (!forecastData) return [];

    const historical = (forecastData.history || []).map((h: any) => ({
      date: new Date(h.date).toLocaleDateString("ru-KZ", { day: "numeric", month: "short" }),
      actual: Number(h.quantity),
      forecast: null as number | null,
    }));

    const forecast = (forecastData.forecast || []).slice(0, forecastDays).map((f: any) => ({
      date: new Date(f.date).toLocaleDateString("ru-KZ", { day: "numeric", month: "short" }),
      actual: null as number | null,
      forecast: Math.round(Number(f.predicted)),
    }));

    return [...historical, ...forecast];
  })();

  const totalPredicted = (forecastData?.forecast || [])
    .slice(0, forecastDays)
    .reduce((sum: number, f: any) => sum + Number(f.predicted), 0);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Прогноз спроса</h1>
        <p className="text-muted-foreground mt-1">AI предсказывает будущие продажи на основе истории</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={selectedProductId?.toString() ?? ""}
          onValueChange={(v) => setSelectedProductId(Number(v))}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Выберите товар..." />
          </SelectTrigger>
          <SelectContent>
            {products?.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={forecastDays.toString()}
          onValueChange={(v) => setForecastDays(Number(v))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 дней</SelectItem>
            <SelectItem value="14">14 дней</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {selectedProduct && forecastData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Средние продажи/день</span>
              </div>
              <p className="text-2xl font-bold mt-1">{forecastData.avgDaily?.toFixed?.(1) ?? forecastData.avgDaily}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Тренд</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${(forecastData.trend ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {(forecastData.trend ?? 0) > 0 ? "+" : ""}{forecastData.trend}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Дней осталось</span>
              </div>
              <p className="text-2xl font-bold mt-1">{forecastData.daysRemaining ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Реком. запас (min)</span>
              </div>
              <p className="text-2xl font-bold mt-1">{forecastData.recommendedMinStock ?? "—"}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Advice */}
      {forecastData?.aiAdvice && (
        <Alert className="border-blue-200 bg-blue-50">
          <Brain className="w-5 h-5 text-blue-600" />
          <AlertTitle className="text-blue-900">AI-рекомендация</AlertTitle>
          <AlertDescription className="text-blue-800">{forecastData.aiAdvice}</AlertDescription>
        </Alert>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Продажи (30 дней) + прогноз ({forecastDays} дней)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-12 text-center">Загрузка...</p>
          ) : chartData.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">Выберите товар</p>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Факт" stroke="#3b82f6" fill="#93c5fd" strokeWidth={2} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" name="Прогноз" stroke="#8b5cf6" fill="#c4b5fd" strokeWidth={2} strokeDasharray="5 5" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {totalPredicted > 0 && (
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Прогнозируемый спрос на {forecastDays} дн.: <strong>{Math.round(totalPredicted)}</strong> {selectedProduct?.unit}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
