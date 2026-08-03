import { useLocation } from "wouter";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDemoStore } from "@/store/demoStore";
import { toast } from "sonner";
import { LogOut, RotateCcw, User, Bell, Lock } from "lucide-react";

export default function Settings() {
  const { user, logout } = useSimpleAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const demoStore = useDemoStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success(t("loggedIn"));
    } catch (error) {
      toast.error(t("error"));
    }
  };

  const handleResetDemo = () => {
    demoStore.resetDemoData();
    toast.success(t("success"));
  };

  if (!user) {
    return <DashboardLayout><div /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("settings")}</h1>
          <p className="text-muted-foreground mt-1">{t("accountSettings")}</p>
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("profile")}
            </CardTitle>
            <CardDescription>{t("accountSettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t("signIn")}</p>
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">ID</p>
              <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
            </div>

            <Separator />

            <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              {t("signOut")}
            </Button>
          </CardContent>
        </Card>

        {/* Demo Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("resetDemoData")}
            </CardTitle>
            <CardDescription>{t("resetConfirm")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                You're currently viewing demo data for <span className="font-semibold">TAMYR Coffee</span>. All data is stored locally in your browser and will reset when you clear your cache.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Current Demo Status</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Customers</p>
                  <p className="font-semibold">50</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Campaigns</p>
                  <p className="font-semibold">5</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Integrations</p>
                  <p className="font-semibold">8</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Days of Data</p>
                  <p className="font-semibold">30</p>
                </div>
              </div>
            </div>

            <Button onClick={handleResetDemo} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("resetDemoData")}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Notification preferences will be available in a future update.</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </CardTitle>
            <CardDescription>Security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                ✓ Your account is secured with email authentication. All data is stored locally in your browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
