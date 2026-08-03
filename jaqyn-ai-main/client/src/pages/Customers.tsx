import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useDemoStore } from "@/store/demoStore";
import { useCustomerSegmentation } from "@/hooks/useCustomerSegmentation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Phone, Mail, Calendar, Heart, TrendingDown } from "lucide-react";
import AICustomerInsights from "@/components/AICustomerInsights";

export default function Customers() {
  const { t } = useTranslation();
  const { user } = useSimpleAuth();
  const demoStore = useDemoStore();
  const segmentation = useCustomerSegmentation();
  
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const getCustomers = () => {
    let customers = demoStore.customers;

    if (selectedStatus !== "all") {
      customers = customers.filter((c) => c.status === selectedStatus);
    }

    if (searchQuery) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
      );
    }

    return customers;
  };

  const customers = getCustomers();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: t("active"), className: "bg-green-100 text-green-700" },
      at_risk: { label: t("atRisk"), className: "bg-amber-100 text-amber-700" },
      churned: { label: t("inactive"), className: "bg-red-100 text-red-700" },
      vip: { label: t("vip"), className: "bg-purple-100 text-purple-700" },
      new: { label: t("new"), className: "bg-blue-100 text-blue-700" },
      regular: { label: t("regular"), className: "bg-gray-100 text-gray-700" },
      inactive: { label: t("inactive"), className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status] || variants.active;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const daysSinceLastVisit = (lastVisit: Date) => {
    return Math.floor((Date.now() - lastVisit.getTime()) / 86400000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("customers")}</h1>
          <p className="text-muted-foreground mt-1">{t("customerHealth")}</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("customers")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">{t("all")} ({demoStore.customers.length})</TabsTrigger>
                <TabsTrigger value="vip">{t("vip")} ({segmentation.vip.length})</TabsTrigger>
                <TabsTrigger value="regular">{t("regular")} ({segmentation.regular.length})</TabsTrigger>
                <TabsTrigger value="at_risk">{t("atRisk")} ({segmentation.atRisk.length})</TabsTrigger>
                <TabsTrigger value="inactive">{t("inactive")} ({segmentation.inactive.length})</TabsTrigger>
                <TabsTrigger value="new">{t("new")} ({segmentation.new.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead className="text-right">{t("lastVisit")}</TableHead>
                    <TableHead className="text-right">{t("totalVisits")}</TableHead>
                    <TableHead className="text-right">{t("revenue")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t("noData")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDrawer(true);
                        }}
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {daysSinceLastVisit(customer.lastVisit)} days ago
                        </TableCell>
                        <TableCell className="text-right">{customer.totalVisits}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₸{customer.totalSpent.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            {t("view")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="w-full sm:w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedCustomer?.name}</SheetTitle>
            <SheetDescription>Customer profile and AI insights</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-6">
              {/* AI Insights */}
              <AICustomerInsights
                customerName={selectedCustomer.name}
                daysSinceLastVisit={daysSinceLastVisit(selectedCustomer.lastVisit)}
                totalVisits={selectedCustomer.totalVisits}
                totalSpent={selectedCustomer.totalSpent}
                averageOrderValue={Math.floor(selectedCustomer.totalSpent / selectedCustomer.totalVisits)}
              />

              <div className="border-t pt-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Customer Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Visits</p>
                    <p className="text-2xl font-bold">{selectedCustomer.totalVisits}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">₸{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg Order</p>
                    <p className="text-2xl font-bold">₸{Math.floor(selectedCustomer.totalSpent / selectedCustomer.totalVisits).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                    <p className="text-sm font-medium">{daysSinceLastVisit(selectedCustomer.lastVisit)} days ago</p>
                  </div>
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Loyalty Points
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-3xl font-bold text-purple-900">{selectedCustomer.loyaltyPoints}</p>
                  <p className="text-xs text-purple-700 mt-1">Points available for redemption</p>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">AI Recommendation</h3>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    {selectedCustomer.status === "at_risk"
                      ? `${selectedCustomer.name} hasn't visited in a while. Consider sending a personalized re-engagement offer.`
                      : selectedCustomer.status === "vip"
                      ? `${selectedCustomer.name} is a valued customer. Offer exclusive perks to maintain loyalty.`
                      : selectedCustomer.status === "inactive"
                      ? `${selectedCustomer.name} is inactive. Send a special win-back campaign.`
                      : `${selectedCustomer.name} is an active customer. Great opportunity for upselling.`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Send Campaign
                </Button>
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
