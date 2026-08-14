import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Package } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const BUSINESS_ID = 1;

export default function SerpinDemandForecast() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
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

    const historical = (forecastData.historical || []).map((h: any) => ({
      date: new Date(h.saleDate).toLocaleDateString("ru-KZ", { day: "numeric", month: "short" }),
      actual: Number(h.quantity),
      forecast: null as number | null,
    }));

    const forecast = (forecastData.forecast || []).map((f: any, i: number) => ({
      date: f.date,
      actual: null,
      forecast: Math.round(Number(f.predictedQty)),
    }));

    return [...historical, ...forecast];
  })();

  const totalPredicted = forecastData?.forecast?.reduce(
    (sum: number, f: any) => sum + Number(f.predictedQty), 0
  ) ?? 0;

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Прогноз спроса</h1>
        <p className="text-gray-500 mt-1">AI предсказывает будущие продажи на основе истории</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
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
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-500">Средние продажи/день</span>
              </div>
              <p className="text-2xl font-bold mt-1">{forecastData.avgDailySales?.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">Прогноз на {forecastDays} дн.</span>
              </div>
              <p className="text-2xl font-bold mt-1">{Math.round(totalPredicted)} {selectedProduct.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-500">Рекомендуемый заказ</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                {Math.max(Math.round(totalPredicted) - Number(selectedProduct.currentStock), 0)} {selectedProduct.unit}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProduct ? `Продажи: ${selectedProduct.name}` : "Выберите товар для просмотра графика"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedProductId ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Выберите товар выше для просмотра прогноза</p>
            </div>
          ) : isLoading ? (
            <p className="text-gray-400 text-center py-8">AI анализирует данные...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value, name) => {
                    const numVal = typeof value === "number" ? value : null;
                    return [
                      numVal !== null ? `${numVal} ${selectedProduct?.unit ?? ""}` : "—",
                      name === "actual" ? "Факт" : "Прогноз AI",
                    ];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      {selectedProductId && !isLoading && (
        <div className="flex gap-6 justify-center text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Фактические продажи (30 дней)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            Прогноз AI ({forecastDays} дней)
          </span>
        </div>
      )}
    </div>
  );
}
