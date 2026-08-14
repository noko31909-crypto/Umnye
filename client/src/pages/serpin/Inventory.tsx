import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Package, Plus, Edit2, Trash2, Zap,
  AlertTriangle, CheckCircle, XCircle, MinusCircle
} from "lucide-react";
import { toast } from "sonner";

const BUSINESS_ID = 1;

const statusConfig = {
  in_stock: { label: "В наличии", color: "bg-green-100 text-green-700", icon: CheckCircle },
  low_stock: { label: "Мало", color: "bg-orange-100 text-orange-700", icon: MinusCircle },
  critical: { label: "Критично", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  out_of_stock: { label: "Нет", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

export default function SerpinInventory() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", unit: "шт", minStock: "10", avgSalesPerDay: "0",
    costPrice: "0", sellingPrice: "0",
  });

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.serpin.products.list.useQuery({ businessId: BUSINESS_ID });

  const createProductMutation = trpc.serpin.products.create.useMutation({
    onSuccess: () => {
      utils.serpin.products.list.invalidate({ businessId: BUSINESS_ID });
      setShowAddDialog(false);
      setNewProduct({ name: "", category: "", unit: "шт", minStock: "10", avgSalesPerDay: "0", costPrice: "0", sellingPrice: "0" });
      toast.success("Товар добавлен");
    },
    onError: () => toast.error("Ошибка при добавлении"),
  });

  const deleteProductMutation = trpc.serpin.products.delete.useMutation({
    onSuccess: () => {
      utils.serpin.products.list.invalidate({ businessId: BUSINESS_ID });
      toast.success("Товар удалён");
    },
  });

  const updateStockMutation = trpc.serpin.products.updateStock.useMutation({
    onSuccess: () => {
      utils.serpin.products.list.invalidate({ businessId: BUSINESS_ID });
    },
  });

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const adjustStock = (productId: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateStockMutation.mutate({ id: productId, newStock });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Инвентарь</h1>
          <p className="text-gray-500 mt-1">Управление запасами товаров</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый товар</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Например: Молоко 3.2%"
                />
              </div>
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Например: Молочные продукты"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Единица</Label>
                  <Input
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="шт, кг, л"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Мин. остаток</Label>
                  <Input
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Себестоимость (₸)</Label>
                  <Input
                    type="number"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Цена продажи (₸)</Label>
                  <Input
                    type="number"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => createProductMutation.mutate({
                  businessId: BUSINESS_ID,
                  ...newProduct,
                  maxStock: String(Number(newProduct.minStock) * 5),
                })}
                disabled={!newProduct.name || createProductMutation.isPending}
              >
                {createProductMutation.isPending ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Input
        placeholder="Поиск по названию или категории..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-gray-400 text-center py-8">Загрузка...</p>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Товары не найдены</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Продаж/день</TableHead>
                  <TableHead>Дней осталось</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const stock = Number(product.currentStock);
                  const minStock = Number(product.minStock);
                  const avgSales = Number(product.avgSalesPerDay);
                  const daysRemaining = avgSales > 0 ? Math.floor(stock / avgSales) : 999;
                  const fillPercent = minStock > 0 ? Math.min(100, (stock / (minStock * 3)) * 100) : 0;
                  const config = statusConfig[product.status as keyof typeof statusConfig] || statusConfig.in_stock;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline" size="icon" className="h-6 w-6"
                            onClick={() => adjustStock(product.id, stock, -1)}
                          >
                            <MinusCircle className="w-3 h-3" />
                          </Button>
                          <span className="font-mono text-sm w-12 text-center">
                            {stock} {product.unit}
                          </span>
                          <Button
                            variant="outline" size="icon" className="h-6 w-6"
                            onClick={() => adjustStock(product.id, stock, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress value={fillPercent} className="h-2" />
                      </TableCell>
                      <TableCell>{avgSales} {product.unit}/день</TableCell>
                      <TableCell>
                        <span className={daysRemaining <= 2 ? "text-red-600 font-bold" : daysRemaining <= 5 ? "text-orange-600" : "text-gray-600"}>
                          {daysRemaining >= 999 ? "∞" : `${daysRemaining} дн.`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => deleteProductMutation.mutate({ id: product.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
