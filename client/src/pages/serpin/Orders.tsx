import { useState } from "react";
import { useInventory } from "@/lib/inventory-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShoppingCart, Truck, CheckCircle, Clock, AlertCircle,
  Package, Calendar, Bot
} from "lucide-react";
import { toast } from "sonner";

const BUSINESS_ID = 1;

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Ожидает", color: "bg-gray-100 text-gray-700", icon: Clock },
  confirmed: { label: "Подтверждён", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  collecting: { label: "Собирается", color: "bg-yellow-100 text-yellow-700", icon: Package },
  in_transit: { label: "В пути", color: "bg-blue-100 text-blue-700", icon: Truck },
  delivered: { label: "Доставлен", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

const statusFlow = ["pending", "confirmed", "collecting", "in_transit", "delivered"];

export default function SerpinOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [planB, setPlanB] = useState<any>(null);

  const inv = useInventory();
  const orders = inv.orders.list(BUSINESS_ID);
  const suppliers = inv.suppliers.list(BUSINESS_ID);
  const isLoading = false;

  const updateStatusMutation = {
    isPending: false,
    mutate: ({ id, status }: { id: number; status: string }) => {
      inv.orders.updateStatus(id, status);
      toast.success("Статус обновлён");
    },
  };

  const supplierMap = new Map(suppliers?.map(s => [s.id, s.name]) ?? []);

  const filteredOrders = orders?.filter(o =>
    statusFilter === "all" || o.status === statusFilter
  );

  const handleSimulateFailure = (orderId: number) => {
    const result = inv.planB.simulateFailure(orderId);
    if (!result) {
      toast.error("Не удалось симулировать срыв");
      return;
    }
    setPlanB(result);
    toast.error(`Срыв: ${result.failedSupplierName} задержал поставку`);
  };

  const handleSwitchSupplier = (orderId: number, supplierId: number) => {
    inv.planB.switchSupplier(orderId, supplierId);
    setPlanB(null);
    toast.success("Заказ переключён на альтернативного поставщика (план Б)");
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Заказы и доставки</h1>
          <p className="text-muted-foreground mt-1">Отслеживание статусов · демо: «Симулировать срыв» → план Б в 1 клик</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Фильтр..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все заказы</SelectItem>
            <SelectItem value="pending">Ожидает</SelectItem>
            <SelectItem value="confirmed">Подтверждён</SelectItem>
            <SelectItem value="collecting">Собирается</SelectItem>
            <SelectItem value="in_transit">В пути</SelectItem>
            <SelectItem value="delivered">Доставлен</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {planB && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Срыв поставки → план Б
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-orange-900">
              <strong>{planB.failedSupplierName}</strong> сорвал сроки по заказу #{planB.order?.id}.
              Система подобрала альтернативы по цене, сроку и надёжности.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {(planB.alternatives || []).slice(0, 4).map((alt: any) => (
                <div
                  key={alt.supplierId}
                  className={`rounded-lg border bg-white p-3 ${planB.best?.supplierId === alt.supplierId ? "border-emerald-400 ring-1 ring-emerald-200" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{alt.supplierName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alt.avgDeliveryDays} дн. · надёжность {alt.reliabilityScore}%
                      </p>
                      <p className="text-sm mt-1">
                        {Number(alt.totalAmount).toLocaleString()} ₸
                        {alt.deltaVsOriginal !== 0 && (
                          <span className={alt.deltaVsOriginal > 0 ? "text-red-600 text-xs ml-1" : "text-emerald-600 text-xs ml-1"}>
                            ({alt.deltaVsOriginal > 0 ? "+" : ""}{alt.deltaVsOriginal.toLocaleString()} ₸)
                          </span>
                        )}
                      </p>
                      {planB.best?.supplierId === alt.supplierId && (
                        <Badge className="mt-1 bg-emerald-600 text-white text-[10px]">AI рекомендует</Badge>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleSwitchSupplier(planB.order.id, alt.supplierId)}>
                      Переключить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPlanB(null)}>Скрыть</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Загрузка...</p>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Заказов не найдено</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders?.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const nextStatus = getNextStatus(order.status);
                const deliveryDate = order.expectedDeliveryDate
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString("ru-KZ", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <config.icon className="w-5 h-5" />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Заказ #{order.id}</h3>
                        {order.isAutoOrder && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Bot className="w-3 h-3 mr-1" />
                            Авто-заказ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Поставщик: {supplierMap.get(order.supplierId) ?? "—"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Доставка: {deliveryDate}
                        </span>
                        <span className="font-mono">{Number(order.totalAmount).toLocaleString()} ₸</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={config.color}>
                      <config.icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>

                    {/* Action */}
                    {nextStatus && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: nextStatus })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        {statusConfig[nextStatus]?.label}
                      </Button>
                    )}
                    {order.status !== "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-800"
                        onClick={() => handleSimulateFailure(order.id)}
                      >
                        Срыв → план Б
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
