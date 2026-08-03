import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/DashboardLayout";
import { useDemoStore, Campaign } from "@/store/demoStore";
import { useCustomerSegmentation } from "@/hooks/useCustomerSegmentation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, TrendingUp, Send, CheckCircle } from "lucide-react";
import AICopywriter from "@/components/AICopywriter";
import GrowthSimulation from "@/components/GrowthSimulation";

export default function CampaignStudio() {
  const { t } = useTranslation();
  const demoStore = useDemoStore();
  const segmentation = useCustomerSegmentation();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGrowthSimulation, setShowGrowthSimulation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    targetSegment: "",
    message: "",
    channels: [] as string[],
  });

  const handleChannelToggle = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const getSegmentCount = (segment: string): number => {
    switch (segment) {
      case "vip":
        return segmentation.vip.length;
      case "at_risk":
        return segmentation.atRisk.length;
      case "inactive":
        return segmentation.inactive.length;
      case "regular":
        return segmentation.regular.length;
      case "new":
        return segmentation.new.length;
      default:
        return demoStore.customers.length;
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.goal || !formData.targetSegment || !formData.message) {
      toast.error(t("fillAllFields"));
      return;
    }

    // Show growth simulation first
    setShowGrowthSimulation(true);
  };

  const handleConfirmCampaign = () => {
    const newCampaign: Campaign = {
      id: demoStore.campaigns.length + 1,
      name: formData.name,
      targetSegment: formData.targetSegment,
      sentCount: getSegmentCount(formData.targetSegment),
      returnedCount: Math.floor(getSegmentCount(formData.targetSegment) * 0.23),
      generatedRevenue: Math.floor(getSegmentCount(formData.targetSegment) * 668),
      cost: 2000,
      roi: 6.7,
      createdAt: new Date(),
      status: "sent",
    };

    demoStore.addCampaign(newCampaign);
    demoStore.addActionHistory(
      `✔ Создана кампания ${formData.name}`,
      `Кампания отправлена ${getSegmentCount(formData.targetSegment)} клиентам`,
      "🚀"
    );
    setShowGrowthSimulation(false);
    setShowSuccess(true);
    toast.success(t("success"));

    setTimeout(() => {
      setShowSuccess(false);
      setStep(1);
      setFormData({ name: "", goal: "", targetSegment: "", message: "", channels: [] });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700" },
      sent: { label: "Sent", className: "bg-green-100 text-green-700" },
      completed: { label: "Completed", className: "bg-purple-100 text-purple-700" },
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("campaigns")}</h1>
          <p className="text-muted-foreground mt-1">{t("createCampaign")}</p>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">{t("createCampaign")}</TabsTrigger>
            <TabsTrigger value="history">{t("campaigns")}</TabsTrigger>
            <TabsTrigger value="ai">{t("aiCopilot")}</TabsTrigger>
          </TabsList>

          {/* Create Campaign Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("createCampaign")}</CardTitle>
                <CardDescription>Step {step} of 3</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t("campaignName")}</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Coffee Comeback"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal">{t("selectSegment")}</Label>
                      <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                        <SelectTrigger id="goal">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="win_back_inactive">{t("launchWinBackCampaign")}</SelectItem>
                          <SelectItem value="increase_frequency">Increase Frequency</SelectItem>
                          <SelectItem value="upsell">Upsell</SelectItem>
                          <SelectItem value="loyalty">Build Loyalty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => setStep(2)} className="w-full">
                      {t("next")}
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="segment">{t("selectSegment")}</Label>
                      <Select value={formData.targetSegment} onValueChange={(value) => setFormData({ ...formData, targetSegment: value })}>
                        <SelectTrigger id="segment">
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vip">{t("vip")} ({segmentation.vip.length})</SelectItem>
                          <SelectItem value="at_risk">{t("atRisk")} ({segmentation.atRisk.length})</SelectItem>
                          <SelectItem value="inactive">{t("inactive")} ({segmentation.inactive.length})</SelectItem>
                          <SelectItem value="regular">{t("regular")} ({segmentation.regular.length})</SelectItem>
                          <SelectItem value="new">{t("new")} ({segmentation.new.length})</SelectItem>
                          <SelectItem value="all">{t("all")} ({demoStore.customers.length})</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Will send to {getSegmentCount(formData.targetSegment)} customers
                      </p>
                    </div>

                    <div>
                      <Label>{t("selectChannels")}</Label>
                      <div className="flex gap-3 mt-2">
                        {["SMS", "WhatsApp", "Email", "Push"].map((channel) => (
                          <Button
                            key={channel}
                            variant={formData.channels.includes(channel) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleChannelToggle(channel)}
                          >
                            {channel}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        {t("previous")}
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1">
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">{t("campaignMessage")}</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter campaign message..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Preview</p>
                      <p className="text-sm text-blue-800">{formData.message || "Your message will appear here"}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        {t("previous")}
                      </Button>
                      <Button onClick={handleCreateCampaign} className="flex-1 gap-2">
                        <Send className="w-4 h-4" />
                        {t("submit")}
                      </Button>
                    </div>

                    {showGrowthSimulation && (
                      <GrowthSimulation
                        campaignName={formData.name}
                        targetSegmentSize={getSegmentCount(formData.targetSegment)}
                        onClose={handleConfirmCampaign}
                      />
                    )}
                  </div>
                )}

                {showSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">Campaign launched successfully!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("campaigns")}</CardTitle>
                <CardDescription>{demoStore.campaigns.length} {t("all")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("campaignName")}</TableHead>
                        <TableHead>{t("selectSegment")}</TableHead>
                        <TableHead className="text-right">{t("sent")}</TableHead>
                        <TableHead className="text-right">{t("returned")}</TableHead>
                        <TableHead className="text-right">{t("revenue")}</TableHead>
                        <TableHead className="text-right">{t("roi")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoStore.campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{campaign.targetSegment}</TableCell>
                          <TableCell className="text-right">{campaign.sentCount}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">{campaign.returnedCount}</TableCell>
                          <TableCell className="text-right font-medium">₸{campaign.generatedRevenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-blue-600">{campaign.roi.toFixed(1)}x</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Copywriter Tab */}
          <TabsContent value="ai">
            <AICopywriter />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
