import { useState } from "react";
import { useLocation } from "wouter";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, Package, Zap, Truck,
  BarChart3, ShoppingCart, Brain, Building2,
  Shield, Menu, X, ChevronRight
} from "lucide-react";

interface SerpinLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/serpin", label: "Панель управления", icon: LayoutDashboard },
  { path: "/serpin/inventory", label: "Инвентарь", icon: Package },
  { path: "/serpin/auto-order", label: "Авто-заказ", icon: Zap },
  { path: "/serpin/suppliers", label: "Поставщики", icon: Truck },
  { path: "/serpin/comparison", label: "Сравнение", icon: BarChart3 },
  { path: "/serpin/forecast", label: "Прогноз спроса", icon: BarChart3 },
  { path: "/serpin/orders", label: "Заказы", icon: ShoppingCart },
  { path: "/serpin/recommendations", label: "AI Рекомендации", icon: Brain },
  { path: "/serpin/profile", label: "Бизнес-профиль", icon: Building2 },
  { path: "/serpin/admin", label: "Админ-панель", icon: Shield },
];

export default function SerpinLayout({ children }: SerpinLayoutProps) {
  const [location, navigate] = useLocation();
  const { user } = useSimpleAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">SERPIN</h1>
            <p className="text-xs text-gray-400">AI Inventory</p>
          </div>
          <Button
            variant="ghost" size="icon" className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map(item => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-purple-400" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-6">
          <Button
            variant="ghost" size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1" />

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name || "Demo User"}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                {(user?.name || "D")[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
