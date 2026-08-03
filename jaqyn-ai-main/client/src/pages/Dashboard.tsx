import { useLocation } from "wouter";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useTranslation } from "@/hooks/useTranslation";
import GrowthBriefCard from "@/components/GrowthBriefCard";
import { useDemoStore } from "@/store/demoStore";
import { useCustomerSegmentation } from "@/hooks/useCustomerSegmentation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { AlertCircle, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import AIInsightsCard from "@/components/AIInsightsCard";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { user, loading } = useSimpleAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const demoStore = useDemoStore();
  const segmentation = useCustomerSegmentation();

  const customers = demoStore.customers;
  const campaigns = demoStore.campaigns;
  const dailySales = demoStore.dailySales;

  const activeCustomers = segmentation.regular.length + segmentation.vip.length;
  const atRiskCustomers = segmentation.atRisk.length;
  const inactiveCustomers = segmentation.inactive.length;

  // Transform daily sales to chart data
  const revenueData = dailySales.slice(-7).map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: day.revenue,
  }));

  const trafficData = [
    { date: "Mon", visits: 45 },
    { date: "Tue", visits: 38 },
    { date: "Wed", visits: 52 },
    { date: "Thu", visits: 41 },
    { date: "Fri", visits: 58 },
    { date: "Sat", visits: 65 },
    { date: "Sun", visits: 48 },
  ];

  const totalRevenue = demoStore.getTotalRevenue();
  const repeatVisitRate = customers.length > 0 ? Math.round(((customers.filter((c) => c.totalVisits > 1).length / customers.length) * 100)) : 0;

  if (!user || loading) {
    return <DashboardLayout><div /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-muted-foreground mt-1">
            {demoStore.businessName} • {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Growth Brief */}
        <GrowthBriefCard />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("todayRevenue")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₸{Math.floor(totalRevenue / 30).toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("activeCampaigns")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{demoStore.getActiveCampaigns().length}</div>
              <p className="text-xs text-muted-foreground mt-1">{campaigns.length} {t("all")}</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("repeatVisitRate")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{repeatVisitRate}%</div>
              <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("atRiskCustomers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{atRiskCustomers}</div>
              <p className="text-xs text-red-600 mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {t("revenueTrend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                {t("conversionByChannel")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    fill="#8b5cf6"
                    stroke="#8b5cf6"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <AIInsightsCard />
      </div>
    </DashboardLayout>
  );
}
