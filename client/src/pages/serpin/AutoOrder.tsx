import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Package, Truck, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_ID = 1;

type OrderStep = "select" | "review" | "confirming" | "done";

export default function SerpinAutoOrder() {
  const [step, setStep] = useState<OrderStep>("select");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: products, isLoading: productsLoading } = trpc.serpin.products.list.useQuery({
    businessId: BUSINESS_ID,
  });
  const { data: suppliers, isLoading: suppliersLoading } = trpc.serpin.suppliers.list.useQuery({
    businessId: BUSINESS_ID,
  });

  const createOrderMutation = trpc.serpin.orders.create.useMutation({
    onSuccess: (data) => {
      setCreatedOrderId(data.orderId);
      setStep("done");
      utils.serpin.orders.list.invalidate({ businessId: BUSINESS_ID });
      utils.serpin.products.list.invalidate({ businessId: BUSINESS_ID });
      toast.success("Заказ отправлен!");
    },
    onError: () => toast.error("Ошибка при создании заказа"),
  });

  // Filter products that need ordering (low stock or critical)
  const needsOrder = products?.filter(p =>
    p.autoOrderEnabled &&
    (Number(p.currentStock) <= Number(p.minStock))
  ) || [];

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateTotal = () => {
    let total = 0;
    selectedProducts.forEach(pid => {
      const product = products?.find(p => p.id === pid);
      if (product) {
        const qty = Math.max(
          Number(product.minStock) * 2 - Number(product.currentStock),
          Number(product.minStock)
        );
        total += qty * Number(product.costPrice);
      }
    });
    return total;
  };

  const handleCreateOrder = () => {
    if (selectedProducts.length === 0) {
      toast.error("Выберите хотя бы один товар");
      return;
    }
    setStep("confirming");

    // Use first supplier as default (in production, AI would pick best supplier)
    const supplierId = suppliers?.[0]?.id ?? 1;
    const items = selectedProducts.map(pid => {
      const product = products?.find(p => p.id === pid)!;
      const qty = Math.max(
        Number(product.minStock) * 2 - Number(product.currentStock),
        Number(product.minStock)
      );
      return {
        productId: pid,
        quantity: String(qty),
        price: String(Number(product.costPrice)),
      };
    });

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    createOrderMutation.mutate({
      businessId: BUSINESS_ID,
      supplierId,
      totalAmount: String(calculateTotal()),
      expectedDeliveryDate: deliveryDate,
      notes: "Авто-заказ (AI рекомендация)",
      isAutoOrder: true,
      items,
    });
  };

  if (step === "done") {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Заказ отправлен поставщику!</h2>
            <p className="text-lg font-semibold text-blue-700 mb-1">Заказ #{createdOrderId}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Статус: <span className="font-medium text-green-600">Подтверждён</span> → Собирается → В пути → Доставлен
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="outline" onClick={() => { setStep("select"); setSelectedProducts([]); setCreatedOrderId(null); }}>
                Новый заказ
              </Button>
              <Button onClick={() => window.location.href = "/serpin/orders"}>
                Смотреть в заказах
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Авто-заказ</h1>
        <p className="text-muted-foreground mt-1">AI определил товары, которые нужно заказать</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 text-sm">
        <div className={`flex items-center gap-2 ${step === "select" ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
          <Zap className="w-4 h-4" /> 1. Выберите товары
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 ${step === "review" ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
          <Package className="w-4 h-4" /> 2. Подтвердите
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300" />
        <div className={`flex items-center gap-2 ${step === "confirming" ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
          <Truck className="w-4 h-4" /> 3. Отправлено
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Рекомендуемые к заказу ({needsOrder.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading || suppliersLoading ? (
            <p className="text-muted-foreground text-center py-8">Загрузка...</p>
          ) : needsOrder.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>Все товары в достаточном количестве. AI не нашёл необходимости в заказе.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Текущий остаток</TableHead>
                  <TableHead>Мин. остаток</TableHead>
                  <TableHead>Рекомендуемый заказ</TableHead>
                  <TableHead>Стоимость</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsOrder.map((product) => {
                  const qty = Math.max(
                    Number(product.minStock) * 2 - Number(product.currentStock),
                    Number(product.minStock)
                  );
                  return (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleProduct(product.id)}>
                      <TableCell>
                        <Checkbox checked={selectedProducts.includes(product.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <span className={Number(product.currentStock) <= 0 ? "text-red-600 font-bold" : "text-orange-600"}>
                          {product.currentStock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{product.minStock} {product.unit}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{qty} {product.unit}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{(qty * Number(product.costPrice)).toLocaleString()} ₸</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Action bar */}
          {needsOrder.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Выбрано: {selectedProducts.length} товаров</p>
                <p className="text-lg font-bold">Итого: {calculateTotal().toLocaleString()} ₸</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProducts(needsOrder.map(p => p.id))}
                >
                  Выбрать все
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={selectedProducts.length === 0 || createOrderMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Отправить заказ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
