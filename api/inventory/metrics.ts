export const runtime = "nodejs";

export default function handler(_req: any, res: any) {
  res.status(200).json({
    totalProducts: 10,
    lowStockCount: 2,
    criticalCount: 4,
    activeOrders: 3,
    deliveredOrders: 2,
    totalSuppliers: 6,
    totalInventoryValue: 121140,
    autoOrderSavings: 3348,
    avgDeliveryDays: 2.8,
    missedDeliveries: 44,
    ok: true,
  });
}
