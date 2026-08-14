import { useState, CSSProperties, useEffect } from "react";
import { useLocation } from "wouter";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useInventory } from "@/lib/inventory-api";
import { SupplyScoreChip } from "@/components/serpin/SupplyScore";
import { useIsMobile } from "@/hooks/useMobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Zap,
  Truck,
  BarChart3,
  ShoppingCart,
  Brain,
  Building2,
  Shield,
  PanelLeft,
  Sparkles,
  GitCompare,
} from "lucide-react";

interface SerpinLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/serpin", label: "Панель", icon: LayoutDashboard },
  { path: "/serpin/inventory", label: "Инвентарь", icon: Package },
  { path: "/serpin/auto-order", label: "Авто-заказ", icon: Zap },
  { path: "/serpin/suppliers", label: "Поставщики", icon: Truck },
  { path: "/serpin/comparison", label: "Сравнение", icon: GitCompare },
  { path: "/serpin/forecast", label: "Прогноз", icon: BarChart3 },
  { path: "/serpin/orders", label: "Заказы", icon: ShoppingCart },
  { path: "/serpin/recommendations", label: "AI Рекомендации", icon: Brain },
  { path: "/serpin/profile", label: "Профиль", icon: Building2 },
  { path: "/serpin/admin", label: "Админ", icon: Shield },
];

const SIDEBAR_WIDTH_KEY = "inventory-sidebar-width";
const DEFAULT_WIDTH = 240;

export default function SerpinLayout({ children }: SerpinLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <InventoryLayoutContent>{children}</InventoryLayoutContent>
    </SidebarProvider>
  );
}

function InventoryLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useSimpleAuth();
  const [location, navigate] = useLocation();
  const inv = useInventory();
  const locations = inv.locations.list();
  const activeLocId = inv.locations.activeId();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="h-16 justify-center border-b border-border/50">
          <div className="flex items-center gap-3 px-2 w-full">
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              aria-label="Toggle navigation"
            >
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            {!isCollapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-foreground tracking-tight block truncate text-sm">
                    Jaqyn AI
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Инвентарь
                  </span>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 py-2">
          <SidebarMenu className="px-2">
            {navItems.map((item) => {
              const isActive =
                location === item.path ||
                (item.path === "/serpin" && location === "/serpin/");
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                    className="h-10 transition-all font-normal"
                  >
                    <item.icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-muted-foreground"
                      }`}
                    />
                    <span className={isActive ? "text-blue-600 font-medium" : ""}>
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50 p-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {(user?.name || "D")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "Demo User"}
                </p>
                <p className="text-[10px] text-muted-foreground">Demo Mode</p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="h-14 border-b border-border/50 flex items-center gap-3 px-4 lg:px-6 bg-background/80 backdrop-blur sticky top-0 z-10">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          <SupplyScoreChip />
          <select
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background max-w-[200px] truncate"
            value={activeLocId}
            onChange={(e) => inv.locations.setActive(Number(e.target.value))}
            title="Точка сети"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
            Demo Mode
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs hidden sm:flex"
            onClick={() => navigate("/dashboard")}
          >
            ← Маркетинг
          </Button>
        </header>
        <main className="flex-1 bg-background">{children}</main>
      </SidebarInset>
    </>
  );
}
