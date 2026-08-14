import { useState } from "react";
import { useInventory } from "@/lib/inventory-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Package, Truck, Settings, Users, Plus, Trash2,
  Bot, Database, Activity
} from "lucide-react";
import { toast } from "sonner";

const BUSINESS_ID = 1;

export default function SerpinAdminPanel() {
  const inv = useInventory();
  const products = inv.products.list(BUSINESS_ID);
  const deleteProductMutation = {
    mutate: ({ id }: { id: number }) => {
      inv.products.delete(id);
      toast.success("Товар удалён");
    },
  };
  const suppliers = inv.suppliers.list(BUSINESS_ID);
  const orders = inv.orders.list(BUSINESS_ID);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-muted-foreground mt-1">Управление продуктами, поставщиками и настройками</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          <Bot className="w-3 h-3 mr-1" />
          AI Active
        </Badge>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-1">
            <Package className="w-4 h-4" /> Товары
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-1">
            <Truck className="w-4 h-4" /> Поставщики
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-1">
            <Settings className="w-4 h-4" /> Правила авто-заказа
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <Activity className="w-4 h-4" /> Статистика
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Все товары ({products?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead>Авто-заказ</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.currentStock} {p.unit}</TableCell>
                      <TableCell>
                        <Badge variant={p.autoOrderEnabled ? "default" : "secondary"} className={p.autoOrderEnabled ? "bg-green-100 text-green-700" : ""}>
                          {p.autoOrderEnabled ? "Вкл" : "Выкл"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => deleteProductMutation.mutate({ id: p.id })}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Все поставщики ({suppliers?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Доставка (дн.)</TableHead>
                    <TableHead>Надёжность</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers?.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell>{s.avgDeliveryDays}</TableCell>
                      <TableCell>{s.reliabilityScore}%</TableCell>
                      <TableCell>
                        <Badge className={s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {s.isActive ? "Активен" : "Неактивен"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Правила авто-заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Порог срабатывания авто-заказа</Label>
                  <Input type="number" step="0.1" defaultValue="1.5" />
                  <p className="text-xs text-muted-foreground">Заказ создаётся когда остаток ≤ мин. остаток × порог</p>
                </div>
                <div className="space-y-2">
                  <Label>Множитель количества заказа</Label>
                  <Input type="number" step="0.1" defaultValue="2" />
                  <p className="text-xs text-muted-foreground">Заказываемое количество = мин. остаток × множитель</p>
                </div>
                <div className="space-y-2">
                  <Label>Макс. дней до критичного остатка</Label>
                  <Input type="number" defaultValue="3" />
                  <p className="text-xs text-muted-foreground">AI предупреждает за N дней до исчерпания</p>
                </div>
                <div className="space-y-2">
                  <Label>Предпочтительный приоритет при выборе поставщика</Label>
                  <Input defaultValue="price" placeholder="price, reliability, delivery" />
                  <p className="text-xs text-muted-foreground">price = цена, reliability = надёжность, delivery = скорость</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Сохранить правила
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Database className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold">{products?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Товаров</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold">{suppliers?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Поставщиков</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-bold">{orders?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Заказов</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
