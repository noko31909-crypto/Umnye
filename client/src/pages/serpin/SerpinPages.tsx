import PageWrapper from "./PageWrapper";
import SerpinDashboard from "./Dashboard";
import SerpinInventory from "./Inventory";
import SerpinAutoOrder from "./AutoOrder";
import SerpinSuppliers from "./Suppliers";
import SerpinSupplierComparison from "./SupplierComparison";
import SerpinDemandForecast from "./DemandForecast";
import SerpinOrders from "./Orders";
import SerpinAIRecommendations from "./AIRecommendations";
import SerpinBusinessProfile from "./BusinessProfile";
import SerpinAdminPanel from "./AdminPanel";

export function SerpinDashboardPage() {
  return <PageWrapper><SerpinDashboard /></PageWrapper>;
}

export function SerpinInventoryPage() {
  return <PageWrapper><SerpinInventory /></PageWrapper>;
}

export function SerpinAutoOrderPage() {
  return <PageWrapper><SerpinAutoOrder /></PageWrapper>;
}

export function SerpinSuppliersPage() {
  return <PageWrapper><SerpinSuppliers /></PageWrapper>;
}

export function SerpinSupplierComparisonPage() {
  return <PageWrapper><SerpinSupplierComparison /></PageWrapper>;
}

export function SerpinDemandForecastPage() {
  return <PageWrapper><SerpinDemandForecast /></PageWrapper>;
}

export function SerpinOrdersPage() {
  return <PageWrapper><SerpinOrders /></PageWrapper>;
}

export function SerpinAIRecommendationsPage() {
  return <PageWrapper><SerpinAIRecommendations /></PageWrapper>;
}

export function SerpinBusinessProfilePage() {
  return <PageWrapper><SerpinBusinessProfile /></PageWrapper>;
}

export function SerpinAdminPanelPage() {
  return <PageWrapper><SerpinAdminPanel /></PageWrapper>;
}
