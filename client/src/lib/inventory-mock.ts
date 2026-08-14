/**
 * Inventory module — rich in-memory mock data + mutable store.
 * Used as fallback when DB is unavailable or empty (demo mode).
 * Fully interactive: stock updates, orders change status, recommendations recalculate.
 */

export type MockProduct = {
  id: number;
  businessId: number;
  name: string;
  category: string;
  unit: string;
  currentStock: string;
  minStock: string;
  maxStock: string;
  avgSalesPerDay: string;
  costPrice: string;
  sellingPrice: string;
  preferredSupplierId: number | null;
  autoOrderEnabled: boolean;
  status: "in_stock" | "low_stock" | "critical" | "out_of_stock";
  createdAt: Date;
  updatedAt: Date;
};

export type MockSupplier = {
  id: number;
  businessId: number;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  avgDeliveryDays: string;
  reliabilityScore: string;
  lateDeliveryCount: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MockSupplierProduct = {
  id: number;
  supplierId: number;
  productId: number;
  price: string;
  minOrderQty: string;
  inStock: boolean;
  createdAt: Date;
};

export type MockOrder = {
  id: number;
  businessId: number;
  supplierId: number;
  status: "pending" | "confirmed" | "collecting" | "in_transit" | "delivered" | "cancelled";
  totalAmount: string;
  expectedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  notes: string | null;
  isAutoOrder: boolean;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: string;
  price: string;
  deliveredQty: string;
  createdAt: Date;
};

export type MockSale = {
  id: number;
  businessId: number;
  productId: number;
  saleDate: Date;
  quantity: string;
  revenue: string;
  createdAt: Date;
};

export type MockBusinessProfile = {
  id: number;
  userId: number;
  businessType: "coffee_shop" | "store" | "pharmacy" | "bakery" | "restaurant" | "other";
  locationsCount: number;
  productCategories: string;
  autoOrderThreshold: string;
  preferredDeliveryDays: number;
  createdAt: Date;
  updatedAt: Date;
};

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

function calcStatus(stock: number, min: number): MockProduct["status"] {
  if (stock <= 0) return "out_of_stock";
  if (stock <= min * 0.4) return "critical";
  if (stock <= min) return "low_stock";
  return "in_stock";
}

// ─── Initial demo data (кофейня / небольшой магазин) ───────────────────────

let nextProductId = 20;
let nextSupplierId = 10;
let nextOrderId = 1050;
let nextOrderItemId = 100;
let nextSaleId = 500;
let nextSpId = 50;

const products: MockProduct[] = [
  {
    id: 1, businessId: 1, name: "Молоко 3.2% 1л", category: "Молочные", unit: "шт",
    currentStock: "12", minStock: "40", maxStock: "120", avgSalesPerDay: "18",
    costPrice: "280", sellingPrice: "380", preferredSupplierId: 1, autoOrderEnabled: true,
    status: "critical", createdAt: daysAgo(60), updatedAt: now,
  },
  {
    id: 2, businessId: 1, name: "Кофе зерновой Arabica 1кг", category: "Кофе", unit: "кг",
    currentStock: "8", minStock: "15", maxStock: "50", avgSalesPerDay: "3.5",
    costPrice: "4500", sellingPrice: "7200", preferredSupplierId: 2, autoOrderEnabled: true,
    status: "low_stock", createdAt: daysAgo(60), updatedAt: now,
  },
  {
    id: 3, businessId: 1, name: "Сахар-песок 1кг", category: "Бакалея", unit: "кг",
    currentStock: "45", minStock: "20", maxStock: "80", avgSalesPerDay: "4",
    costPrice: "350", sellingPrice: "480", preferredSupplierId: 1, autoOrderEnabled: true,
    status: "in_stock", createdAt: daysAgo(60), updatedAt: now,
  },
  {
    id: 4, businessId: 1, name: "Сливки 20% 0.5л", category: "Молочные", unit: "шт",
    currentStock: "6", minStock: "25", maxStock: "60", avgSalesPerDay: "9",
    costPrice: "420", sellingPrice: "590", preferredSupplierId: 1, autoOrderEnabled: true,
    status: "critical", createdAt: daysAgo(45), updatedAt: now,
  },
  {
    id: 5, businessId: 1, name: "Сироп ванильный 1л", category: "Сиропы", unit: "шт",
    currentStock: "14", minStock: "10", maxStock: "30", avgSalesPerDay: "1.8",
    costPrice: "1800", sellingPrice: "2900", preferredSupplierId: 3, autoOrderEnabled: true,
    status: "in_stock", createdAt: daysAgo(40), updatedAt: now,
  },
  {
    id: 6, businessId: 1, name: "Стаканы бумажные 250мл (100шт)", category: "Расходники", unit: "уп",
    currentStock: "3", minStock: "8", maxStock: "25", avgSalesPerDay: "2.2",
    costPrice: "950", sellingPrice: "0", preferredSupplierId: 4, autoOrderEnabled: true,
    status: "critical", createdAt: daysAgo(30), updatedAt: now,
  },
  {
    id: 7, businessId: 1, name: "Круассан классический", category: "Выпечка", unit: "шт",
    currentStock: "22", minStock: "30", maxStock: "80", avgSalesPerDay: "28",
    costPrice: "180", sellingPrice: "450", preferredSupplierId: 5, autoOrderEnabled: true,
    status: "low_stock", createdAt: daysAgo(20), updatedAt: now,
  },
  {
    id: 8, businessId: 1, name: "Чай чёрный листовой 200г", category: "Чай", unit: "уп",
    currentStock: "18", minStock: "8", maxStock: "30", avgSalesPerDay: "1.2",
    costPrice: "1200", sellingPrice: "2100", preferredSupplierId: 2, autoOrderEnabled: false,
    status: "in_stock", createdAt: daysAgo(50), updatedAt: now,
  },
  {
    id: 9, businessId: 1, name: "Вода негазированная 0.5л", category: "Напитки", unit: "шт",
    currentStock: "0", minStock: "48", maxStock: "120", avgSalesPerDay: "22",
    costPrice: "90", sellingPrice: "180", preferredSupplierId: 1, autoOrderEnabled: true,
    status: "out_of_stock", createdAt: daysAgo(55), updatedAt: now,
  },
  {
    id: 10, businessId: 1, name: "Какао-порошок 250г", category: "Ингредиенты", unit: "уп",
    currentStock: "9", minStock: "6", maxStock: "20", avgSalesPerDay: "0.8",
    costPrice: "1100", sellingPrice: "1800", preferredSupplierId: 3, autoOrderEnabled: true,
    status: "in_stock", createdAt: daysAgo(35), updatedAt: now,
  },
];

const suppliers: MockSupplier[] = [
  {
    id: 1, businessId: 1, name: "Молочный Двор", category: "Молочные продукты",
    contactPerson: "Айгуль С.", phone: "+7 777 123 4567", email: "orders@moloko.kz",
    avgDeliveryDays: "1.5", reliabilityScore: "96", lateDeliveryCount: 2, totalOrders: 48,
    isActive: true, createdAt: daysAgo(90), updatedAt: now,
  },
  {
    id: 2, businessId: 1, name: "Coffee Trade KZ", category: "Кофе и чай",
    contactPerson: "Ерлан Т.", phone: "+7 701 987 6543", email: "sales@coffeetrade.kz",
    avgDeliveryDays: "3", reliabilityScore: "91", lateDeliveryCount: 5, totalOrders: 32,
    isActive: true, createdAt: daysAgo(80), updatedAt: now,
  },
  {
    id: 3, businessId: 1, name: "SweetMix", category: "Сиропы и добавки",
    contactPerson: "Данияр К.", phone: "+7 705 555 1122", email: "info@sweetmix.kz",
    avgDeliveryDays: "2", reliabilityScore: "88", lateDeliveryCount: 7, totalOrders: 25,
    isActive: true, createdAt: daysAgo(70), updatedAt: now,
  },
  {
    id: 4, businessId: 1, name: "PackPro", category: "Упаковка и расходники",
    contactPerson: "Алина М.", phone: "+7 747 333 8899", email: "order@packpro.kz",
    avgDeliveryDays: "4", reliabilityScore: "82", lateDeliveryCount: 11, totalOrders: 19,
    isActive: true, createdAt: daysAgo(60), updatedAt: now,
  },
  {
    id: 5, businessId: 1, name: "Пекарня «Утренний хлеб»", category: "Выпечка",
    contactPerson: "Сергей В.", phone: "+7 777 444 2211", email: "bakery@utro.kz",
    avgDeliveryDays: "1", reliabilityScore: "98", lateDeliveryCount: 1, totalOrders: 60,
    isActive: true, createdAt: daysAgo(100), updatedAt: now,
  },
  {
    id: 6, businessId: 1, name: "ОптМаркет (дешёвый)", category: "Опт",
    contactPerson: "Нурлан Б.", phone: "+7 700 111 2233", email: "opt@optmarket.kz",
    avgDeliveryDays: "5", reliabilityScore: "74", lateDeliveryCount: 18, totalOrders: 14,
    isActive: true, createdAt: daysAgo(40), updatedAt: now,
  },
];

const supplierProducts: MockSupplierProduct[] = [
  // Молоко
  { id: 1, supplierId: 1, productId: 1, price: "280", minOrderQty: "20", inStock: true, createdAt: now },
  { id: 2, supplierId: 6, productId: 1, price: "255", minOrderQty: "50", inStock: true, createdAt: now },
  // Кофе
  { id: 3, supplierId: 2, productId: 2, price: "4500", minOrderQty: "5", inStock: true, createdAt: now },
  { id: 4, supplierId: 6, productId: 2, price: "4200", minOrderQty: "10", inStock: true, createdAt: now },
  // Сахар
  { id: 5, supplierId: 1, productId: 3, price: "350", minOrderQty: "10", inStock: true, createdAt: now },
  { id: 6, supplierId: 6, productId: 3, price: "310", minOrderQty: "25", inStock: true, createdAt: now },
  // Сливки
  { id: 7, supplierId: 1, productId: 4, price: "420", minOrderQty: "15", inStock: true, createdAt: now },
  { id: 8, supplierId: 6, productId: 4, price: "390", minOrderQty: "30", inStock: false, createdAt: now },
  // Сироп
  { id: 9, supplierId: 3, productId: 5, price: "1800", minOrderQty: "4", inStock: true, createdAt: now },
  { id: 10, supplierId: 6, productId: 5, price: "1650", minOrderQty: "8", inStock: true, createdAt: now },
  // Стаканы
  { id: 11, supplierId: 4, productId: 6, price: "950", minOrderQty: "5", inStock: true, createdAt: now },
  { id: 12, supplierId: 6, productId: 6, price: "870", minOrderQty: "10", inStock: true, createdAt: now },
  // Круассаны
  { id: 13, supplierId: 5, productId: 7, price: "180", minOrderQty: "20", inStock: true, createdAt: now },
  // Чай
  { id: 14, supplierId: 2, productId: 8, price: "1200", minOrderQty: "5", inStock: true, createdAt: now },
  // Вода
  { id: 15, supplierId: 1, productId: 9, price: "90", minOrderQty: "24", inStock: true, createdAt: now },
  { id: 16, supplierId: 6, productId: 9, price: "78", minOrderQty: "48", inStock: true, createdAt: now },
  // Какао
  { id: 17, supplierId: 3, productId: 10, price: "1100", minOrderQty: "4", inStock: true, createdAt: now },
];

const orders: MockOrder[] = [
  {
    id: 1045, businessId: 1, supplierId: 1, status: "delivered",
    totalAmount: "11200", expectedDeliveryDate: daysAgo(5), actualDeliveryDate: daysAgo(4),
    notes: "Регулярный заказ молока и сливок", isAutoOrder: false, createdBy: 1,
    createdAt: daysAgo(8), updatedAt: daysAgo(4),
  },
  {
    id: 1046, businessId: 1, supplierId: 2, status: "delivered",
    totalAmount: "22500", expectedDeliveryDate: daysAgo(3), actualDeliveryDate: daysAgo(2),
    notes: null, isAutoOrder: true, createdBy: null,
    createdAt: daysAgo(6), updatedAt: daysAgo(2),
  },
  {
    id: 1047, businessId: 1, supplierId: 5, status: "in_transit",
    totalAmount: "5400", expectedDeliveryDate: daysFromNow(0), actualDeliveryDate: null,
    notes: "Ежедневная выпечка", isAutoOrder: true, createdBy: null,
    createdAt: daysAgo(1), updatedAt: daysAgo(0),
  },
  {
    id: 1048, businessId: 1, supplierId: 4, status: "collecting",
    totalAmount: "4750", expectedDeliveryDate: daysFromNow(3), actualDeliveryDate: null,
    notes: "Стаканы — срочно", isAutoOrder: false, createdBy: 1,
    createdAt: daysAgo(1), updatedAt: now,
  },
  {
    id: 1049, businessId: 1, supplierId: 1, status: "confirmed",
    totalAmount: "0", expectedDeliveryDate: daysFromNow(2), actualDeliveryDate: null,
    notes: "Ожидает подтверждения", isAutoOrder: false, createdBy: 1,
    createdAt: now, updatedAt: now,
  },
];

const orderItems: MockOrderItem[] = [
  { id: 1, orderId: 1045, productId: 1, quantity: "40", price: "280", deliveredQty: "40", createdAt: daysAgo(8) },
  { id: 2, orderId: 1045, productId: 4, quantity: "20", price: "420", deliveredQty: "18", createdAt: daysAgo(8) },
  { id: 3, orderId: 1046, productId: 2, quantity: "5", price: "4500", deliveredQty: "5", createdAt: daysAgo(6) },
  { id: 4, orderId: 1047, productId: 7, quantity: "30", price: "180", deliveredQty: "0", createdAt: daysAgo(1) },
  { id: 5, orderId: 1048, productId: 6, quantity: "5", price: "950", deliveredQty: "0", createdAt: daysAgo(1) },
];

// Generate 30 days of sales history for forecasting
const salesHistory: MockSale[] = [];
let saleId = 1;
for (let d = 30; d >= 0; d--) {
  const date = daysAgo(d);
  // weekend boost
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const factor = isWeekend ? 1.35 : 1;

  products.forEach((p) => {
    const base = Number(p.avgSalesPerDay);
    const noise = 0.75 + Math.random() * 0.5;
    const qty = Math.max(0, Math.round(base * factor * noise * 10) / 10);
    if (qty > 0) {
      salesHistory.push({
        id: saleId++,
        businessId: 1,
        productId: p.id,
        saleDate: date,
        quantity: String(qty),
        revenue: String(Math.round(qty * Number(p.sellingPrice))),
        createdAt: date,
      });
    }
  });
}

const businessProfile: MockBusinessProfile = {
  id: 1,
  userId: 1,
  businessType: "coffee_shop",
  locationsCount: 2,
  productCategories: "Молочные,Кофе,Выпечка,Сиропы,Расходники,Чай,Напитки",
  autoOrderThreshold: "1.5",
  preferredDeliveryDays: 2,
  createdAt: daysAgo(100),
  updatedAt: now,
};

// ─── Mutable store API ─────────────────────────────────────────────────────

function refreshProductStatus(p: MockProduct) {
  p.status = calcStatus(Number(p.currentStock), Number(p.minStock));
  p.updatedAt = new Date();
}



// ── Multi-location (2-5 points network) ──────────────────────────────────────
export type Location = {
  id: number;
  name: string;
  address: string;
  stockMultiplier: number; // relative stock level vs HQ
};

const LOCATIONS: Location[] = [
  { id: 1, name: "Кофейня на Достык", address: "пр. Достык 89, Алматы", stockMultiplier: 1.0 },
  { id: 2, name: "Кофейня на Розыбакиева", address: "ул. Розыбакиева 247, Алматы", stockMultiplier: 0.65 },
  { id: 3, name: "Кофейня Mega Park", address: "Mega Park, 2 этаж", stockMultiplier: 1.25 },
];

let activeLocationId = 1;

export function getLocations() {
  return LOCATIONS;
}

export function getActiveLocationId() {
  return activeLocationId;
}

export function setActiveLocationId(id: number) {
  if (LOCATIONS.some((l) => l.id === id)) activeLocationId = id;
  return activeLocationId;
}

function locationAwareProducts(businessId: number) {
  const base = products.filter((p) => p.businessId === businessId);
  const loc = LOCATIONS.find((l) => l.id === activeLocationId) || LOCATIONS[0];
  // Scale stock by branch without mutating base catalog permanently for other branches
  return base.map((p) => {
    const stock = Math.max(0, Math.round(parseFloat(p.currentStock) * loc.stockMultiplier * 10) / 10);
    const min = parseFloat(p.minStock);
    const avg = parseFloat(p.avgSalesPerDay) || 1;
    const days = stock / avg;
    let status: Product["status"] = "in_stock";
    if (stock <= 0) status = "out_of_stock";
    else if (days < 1) status = "critical";
    else if (stock <= min) status = "low_stock";
    return {
      ...p,
      currentStock: String(stock),
      status,
      // stable id per product; branch is applied via stock
    };
  });
}

function getProductsLocated(businessId: number) {
  return locationAwareProducts(businessId);
}

// ── Impact / savings narrative ───────────────────────────────────────────────
export function getImpactMetrics(businessId: number) {
  const prods = locationAwareProducts(businessId);
  const ords = orders.filter((o) => o.businessId === businessId);
  const autoOrders = ords.filter((o) => o.isAutoOrder);
  const preventedDeficits = prods.filter((p) => p.autoOrderEnabled && (p.status === "low_stock" || p.status === "critical" || p.status === "out_of_stock")).length
    + autoOrders.length * 2;

  // "Without platform" waste: emergency purchases at +25% price + lost sales on out-of-stock
  const emergencyPremium = autoOrders.reduce((s, o) => s + parseFloat(o.totalAmount) * 0.25, 0);
  const lostSalesAvoided = prods
    .filter((p) => p.status === "critical" || p.status === "out_of_stock")
    .reduce((s, p) => s + parseFloat(p.sellingPrice) * parseFloat(p.avgSalesPerDay) * 3, 0);
  const lateCostAvoided = suppliers.reduce((s, x) => s + x.lateDeliveryCount * 2500, 0);

  const savingsMonth = Math.round(emergencyPremium + lostSalesAvoided * 0.4 + lateCostAvoided * 0.15 + 18400);
  const deficitsPrevented = Math.max(preventedDeficits, 7);
  const wasteAvoidedKg = Math.round(savingsMonth / 850); // narrative kg equivalent

  return {
    savingsMonth,
    deficitsPrevented,
    wasteAvoidedKg,
    autoOrdersCount: autoOrders.length,
    emergencyPremiumAvoided: Math.round(emergencyPremium + 6200),
    lostSalesAvoided: Math.round(lostSalesAvoided * 0.4),
    withoutPlatformCost: Math.round(savingsMonth * 1.35 + 22000),
    withPlatformCost: Math.round((savingsMonth * 1.35 + 22000) - savingsMonth),
  };
}

// ── Explainable forecast factors ─────────────────────────────────────────────
export function getExplainableForecast(businessId: number, productId: number) {
  const product = products.find((p) => p.id === productId);
  const day = new Date().getDay(); // 0 Sun
  const isThursday = day === 4;
  const isWeekend = day === 0 || day === 6;
  const avg = parseFloat(product?.avgSalesPerDay || "10") || 10;
  const history = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    qty: Math.round(avg * (0.85 + (i % 5) * 0.05)),
  }));
  const forecast7 = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
    qty: Math.round(avg * 1.1),
  }));
  const base = { history, forecast7, forecast14: forecast7.concat(forecast7) };
  void businessId;

  const factors = [
    {
      key: "weekday",
      label: isThursday ? "Четверг перед выходными" : isWeekend ? "Выходной день" : "Будний день",
      effect: isThursday ? "+28%" : isWeekend ? "+15%" : "база",
      detail: isThursday
        ? "В прошлом году в четверг перед праздниками спрос вырос на 28–35%."
        : isWeekend
        ? "Выходные: выше трафик, но короче окно поставок."
        : "Обычный будний паттерн продаж.",
      weight: isThursday ? 0.35 : isWeekend ? 0.2 : 0.1,
    },
    {
      key: "trend",
      label: "Тренд 14 дней",
      effect: "+8%",
      detail: "Скользящее среднее растёт: +8% к предыдущим двум неделям.",
      weight: 0.25,
    },
    {
      key: "season",
      label: "Сезонность (лето / напитки)",
      effect: product?.category === "Напитки" ? "+12%" : "+3%",
      detail:
        product?.category === "Напитки"
          ? "Категория напитков: сезонный подъём в жаркий период."
          : "Слабая сезонная компонента для этой категории.",
      weight: product?.category === "Напитки" ? 0.2 : 0.08,
    },
    {
      key: "stock",
      label: "Текущий остаток",
      effect: product?.status === "critical" || product?.status === "out_of_stock" ? "риск дефицита" : "норма",
      detail: `Остаток ${product?.currentStock ?? "?"} ${product?.unit ?? ""} при продажах ~${avg}/день.`,
      weight: 0.2,
    },
  ];

  const uplift = factors.reduce((s, f) => s + (typeof f.weight === "number" ? f.weight : 0), 0);
  const recommendedQty = Math.ceil(avg * 7 * (1 + uplift * 0.5));

  return {
    ...base,
    factors,
    narrative: isThursday
      ? `+${Math.round(uplift * 40)}% к среднему — четверг и тренд роста; в прошлом году такой же паттерн перед пиком.`
      : `Прогноз опирается на тренд 14 дней и день недели; рекомендуемый заказ ~${recommendedQty} ${product?.unit ?? "шт"}.`,
    recommendedQty,
  };
}

// ── Delivery failure → Plan B ────────────────────────────────────────────────
export function simulateDeliveryFailure(orderId: number) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  // Mark as delayed / problem
  order.status = "in_transit";
  order.notes = (order.notes || "") + " [СРыв: поставщик задержал отгрузку]";
  order.updatedAt = new Date();

  const failedSupplier = suppliers.find((s) => s.id === order.supplierId);
  const items = orderItems.filter((i) => i.orderId === orderId);
  const productIds = items.map((i) => i.productId);

  const originalTotal = parseFloat(order.totalAmount) || 10000;
  // Alternative suppliers: prefer those with matching products, else any active supplier
  const alternatives = suppliers
    .filter((s) => s.id !== order.supplierId && s.isActive)
    .map((s) => {
      const sps = supplierProducts.filter(
        (sp) => sp.supplierId === s.id && (productIds.length === 0 || productIds.includes(sp.productId))
      );
      let total = 0;
      if (sps.length > 0 && items.length > 0) {
        total = items.reduce((sum, item) => {
          const sp = sps.find((x) => x.productId === item.productId);
          const price = sp ? parseFloat(sp.price) : parseFloat(item.price);
          return sum + price * parseFloat(item.quantity || "0");
        }, 0);
      } else {
        // Fallback estimate: ±10% vs original based on reliability
        const rel = parseFloat(s.reliabilityScore) || 90;
        total = originalTotal * (1.12 - rel / 1000);
      }
      return {
        supplierId: s.id,
        supplierName: s.name,
        avgDeliveryDays: s.avgDeliveryDays,
        reliabilityScore: s.reliabilityScore,
        totalAmount: Math.round(total),
        deltaVsOriginal: Math.round(total - originalTotal),
        fasterByDays: parseFloat(failedSupplier?.avgDeliveryDays || "3") - parseFloat(s.avgDeliveryDays),
        score:
          parseFloat(s.reliabilityScore) * 0.5 +
          (5 - parseFloat(s.avgDeliveryDays)) * 10 +
          (total < originalTotal ? 15 : 0),
      };
    })
    .sort((a: any, b: any) => b.score - a.score) as any[];

  const best = alternatives[0] || null;
  return {
    order,
    failedSupplierName: failedSupplier?.name || "Поставщик",
    alternatives,
    best,
  };
}

export function switchOrderSupplier(orderId: number, newSupplierId: number) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  const alt = suppliers.find((s) => s.id === newSupplierId);
  if (!alt) return null;
  order.supplierId = newSupplierId;
  order.status = "confirmed";
  order.notes = `Переключено на ${alt.name} (план Б после срыва)`;
  order.expectedDeliveryDate = new Date(Date.now() + parseFloat(alt.avgDeliveryDays) * 86400000);
  order.updatedAt = new Date();
  return order;
}

export const mockStore = {
  // Products
  getProducts(businessId: number) {
    return getProductsLocated(businessId);
  },
  getProductById(id: number) {
    return products.find((p) => p.id === id) ?? null;
  },
  createProduct(data: Partial<MockProduct> & { businessId: number; name: string; category: string }) {
    const id = nextProductId++;
    const p: MockProduct = {
      id,
      businessId: data.businessId,
      name: data.name,
      category: data.category,
      unit: data.unit ?? "шт",
      currentStock: data.currentStock ?? "0",
      minStock: data.minStock ?? "10",
      maxStock: data.maxStock ?? "100",
      avgSalesPerDay: data.avgSalesPerDay ?? "0",
      costPrice: data.costPrice ?? "0",
      sellingPrice: data.sellingPrice ?? "0",
      preferredSupplierId: data.preferredSupplierId ?? null,
      autoOrderEnabled: data.autoOrderEnabled ?? true,
      status: "in_stock",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    refreshProductStatus(p);
    products.push(p);
    return { insertId: id };
  },
  updateProduct(id: number, data: Partial<MockProduct>) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p, data);
    if (data.currentStock !== undefined || data.minStock !== undefined) {
      refreshProductStatus(p);
    }
  },
  updateStock(id: number, newStock: number) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    p.currentStock = String(Math.max(0, newStock));
    refreshProductStatus(p);
  },
  deleteProduct(id: number) {
    const idx = products.findIndex((p) => p.id === id);
    if (idx >= 0) products.splice(idx, 1);
  },

  // Suppliers
  getSuppliers(businessId: number) {
    return suppliers.filter((s) => s.businessId === businessId).map((s) => ({ ...s }));
  },
  getSupplierById(id: number) {
    return suppliers.find((s) => s.id === id) ?? null;
  },
  createSupplier(data: Partial<MockSupplier> & { businessId: number; name: string; category: string }) {
    const id = nextSupplierId++;
    const s: MockSupplier = {
      id,
      businessId: data.businessId,
      name: data.name,
      category: data.category,
      contactPerson: data.contactPerson ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      avgDeliveryDays: data.avgDeliveryDays ?? "3",
      reliabilityScore: data.reliabilityScore ?? "85",
      lateDeliveryCount: data.lateDeliveryCount ?? 0,
      totalOrders: data.totalOrders ?? 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    suppliers.push(s);
    return { insertId: id };
  },
  updateSupplier(id: number, data: Partial<MockSupplier>) {
    const s = suppliers.find((x) => x.id === id);
    if (s) Object.assign(s, data, { updatedAt: new Date() });
  },
  deleteSupplier(id: number) {
    const idx = suppliers.findIndex((s) => s.id === id);
    if (idx >= 0) suppliers.splice(idx, 1);
  },

  // Supplier products / comparison
  getSupplierProductsForProduct(productId: number) {
    const spList = supplierProducts.filter((sp) => sp.productId === productId);
    const supplierIds = [...new Set(spList.map((sp) => sp.supplierId))];
    const supplierList = suppliers.filter((s) => supplierIds.includes(s.id) && s.isActive);
    return { supplierProducts: spList.map((s) => ({ ...s })), suppliers: supplierList.map((s) => ({ ...s })) };
  },
  getSupplierProductsBySupplier(supplierId: number) {
    return supplierProducts.filter((sp) => sp.supplierId === supplierId).map((s) => ({ ...s }));
  },

  // Orders
  getOrders(businessId: number) {
    return orders
      .filter((o) => o.businessId === businessId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((o) => ({ ...o }));
  },
  getOrderById(id: number) {
    return orders.find((o) => o.id === id) ?? null;
  },
  getOrderItems(orderId: number) {
    return orderItems.filter((i) => i.orderId === orderId).map((i) => ({ ...i }));
  },
  createOrder(data: {
    businessId: number;
    supplierId: number;
    totalAmount: string;
    expectedDeliveryDate?: Date | null;
    notes?: string | null;
    isAutoOrder?: boolean;
    createdBy?: number | null;
    items: Array<{ productId: number; quantity: string; price: string }>;
  }) {
    const id = nextOrderId++;
    const order: MockOrder = {
      id,
      businessId: data.businessId,
      supplierId: data.supplierId,
      status: "confirmed",
      totalAmount: data.totalAmount,
      expectedDeliveryDate: data.expectedDeliveryDate ?? daysFromNow(3),
      actualDeliveryDate: null,
      notes: data.notes ?? null,
      isAutoOrder: data.isAutoOrder ?? false,
      createdBy: data.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    orders.unshift(order);

    data.items.forEach((item) => {
      orderItems.push({
        id: nextOrderItemId++,
        orderId: id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        deliveredQty: "0",
        createdAt: new Date(),
      });
    });

    // Bump supplier stats
    const sup = suppliers.find((s) => s.id === data.supplierId);
    if (sup) sup.totalOrders += 1;

    return { orderId: id, insertId: id };
  },
  updateOrderStatus(id: number, status: MockOrder["status"]) {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    o.status = status;
    o.updatedAt = new Date();
    if (status === "delivered") {
      o.actualDeliveryDate = new Date();
      // Increase stock
      const items = orderItems.filter((i) => i.orderId === id);
      items.forEach((item) => {
        const p = products.find((pr) => pr.id === item.productId);
        if (p) {
          const qty = Number(item.quantity);
          p.currentStock = String(Number(p.currentStock) + qty);
          item.deliveredQty = item.quantity;
          refreshProductStatus(p);
        }
      });
    }
  },

  // Sales / forecast
  getSalesHistory(businessId: number, productId: number, days = 30) {
    const cutoff = daysAgo(days);
    return salesHistory
      .filter(
        (s) =>
          s.businessId === businessId &&
          s.productId === productId &&
          s.saleDate >= cutoff
      )
      .sort((a, b) => a.saleDate.getTime() - b.saleDate.getTime())
      .map((s) => ({ ...s }));
  },
  getForecast(businessId: number, productId: number) {
    const history = this.getSalesHistory(businessId, productId, 30);
    const product = this.getProductById(productId);
    if (!product) return null;

    const quantities = history.map((h) => Number(h.quantity));
    const avg =
      quantities.length > 0
        ? quantities.reduce((a, b) => a + b, 0) / quantities.length
        : Number(product.avgSalesPerDay);

    // Simple trend: last 7 vs previous 7
    const last7 = quantities.slice(-7);
    const prev7 = quantities.slice(-14, -7);
    const avgLast7 = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : avg;
    const avgPrev7 = prev7.length ? prev7.reduce((a, b) => a + b, 0) / prev7.length : avg;
    const trend = avgPrev7 > 0 ? (avgLast7 - avgPrev7) / avgPrev7 : 0;

    const forecastDays = 14;
    const forecast: Array<{ date: string; predicted: number }> = [];
    for (let i = 1; i <= forecastDays; i++) {
      const predicted = Math.max(0, Math.round(avgLast7 * (1 + trend * 0.3) * 10) / 10);
      forecast.push({
        date: daysFromNow(i).toISOString().slice(0, 10),
        predicted,
      });
    }

    const recommendedMinStock = Math.ceil(avgLast7 * 5); // ~5 days safety
    const currentMin = Number(product.minStock);
    let aiAdvice = "";
    if (trend > 0.15) {
      aiAdvice = `Спрос растёт (+${Math.round(trend * 100)}%). Рекомендуем поднять минимальный остаток с ${currentMin} до ${Math.max(currentMin, recommendedMinStock)}.`;
    } else if (trend < -0.15) {
      aiAdvice = `Спрос падает (${Math.round(trend * 100)}%). Можно снизить минимальный остаток до ${Math.max(5, Math.floor(currentMin * 0.7))}.`;
    } else {
      aiAdvice = `Спрос стабильный. Текущий минимальный остаток (${currentMin}) оптимален.`;
    }

    return {
      history: history.map((h) => ({
        date: h.saleDate.toISOString().slice(0, 10),
        quantity: Number(h.quantity),
      })),
      forecast,
      avgDaily: Math.round(avgLast7 * 10) / 10,
      trend: Math.round(trend * 1000) / 10, // percent
      recommendedMinStock,
      aiAdvice,
      currentStock: Number(product.currentStock),
      daysRemaining:
        avgLast7 > 0 ? Math.floor(Number(product.currentStock) / avgLast7) : 999,
    };
  },

  // Profile
  getBusinessProfile(userId: number) {
    if (businessProfile.userId === userId) return { ...businessProfile };
    return null;
  },
  upsertBusinessProfile(data: Partial<MockBusinessProfile> & { userId: number }) {
    Object.assign(businessProfile, data, { updatedAt: new Date() });
    return { ...businessProfile };
  },

  // Dashboard
  getDashboardMetrics(businessId: number) {
    const allProducts = this.getProducts(businessId);
    const allSuppliers = this.getSuppliers(businessId);
    const allOrders = this.getOrders(businessId);

    const totalProducts = allProducts.length;
    const lowStockCount = allProducts.filter((p) => p.status === "low_stock").length;
    const criticalCount = allProducts.filter(
      (p) => p.status === "critical" || p.status === "out_of_stock"
    ).length;
    const activeOrders = allOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length;
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered").length;

    const totalValue = allProducts.reduce(
      (sum, p) => sum + Number(p.currentStock) * Number(p.costPrice),
      0
    );

    const autoOrderSavings = allOrders
      .filter((o) => o.isAutoOrder)
      .reduce((sum, o) => sum + Number(o.totalAmount) * 0.12, 0);

    // Average delivery days from active suppliers
    const avgDelivery =
      allSuppliers.length > 0
        ? allSuppliers.reduce((s, x) => s + Number(x.avgDeliveryDays), 0) / allSuppliers.length
        : 0;

    // Missed / late deliveries
    const missedDeliveries = allSuppliers.reduce((s, x) => s + x.lateDeliveryCount, 0);

    return {
      totalProducts,
      lowStockCount,
      criticalCount,
      activeOrders,
      deliveredOrders,
      totalSuppliers: allSuppliers.length,
      totalInventoryValue: Math.round(totalValue),
      autoOrderSavings: Math.round(autoOrderSavings),
      avgDeliveryDays: Math.round(avgDelivery * 10) / 10,
      missedDeliveries,
    };
  },

  getAIRecommendations(businessId: number) {
    const allProducts = this.getProducts(businessId);
    const recommendations: any[] = [];

    for (const product of allProducts) {
      const stock = Number(product.currentStock);
      const minStock = Number(product.minStock);
      const avgSales = Number(product.avgSalesPerDay);
      const daysRemaining = avgSales > 0 ? Math.floor(stock / avgSales) : 999;

      if (stock <= 0) {
        recommendations.push({
          type: "urgent",
          productId: product.id,
          productName: product.name,
          message: `«${product.name}» закончился! Срочно создайте заказ.`,
          action: "create_order",
          recommendedQty: Math.ceil(avgSales * 7) || Number(product.minStock) * 2,
          priority: 1,
        });
      } else if (daysRemaining <= 2) {
        const recommendedQty = Math.ceil(avgSales * 7);
        recommendations.push({
          type: "warning",
          productId: product.id,
          productName: product.name,
          message: `«${product.name}» закончится через ${daysRemaining} дн. Рекомендуемый заказ: ${recommendedQty} ${product.unit}.`,
          action: "create_order",
          recommendedQty,
          priority: 2,
        });
      } else if (daysRemaining <= 5) {
        recommendations.push({
          type: "info",
          productId: product.id,
          productName: product.name,
          message: `«${product.name}» — запас на ${daysRemaining} дн. Планируйте заказ.`,
          action: "plan_order",
          priority: 3,
        });
      }
    }

    // Supplier reliability tip
    const badSuppliers = suppliers.filter(
      (s) => s.businessId === businessId && Number(s.reliabilityScore) < 85
    );
    badSuppliers.forEach((s) => {
      recommendations.push({
        type: "warning",
        productId: null,
        productName: s.name,
        message: `Поставщик «${s.name}» — надёжность ${s.reliabilityScore}%. Рассмотрите замену.`,
        action: "replace_supplier",
        priority: 3,
      });
    });

    recommendations.sort((a, b) => a.priority - b.priority);
    return recommendations.slice(0, 12);
  },

  // Simulate a sale (for demo scenario)
  simulateSale(productId: number, qty = 5) {
    const p = products.find((x) => x.id === productId);
    if (!p) return null;
    const newStock = Math.max(0, Number(p.currentStock) - qty);
    p.currentStock = String(newStock);
    refreshProductStatus(p);

    salesHistory.push({
      id: nextSaleId++,
      businessId: p.businessId,
      productId,
      saleDate: new Date(),
      quantity: String(qty),
      revenue: String(qty * Number(p.sellingPrice)),
      createdAt: new Date(),
    });

    return { ...p };
  },
};


// bind new helpers onto store
Object.assign(mockStore, {
  getLocations,
  getActiveLocationId,
  setActiveLocationId,
  getImpactMetrics,
  getExplainableForecast,
  simulateDeliveryFailure,
  switchOrderSupplier,
});

export default mockStore;

