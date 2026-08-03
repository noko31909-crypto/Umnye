import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CampaignStudio from "./pages/CampaignStudio";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Tools from "./pages/Tools";
import BusinessProfile from "./pages/BusinessProfile";
import Settings from "./pages/Settings";
import AdminUI from "./pages/AdminUI";
import AICopilotPanel from "./components/AICopilotPanel";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useSimpleAuth();
  
  // Also check localStorage directly as a fallback
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('jaqyn-user') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('jaqyn-auth-token') : null;
  const isAuthenticated = !!user || (!!storedUser && !!token);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/landing"} component={Landing} />
      <Route path={"/login"} component={Login} />
      <Route path={"/onboarding"} component={() => <ProtectedRoute component={Onboarding} />} />
      <Route path={"/"} component={Landing} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/campaigns"} component={() => <ProtectedRoute component={CampaignStudio} />} />
      <Route path={"/customers"} component={() => <ProtectedRoute component={Customers} />} />
      <Route path={"/analytics"} component={() => <ProtectedRoute component={Analytics} />} />
      <Route path={"/tools"} component={() => <ProtectedRoute component={Tools} />} />
      <Route path={"/settings/profile"} component={() => <ProtectedRoute component={BusinessProfile} />} />
      <Route path={"/settings"} component={() => <ProtectedRoute component={Settings} />} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminUI} />} />
      <Route path={"/home"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            {/* Global AI Copilot Panel — accessible from every route */}
            <AICopilotPanel />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
