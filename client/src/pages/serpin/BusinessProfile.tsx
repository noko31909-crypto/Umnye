import { useState, useEffect } from "react";
import { useInventory } from "@/lib/inventory-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Package, Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function SerpinBusinessProfile() {
  const userId = 1; // Demo user ID

  const inv = useInventory();
  const profile = inv.profile.get(userId);
  const isLoading = false;

  const [formData, setFormData] = useState({
    businessType: "coffee_shop",
    locationsCount: 1,
    productCategories: "",
    autoOrderThreshold: "1.5",
    preferredDeliveryDays: 3,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        businessType: profile.businessType || "coffee_shop",
        locationsCount: profile.locationsCount || 1,
        productCategories: profile.productCategories || "",
        autoOrderThreshold: profile.autoOrderThreshold || "1.5",
        preferredDeliveryDays: profile.preferredDeliveryDays || 3,
      });
    }
  }, [profile]);

  const saveMutation = {
    isPending: false,
    mutate: (data: any) => {
      inv.profile.upsert(data);
      toast.success("Профиль сохранён");
    },
  };

  const businessTypes = [
    { value: "coffee_shop", label: "Кофейня" },
    { value: "store", label: "Магазин" },
    { value: "pharmacy", label: "Аптека" },
    { value: "bakery", label: "Пекарня" },
    { value: "restaurant", label: "Ресторан" },
    { value: "other", label: "Другое" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Профиль бизнеса</h1>
        <p className="text-muted-foreground mt-1">Настройки вашего бизнеса для AI рекомендаций</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Информация о бизнесе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тип бизнеса</Label>
              <Select
                value={formData.businessType}
                onValueChange={(v) => setFormData({ ...formData, businessType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Количество точек
              </Label>
              <Input
                type="number"
                value={formData.locationsCount}
                onChange={(e) => setFormData({ ...formData, locationsCount: Number(e.target.value) })}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Категории товаров
              </Label>
              <Input
                value={formData.productCategories}
                onChange={(e) => setFormData({ ...formData, productCategories: e.target.value })}
                placeholder="Например: кофе, молоко, выпечка (через запятую)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto Order Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки авто-заказа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Порог авто-заказа (× мин. остатка)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.autoOrderThreshold}
                onChange={(e) => setFormData({ ...formData, autoOrderThreshold: e.target.value })}
                placeholder="1.5"
              />
              <p className="text-xs text-muted-foreground">
                AI закажет когда остаток ≤ мин. остаток × {formData.autoOrderThreshold}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Предпочтительные дни доставки</Label>
              <Input
                type="number"
                value={formData.preferredDeliveryDays}
                onChange={(e) => setFormData({ ...formData, preferredDeliveryDays: Number(e.target.value) })}
                min={1}
                max={14}
              />
              <p className="text-xs text-muted-foreground">
                AI будет выбирать поставщиков с доставкой ≤ {formData.preferredDeliveryDays} дн.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate({ userId, ...formData, businessType: formData.businessType as "coffee_shop" | "store" | "pharmacy" | "bakery" | "restaurant" | "other" })}
          disabled={saveMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saveMutation.isPending ? "Сохранение..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
