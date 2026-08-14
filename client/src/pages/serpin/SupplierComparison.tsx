import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Truck, Clock, Star, Coins, CheckCircle, Award } from "lucide-react";

const BUSINESS_ID = 1;

type ComparisonData = {
  suppliers: Array<{ id: number; name: string; avgDeliveryDays: string; reliabilityScore: string; totalOrders: number; lateDeliveryCount: number; isActive: boolean }>;
  supplierProducts: Array<{ id: number; supplierId: number; productId: number; price: string; minOrderQty: string; inStock: boolean }>;
};

export default function SerpinSupplierComparison() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: products } = trpc.serpin.products.list.useQuery({ businessId: BUSINESS_ID });
  const { data: rawComparisonData, isLoading } = trpc.serpin.suppliers.forProduct.useQuery(
    { productId: selectedProductId ?? 0 },
    { enabled: selectedProductId !== null }
  );

  const comparisonData = rawComparisonData as ComparisonData | undefined;
  const hasComparisonData = !!comparisonData && comparisonData.suppliers && comparisonData.suppliers.length > 0;

  const bestSupplier = (() => {
    if (!hasComparisonData) return null;

    // AI scoring: reliability * 0.4 + price competitiveness * 0.3 + delivery speed * 0.3
    const scored = comparisonData!.suppliers.map((supplier) => {
      const sp = comparisonData!.supplierProducts.find(s => s.supplierId === supplier.id);
      if (!sp) return null;

      const reliability = Number(supplier.reliabilityScore);
      const deliveryScore = Math.max(0, 100 - Number(supplier.avgDeliveryDays) * 10);
      const otherPrices = comparisonData!.supplierProducts
        .filter(s => s.supplierId !== supplier.id)
        .map(s => Number(s.price));
      const minPrice = otherPrices.length > 0 ? Math.min(...otherPrices) : Number(sp.price);
      const priceScore = minPrice > 0 ? Math.min(100, (minPrice / Number(sp.price)) * 100) : 100;

      const score = reliability * 0.4 + priceScore * 0.3 + deliveryScore * 0.3;
      return { supplier, price: Number(sp.price), score: Math.round(score * 10) / 10 };
    }).filter(Boolean) as { supplier: typeof comparisonData.suppliers[0]; price: number; score: number }[];

    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  })();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Сравнение поставщиков</h1>
        <p className="text-muted-foreground mt-1">AI анализирует и выбирает лучшего поставщика</p>
      </div>

      {/* Product Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Выберите товар:</label>
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
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      {bestSupplier && (
        <Alert className="border-green-200 bg-green-50">
          <Brain className="w-5 h-5 text-green-600" />
          <div>
            <AlertTitle className="font-bold text-green-800">
              AI рекомендует: {bestSupplier.supplier.name}
            </AlertTitle>
            <AlertDescription>
              Оценка AI: {bestSupplier.score}/100 | Цена: {bestSupplier.price} ₸ |
              Надёжность: {bestSupplier.supplier.reliabilityScore}% | Доставка: {bestSupplier.supplier.avgDeliveryDays} дня
              <br />
              <span className="text-xs text-green-600 mt-1 block">
                AI учитывает: надёжность поставщика (40%), конкурентоспособность цены (30%), скорость доставки (30%)
              </span>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Comparison Table */}
      {selectedProductId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Сравнение по товару: {products?.find(p => p.id === selectedProductId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Анализ AI...</p>
            ) : !comparisonData?.suppliers?.length ? (
              <p className="text-muted-foreground text-center py-8">Нет поставщиков для этого товара</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Поставщик</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Ср. доставка</TableHead>
                    <TableHead>Надёжность</TableHead>
                    <TableHead>Оценка AI</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData?.suppliers?.map((supplier) => {
                    const sp = comparisonData.supplierProducts?.find(s => s.supplierId === supplier.id);
                    const isBest = bestSupplier?.supplier.id === supplier.id;
                    const price = sp ? Number(sp.price) : 0;

                    return (
                      <TableRow key={supplier.id} className={isBest ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isBest && <Award className="w-4 h-4 text-green-600" />}
                            {supplier.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{price.toLocaleString()} ₸</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" /> {supplier.avgDeliveryDays} дн.
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 text-yellow-500" /> {supplier.reliabilityScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isBest ? "default" : "secondary"} className={isBest ? "bg-green-100 text-green-700" : ""}>
                            {isBest ? "Лучший" : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isBest && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Заказать
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
