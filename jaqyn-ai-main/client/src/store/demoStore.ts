import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  lastVisit: Date;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  status: 'new' | 'regular' | 'at_risk' | 'vip' | 'inactive';
}

export interface Campaign {
  id: number;
  name: string;
  targetSegment: string;
  sentCount: number;
  returnedCount: number;
  generatedRevenue: number;
  cost: number;
  roi: number;
  createdAt: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
}

export interface DailySales {
  date: string;
  revenue: number;
  transactionCount: number;
  averageTicket: number;
  hourlyTraffic: { hour: number; visits: number }[];
}

export interface Integration {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
  type: string;
}

export interface DemoStore {
  businessName: string;
  businessType: string;
  businessGoal: string;
  onboardingComplete: boolean;
  customers: Customer[];
  dailySales: DailySales[];
  campaigns: Campaign[];
  activeCampaignCount: number;
  integrations: Integration[];
  setOnboarding: (businessType: string, goal: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCustomerStatus: (customerId: number, status: Customer['status']) => void;
  toggleIntegration: (integrationId: number) => void;
  resetDemoData: () => void;
  getCustomersBySegment: (segment: Customer['status']) => Customer[];
  getTotalRevenue: () => number;
  getActiveCampaigns: () => Campaign[];
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Alikhan Nurmukhambetov', phone: '+7 777 123 4501', lastVisit: new Date(Date.now() - 2 * 86400000), totalVisits: 24, totalSpent: 68400, loyaltyPoints: 6840, status: 'vip' },
  { id: 2, name: 'Dana Kenzhebekova', phone: '+7 777 234 5602', lastVisit: new Date(Date.now() - 5 * 86400000), totalVisits: 18, totalSpent: 54300, loyaltyPoints: 5430, status: 'vip' },
  { id: 3, name: 'Yernar Suleimenov', phone: '+7 777 345 6703', lastVisit: new Date(Date.now() - 35 * 86400000), totalVisits: 8, totalSpent: 24000, loyaltyPoints: 2400, status: 'at_risk' },
  { id: 4, name: 'Gulsara Orazova', phone: '+7 777 456 7804', lastVisit: new Date(Date.now() - 1 * 86400000), totalVisits: 31, totalSpent: 93200, loyaltyPoints: 9320, status: 'vip' },
  { id: 5, name: 'Kanat Zhakupov', phone: '+7 777 567 8905', lastVisit: new Date(Date.now() - 42 * 86400000), totalVisits: 5, totalSpent: 15000, loyaltyPoints: 1500, status: 'inactive' },
  { id: 6, name: 'Aigerim Tokayeva', phone: '+7 777 678 9006', lastVisit: new Date(Date.now() - 3 * 86400000), totalVisits: 12, totalSpent: 36000, loyaltyPoints: 3600, status: 'regular' },
  { id: 7, name: 'Timur Bekbayev', phone: '+7 777 789 0107', lastVisit: new Date(Date.now() - 20 * 86400000), totalVisits: 6, totalSpent: 18000, loyaltyPoints: 1800, status: 'at_risk' },
  { id: 8, name: 'Raushan Ismailova', phone: '+7 777 890 1208', lastVisit: new Date(Date.now() - 1 * 86400000), totalVisits: 44, totalSpent: 132000, loyaltyPoints: 13200, status: 'vip' },
  { id: 9, name: 'Dias Askarov', phone: '+7 777 901 2309', lastVisit: new Date(Date.now() - 16 * 86400000), totalVisits: 9, totalSpent: 27000, loyaltyPoints: 2700, status: 'at_risk' },
  { id: 10, name: 'Nazira Berdiyeva', phone: '+7 777 012 3410', lastVisit: new Date(Date.now() - 0 * 86400000), totalVisits: 2, totalSpent: 6000, loyaltyPoints: 600, status: 'new' },
];

// Generate 40 more realistic Kazakhstani customers
const kazakhNames = ['Almaz', 'Bekzat', 'Chingis', 'Daulet', 'Erlan', 'Farid', 'Gani', 'Hamid', 'Ilyas', 'Jaxon'];
const kazakhSurnames = ['Akhmetov', 'Baimukhanov', 'Chingisov', 'Dauletov', 'Erlanov', 'Faridov', 'Ganiov', 'Hamidov', 'Ilyasov', 'Jaxonov'];

for (let i = 0; i < 40; i++) {
  const firstName = kazakhNames[i % 10];
  const lastName = kazakhSurnames[Math.floor(i / 10)];
  INITIAL_CUSTOMERS.push({
    id: 11 + i,
    name: `${firstName} ${lastName}`,
    phone: `+7 777 ${String(111 + i).padStart(3, '0')} ${String(1100 + i * 10).padStart(4, '0')}`,
    lastVisit: new Date(Date.now() - Math.random() * 45 * 86400000),
    totalVisits: Math.floor(Math.random() * 40) + 1,
    totalSpent: Math.floor(Math.random() * 150000) + 5000,
    loyaltyPoints: Math.floor(Math.random() * 15000) + 500,
    status: ['new', 'regular', 'at_risk', 'vip', 'inactive'][Math.floor(Math.random() * 5)] as Customer['status'],
  });
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 1, name: 'Coffee Comeback', targetSegment: 'inactive_14days', sentCount: 47, returnedCount: 11, generatedRevenue: 31400, cost: 2000, roi: 15.7, createdAt: new Date(Date.now() - 10 * 86400000), status: 'completed' },
  { id: 2, name: 'Rainy Day Latte', targetSegment: 'all', sentCount: 156, returnedCount: 52, generatedRevenue: 78600, cost: 3000, roi: 26.2, createdAt: new Date(Date.now() - 20 * 86400000), status: 'completed' },
  { id: 3, name: 'Birthday Specials', targetSegment: 'vip', sentCount: 23, returnedCount: 9, generatedRevenue: 18900, cost: 1000, roi: 18.9, createdAt: new Date(Date.now() - 5 * 86400000), status: 'sent' },
  { id: 4, name: 'Weekend Promo', targetSegment: 'regular', sentCount: 89, returnedCount: 28, generatedRevenue: 42300, cost: 1500, roi: 28.2, createdAt: new Date(Date.now() - 3 * 86400000), status: 'sent' },
  { id: 5, name: 'Loyalty Rewards', targetSegment: 'vip', sentCount: 18, returnedCount: 7, generatedRevenue: 14200, cost: 800, roi: 17.75, createdAt: new Date(Date.now() - 15 * 86400000), status: 'completed' },
];

const INITIAL_DAILY_SALES: DailySales[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  return {
    date: date.toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 40000) + 20000,
    transactionCount: Math.floor(Math.random() * 80) + 30,
    averageTicket: Math.floor(Math.random() * 2000) + 1000,
    hourlyTraffic: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      visits: h >= 9 && h <= 11 ? Math.floor(Math.random() * 20) + 15 : h >= 14 && h <= 16 ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 12) + 3,
    })),
  };
});

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 1, name: 'iiko POS', category: 'POS', isActive: true, type: 'pos_system' },
  { id: 2, name: 'Poster', category: 'POS', isActive: false, type: 'pos_system' },
  { id: 3, name: 'WhatsApp Business', category: 'Messaging', isActive: true, type: 'whatsapp' },
  { id: 4, name: 'Twilio SMS', category: 'SMS Gateway', isActive: true, type: 'sms_gateway' },
  { id: 5, name: 'Loyalty Program', category: 'Loyalty', isActive: true, type: 'loyalty' },
  { id: 6, name: 'Google Analytics', category: 'Analytics', isActive: false, type: 'analytics' },
  { id: 7, name: 'Telegram Bot', category: 'Messaging', isActive: false, type: 'telegram' },
  { id: 8, name: 'Email Marketing', category: 'Email', isActive: false, type: 'email' },
];

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      businessName: 'TAMYR Coffee',
      businessType: 'coffee_shop',
      businessGoal: 'Increase customer retention and boost quiet hour traffic',
      onboardingComplete: true,
      customers: INITIAL_CUSTOMERS,
      dailySales: INITIAL_DAILY_SALES,
      campaigns: INITIAL_CAMPAIGNS,
      activeCampaignCount: 2,
      integrations: INITIAL_INTEGRATIONS,

      setOnboarding: (businessType, goal) =>
        set({ businessType, businessGoal: goal, onboardingComplete: true }),

      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
          activeCampaignCount: state.activeCampaignCount + 1,
        })),

      updateCustomerStatus: (customerId, status) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, status, lastVisit: new Date() } : c
          ),
        })),

      toggleIntegration: (integrationId) =>
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === integrationId ? { ...i, isActive: !i.isActive } : i
          ),
        })),

      resetDemoData: () =>
        set({
          customers: INITIAL_CUSTOMERS,
          dailySales: INITIAL_DAILY_SALES,
          campaigns: INITIAL_CAMPAIGNS,
          activeCampaignCount: 2,
          integrations: INITIAL_INTEGRATIONS,
        }),

      getCustomersBySegment: (segment) =>
        get().customers.filter((c) => c.status === segment),

      getTotalRevenue: () =>
        get().dailySales.reduce((sum, day) => sum + day.revenue, 0),

      getActiveCampaigns: () =>
        get().campaigns.filter((c) => c.status === 'sent' || c.status === 'scheduled'),
    }),
    {
      name: 'jaqyn-demo-store',
      version: 1,
    }
  )
);
