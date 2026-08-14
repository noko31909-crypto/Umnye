import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Plus, Phone, Mail, Clock, Star, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_ID = 1;

export default function SerpinSuppliers() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "", category: "", contactPerson: "", phone: "", email: "",
    avgDeliveryDays: "3", reliabilityScore: "90",
  });

  const utils = trpc.useUtils();
  const { data: suppliers, isLoading } = trpc.serpin.suppliers.list.useQuery({
    businessId: BUSINESS_ID,
  });

  const createSupplierMutation = trpc.serpin.suppliers.create.useMutation({
    onSuccess: () => {
      utils.serpin.suppliers.list.invalidate({ businessId: BUSINESS_ID });
      setShowAddDialog(false);
      setNewSupplier({ name: "", category: "", contactPerson: "", phone: "", email: "", avgDeliveryDays: "3", reliabilityScore: "90" });
      toast.success("Поставщик добавлен");
    },
    onError: () => toast.error("Ошибка при добавлении"),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Поставщики</h1>
          <p className="text-gray-500 mt-1">Управление поставщиками и сравнение</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Добавить поставщика
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый поставщик</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Input value={newSupplier.category} onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Контактное лицо</Label>
                  <Input value={newSupplier.contactPerson} onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Телефон</Label>
                  <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ср. дни доставки</Label>
                  <Input type="number" value={newSupplier.avgDeliveryDays} onChange={(e) => setNewSupplier({ ...newSupplier, avgDeliveryDays: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Надёжность (%)</Label>
                  <Input type="number" value={newSupplier.reliabilityScore} onChange={(e) => setNewSupplier({ ...newSupplier, reliabilityScore: e.target.value })} />
                </div>
              </div>
              <Button
                onClick={() => createSupplierMutation.mutate({ businessId: BUSINESS_ID, ...newSupplier })}
                disabled={!newSupplier.name || createSupplierMutation.isPending}
              >
                {createSupplierMutation.isPending ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-gray-400 col-span-full text-center py-8">Загрузка...</p>
        ) : suppliers?.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.category}</p>
                  </div>
                </div>
                <Badge variant={supplier.isActive ? "default" : "secondary"} className={supplier.isActive ? "bg-green-100 text-green-700" : ""}>
                  {supplier.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {supplier.isActive ? "Активен" : "Неактивен"}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {supplier.contactPerson && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {supplier.contactPerson}
                  </p>
                )}
                {supplier.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> {supplier.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{supplier.avgDeliveryDays}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> дня доставки
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{supplier.reliabilityScore}%</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3" /> надёжность
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-400">
                <span>Заказов: {supplier.totalOrders}</span>
                <span>Опозданий: {supplier.lateDeliveryCount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
