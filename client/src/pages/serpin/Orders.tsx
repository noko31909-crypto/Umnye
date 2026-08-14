import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  in_transit: { label: "В пути", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Доставлен", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

const statusFlow = ["pending", "confirmed", "collecting", "in_transit", "delivered"];

export default function SerpinOrders() {
  const [statusFilter, setStatusFilter] = useState("all");

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.serpin.orders.list.useQuery({ businessId: BUSINESS_ID });
  const { data: suppliers } = trpc.serpin.suppliers.list.useQuery({ businessId: BUSINESS_ID });

  const updateStatusMutation = trpc.serpin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.serpin.orders.list.invalidate({ businessId: BUSINESS_ID });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении"),
  });

  const supplierMap = new Map(suppliers?.map(s => [s.id, s.name]) ?? []);

  const filteredOrders = orders?.filter(o =>
    statusFilter === "all" || o.status === statusFilter
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Заказы и доставки</h1>
          <p className="text-gray-500 mt-1">Отслеживание статусов поставок</p>
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

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-gray-400 text-center py-8">Загрузка...</p>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
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
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
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
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <Bot className="w-3 h-3 mr-1" />
                            Авто-заказ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Поставщик: {supplierMap.get(order.supplierId) ?? "—"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
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
