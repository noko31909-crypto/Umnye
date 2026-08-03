import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/DashboardLayout";
import { useDemoStore } from "@/store/demoStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Download } from "lucide-react";
import AIAnalyticsDiagnostics from "@/components/AIAnalyticsDiagnostics";

export default function Analytics() {
  const { t } = useTranslation();
  const demoStore = useDemoStore();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  // Transform daily sales to weekly revenue data
  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = i * 7;
    const weekEnd = Math.min((i + 1) * 7, demoStore.dailySales.length);
    const weekRevenue = demoStore.dailySales
      .slice(weekStart, weekEnd)
      .reduce((sum, day) => sum + day.revenue, 0);
    weeklyData.push({
      date: `Week ${i + 1}`,
      revenue: weekRevenue,
      target: 50000,
    });
  }

  // Retention data (mock)
  const retentionData = [
    { month: "Jan", retention: 65 },
    { month: "Feb", retention: 68 },
    { month: "Mar", retention: 72 },
    { month: "Apr", retention: 75 },
    { month: "May", retention: 78 },
    { month: "Jun", retention: 82 },
  ];

  // Campaign performance from store
  const campaignPerformance = demoStore.campaigns.map((c) => ({
    name: c.name,
    sent: c.sentCount,
    conversion: c.returnedCount,
    revenue: c.generatedRevenue,
    roi: `${c.roi.toFixed(1)}x`,
  }));

  // Conversion rate by channel (mock)
  const conversionRateData = [
    { name: "SMS", value: 45, color: "#3b82f6" },
    { name: "WhatsApp", value: 35, color: "#10b981" },
    { name: "Email", value: 15, color: "#f59e0b" },
    { name: "Push", value: 5, color: "#8b5cf6" },
  ];

  // Total metrics
  const totalRevenue = demoStore.getTotalRevenue();
  const totalCampaigns = demoStore.campaigns.length;
  const avgROI = (demoStore.campaigns.reduce((sum, c) => sum + c.roi, 0) / totalCampaigns).toFixed(1);
  const totalSent = demoStore.campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalConverted = demoStore.campaigns.reduce((sum, c) => sum + c.returnedCount, 0);
  const overallConversionRate = ((totalConverted / totalSent) * 100).toFixed(1);

  const selectedCampaignData = selectedCampaign
    ? demoStore.campaigns.find((c) => c.id === selectedCampaign)
    : demoStore.campaigns[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("analytics")}</h1>
          <p className="text-muted-foreground mt-1">{t("conversionRate")}</p>
        </div>

        {/* AI Insights & Next Steps */}
        <AIAnalyticsDiagnostics
          campaignName={selectedCampaignData?.name || "Overall"}
          sent={selectedCampaignData?.sentCount || totalSent}
          conversions={selectedCampaignData?.returnedCount || totalConverted}
          revenue={selectedCampaignData?.generatedRevenue || totalRevenue}
          roi={selectedCampaignData?.roi || parseFloat(avgROI)}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("revenue")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₸{(totalRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-green-600 mt-1">↑ 28% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("conversionRate")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overallConversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{totalConverted} conversions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("roi")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgROI}x</div>
              <p className="text-xs text-green-600 mt-1">Above benchmark</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">{demoStore.getActiveCampaigns().length} active</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Weekly revenue vs target</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" />
                  <Bar dataKey="target" fill="hsl(var(--muted))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion by Channel</CardTitle>
              <CardDescription>Distribution of conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conversionRateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conversionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Retention Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Retention Rate</CardTitle>
            <CardDescription>Monthly retention trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="hsl(var(--accent))"
                  dot={{ fill: "hsl(var(--accent))" }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Detailed metrics for all campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignPerformance.map((campaign, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="text-right">{campaign.sent}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{campaign.conversion}</TableCell>
                      <TableCell className="text-right">
                        {((campaign.conversion / campaign.sent) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">₸{campaign.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">{campaign.roi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
