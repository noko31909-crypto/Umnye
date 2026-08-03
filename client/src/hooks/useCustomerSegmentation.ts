import { useMemo } from 'react';
import { useDemoStore } from '@/store/demoStore';

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

export function useCustomerSegmentation() {
  const customers = useDemoStore((state) => state.customers);

  const segmented = useMemo(
    () => ({
      vip: customers.filter((c) => c.totalSpent > 50000 || c.totalVisits > 20),
      atRisk: customers.filter((c) => {
        const daysSinceVisit = (Date.now() - toDate(c.lastVisit).getTime()) / 86400000;
        return daysSinceVisit >= 14 && daysSinceVisit < 30;
      }),
      inactive: customers.filter((c) => {
        const daysSinceVisit = (Date.now() - toDate(c.lastVisit).getTime()) / 86400000;
        return daysSinceVisit >= 30;
      }),
      regular: customers.filter((c) => {
        const daysSinceVisit = (Date.now() - toDate(c.lastVisit).getTime()) / 86400000;
        return c.totalVisits >= 3 && daysSinceVisit < 14;
      }),
      new: customers.filter((c) => c.totalVisits <= 2),
    }),
    [customers]
  );

  return segmented;
}

export function useGrowthBrief() {
  const store = useDemoStore();
  const segmentation = useCustomerSegmentation();

  const brief = useMemo(() => {
    const totalRevenue = store.getTotalRevenue();
    const avgDailyRevenue = totalRevenue / 30;
    const totalCustomers = store.customers.length;
    const activeCount = segmentation.regular.length + segmentation.vip.length;
    const retentionRate = ((activeCount / totalCustomers) * 100).toFixed(1);
    const atRiskCount = segmentation.atRisk.length;
    const inactiveCount = segmentation.inactive.length;

    return {
      businessName: store.businessName,
      period: 'Last 30 Days',
      totalRevenue: totalRevenue.toLocaleString(),
      avgDailyRevenue: Math.floor(avgDailyRevenue).toLocaleString(),
      totalCustomers,
      activeCustomers: activeCount,
      retentionRate: parseFloat(retentionRate),
      atRiskCount,
      inactiveCount,
      topOpportunity: atRiskCount > 0 ? `Re-engage ${atRiskCount} at-risk customers` : 'Maintain momentum',
      recommendation: atRiskCount > 10 ? 'Launch targeted win-back campaign' : 'Focus on VIP retention',
      quietHourAlert: 'Low traffic detected after 16:00 on weekdays',
      nextAction: 'Create quiet hour promotion campaign',
    };
  }, [store, segmentation]);

  return brief;
}
