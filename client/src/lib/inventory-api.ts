/**
 * Client-side inventory API for demo (no server required).
 * Same shapes as tRPC serpin.* procedures.
 */
import { useSyncExternalStore, useCallback } from "react";
import mockStore from "./inventory-mock";

let version = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getVersion() {
  return version;
}

function bump() {
  version += 1;
  listeners.forEach((l) => l());
}

export function useInventoryTick() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export const inventoryApi = {
  products: {
    list: (businessId: number) => mockStore.getProducts(businessId),
    create: (data: any) => {
      const r = mockStore.createProduct(data);
      bump();
      return r;
    },
    delete: (id: number) => {
      mockStore.deleteProduct(id);
      bump();
    },
    updateStock: (id: number, newStock: number) => {
      mockStore.updateStock(id, newStock);
      bump();
    },
  },
  suppliers: {
    list: (businessId: number) => mockStore.getSuppliers(businessId),
    create: (data: any) => {
      const r = mockStore.createSupplier(data);
      bump();
      return r;
    },
    forProduct: (productId: number) => mockStore.getSupplierProductsForProduct(productId),
  },
  orders: {
    list: (businessId: number) => mockStore.getOrders(businessId),
    create: (data: any) => {
      const r = mockStore.createOrder(data);
      bump();
      return r;
    },
    updateStatus: (id: number, status: string) => {
      mockStore.updateOrderStatus(id, status as any);
      bump();
    },
  },
  dashboard: {
    metrics: (businessId: number) => mockStore.getDashboardMetrics(businessId),
    recommendations: (businessId: number) => mockStore.getAIRecommendations(businessId),
  },
  forecast: {
    demand: (businessId: number, productId: number) =>
      mockStore.getForecast(businessId, productId),
  },
  profile: {
    get: (userId: number) => {
      try {
        return mockStore.getBusinessProfile(userId) || {
          userId,
          businessType: "coffee_shop",
          locationsCount: 2,
          productCategories: "Молочные,Кофе,Выпечка",
          autoOrderThreshold: "1.5",
          preferredDeliveryDays: 2,
        };
      } catch {
        return {
          userId,
          businessType: "coffee_shop",
          locationsCount: 2,
          productCategories: "Молочные,Кофе,Выпечка",
          autoOrderThreshold: "1.5",
          preferredDeliveryDays: 2,
        };
      }
    },
    upsert: (data: any) => {
      try {
        mockStore.upsertBusinessProfile(data);
      } catch {}
      bump();
    },
  },
  demo: {
    simulateSale: (productId: number, qty = 5) => {
      const p = mockStore.simulateSale(productId, qty);
      bump();
      return p;
    },
  },
  locations: {
    list: () => mockStore.getLocations(),
    activeId: () => mockStore.getActiveLocationId(),
    setActive: (id: number) => {
      mockStore.setActiveLocationId(id);
      bump();
    },
  },
  impact: {
    metrics: (businessId: number) => mockStore.getImpactMetrics(businessId),
  },
  explain: {
    forecast: (businessId: number, productId: number) =>
      mockStore.getExplainableForecast(businessId, productId),
  },
  supplyHealth: {
    get: (businessId: number) => mockStore.getSupplyHealthScore(businessId),
  },
  planB: {
    simulateFailure: (orderId: number) => {
      const r = mockStore.simulateDeliveryFailure(orderId);
      bump();
      return r;
    },
    switchSupplier: (orderId: number, supplierId: number) => {
      const r = mockStore.switchOrderSupplier(orderId, supplierId);
      bump();
      return r;
    },
  },
};

/** Hook: re-render on inventory changes and return live data helpers */
export function useInventory() {
  useInventoryTick();
  return inventoryApi;
}
