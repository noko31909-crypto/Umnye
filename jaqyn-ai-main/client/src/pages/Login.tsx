import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        toast.error(t("fillAllFields"));
        setIsLoading(false);
        return;
      }

      const user = {
        id: Math.floor(Math.random() * 10000),
        email: loginEmail,
        name: loginEmail.split("@")[0],
        role: "user",
      };

      localStorage.setItem("jaqyn-user", JSON.stringify(user));
      localStorage.setItem("jaqyn-auth-token", "demo-token-" + Date.now());

      toast.success(t("loggedIn"));
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => {
        navigate("/dashboard");
      }, 150);
    } catch (error) {
      toast.error(t("loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
        toast.error(t("fillAllFields"));
        setIsLoading(false);
        return;
      }

      if (registerPassword !== registerConfirmPassword) {
        toast.error(t("passwordMismatch"));
        setIsLoading(false);
        return;
      }

      if (registerPassword.length < 6) {
        toast.error(t("passwordTooShort"));
        setIsLoading(false);
        return;
      }

      const user = {
        id: Math.floor(Math.random() * 10000),
        email: registerEmail,
        name: registerName,
        role: "user",
      };

      localStorage.setItem("jaqyn-user", JSON.stringify(user));
      localStorage.setItem("jaqyn-auth-token", "demo-token-" + Date.now());

      toast.success(t("accountCreated"));
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => {
        navigate("/dashboard");
      }, 150);
    } catch (error) {
      toast.error(t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Jaqyn AI</h1>
        </div>
        <p className="text-gray-600 text-lg">{t("welcomeToJaqyn")}</p>
      </div>

      {/* Login/Register Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
            <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? t("loading") : t("signIn")}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("name")}
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmPassword")}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? t("loading") : t("signUp")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">{t("demoInfo")}</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">{t("analytics")}</h3>
          <p className="text-sm text-gray-600">{t("conversionRate")}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-gray-900">{t("aiCopilot")}</h3>
          <p className="text-sm text-gray-600">{t("askQuestion")}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900">{t("customers")}</h3>
          <p className="text-sm text-gray-600">{t("customerHealth")}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold text-gray-900">{t("campaigns")}</h3>
          <p className="text-sm text-gray-600">{t("createCampaign")}</p>
        </div>
      </div>
    </div>
  );
}
