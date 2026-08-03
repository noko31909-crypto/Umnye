import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useDemoStore } from "@/store/demoStore";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Star } from "lucide-react";
import AIToolsRecommendations from "@/components/AIToolsRecommendations";

const INTEGRATION_ICONS: Record<string, string> = {
  iiko: "🍽️",
  poster: "📱",
  whatsapp: "💬",
  sms_gateway: "📞",
  loyalty: "🎁",
  analytics: "📊",
  telegram: "✈️",
  email: "📧",
};

export default function Tools() {
  const { t } = useTranslation();
  const { user } = useSimpleAuth();
  const demoStore = useDemoStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingIntegration, setEditingIntegration] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", config: "" });

  const categories = ["all", ...Array.from(new Set(demoStore.integrations.map((i) => i.category)))];
  const filteredIntegrations =
    selectedCategory === "all"
      ? demoStore.integrations
      : demoStore.integrations.filter((i) => i.category === selectedCategory);

  const activeCount = demoStore.integrations.filter((i) => i.isActive).length;

  const handleToggleIntegration = (id: number) => {
    demoStore.toggleIntegration(id);
    const integration = demoStore.integrations.find((i) => i.id === id);
    toast.success(t("success"));
  };

  const handleEditIntegration = (id: number) => {
    const integration = demoStore.integrations.find((i) => i.id === id);
    if (integration) {
      setEditingIntegration(id);
      setFormData({ name: integration.name, config: "" });
      setShowDialog(true);
    }
  };

  const handleSaveConfig = () => {
    toast.success(t("success"));
    setShowDialog(false);
    setEditingIntegration(null);
    setFormData({ name: "", config: "" });
  };

  const handleAddIntegration = () => {
    setEditingIntegration(null);
    setFormData({ name: "", config: "" });
    setShowDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("tools")}</h1>
          <p className="text-muted-foreground mt-1">{t("integrations")}</p>
        </div>

        {/* AI Recommendations */}
        <AIToolsRecommendations
          businessType={demoStore.businessType}
          activeIntegrations={demoStore.integrations.filter((i) => i.isActive).map((i) => i.name)}
          missingIntegrations={demoStore.integrations.filter((i) => !i.isActive).map((i) => i.name)}
        />

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("connected")}</p>
                <p className="text-3xl font-bold mt-2">{activeCount}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("available")}</p>
                <p className="text-3xl font-bold mt-2">{demoStore.integrations.length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("coverage")}</p>
                <p className="text-3xl font-bold mt-2">{Math.round((activeCount / demoStore.integrations.length) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("integrations")}</CardTitle>
              <CardDescription>{t("integrations")}</CardDescription>
            </div>
            <Button onClick={handleAddIntegration} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {t("add")}
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {(category === "all"
                      ? demoStore.integrations
                      : demoStore.integrations.filter((i) => i.category === category)
                    ).map((integration) => {
                      const isFavorite = demoStore.favorites.includes(integration.id);
                      return (
                        <Card key={integration.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{INTEGRATION_ICONS[integration.type] || "🔧"}</span>
                                <div>
                                  <p className="font-semibold text-sm">{integration.name}</p>
                                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => demoStore.toggleFavorite(integration.id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      isFavorite
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 hover:text-gray-400"
                                    }`}
                                  />
                                </button>
                                <Switch
                                  checked={integration.isActive}
                                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              {integration.isActive ? (
                                <Badge className="bg-green-100 text-green-700 gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Connected
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-700 gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Disconnected
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1"
                                onClick={() => handleEditIntegration(integration.id)}
                              >
                                <Edit2 className="w-3 h-3" />
                                Configure
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIntegration ? "Configure Integration" : "Add Integration"}</DialogTitle>
            <DialogDescription>
              {editingIntegration
                ? "Update the configuration for this integration"
                : "Add a new integration to your business"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                placeholder="e.g., WhatsApp Business"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="config">Configuration (JSON)</Label>
              <Textarea
                id="config"
                placeholder='{"api_key": "...", "webhook_url": "..."}'
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveConfig} className="flex-1">
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
