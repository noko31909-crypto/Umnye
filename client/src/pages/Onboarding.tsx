import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useDemoStore } from "@/store/demoStore";
import { ArrowRight, ArrowLeft } from "lucide-react";

type Step = "business-type" | "business-size" | "business-goal";

const BUSINESS_TYPES = [
  { id: "coffee_shop", label: "Кофейня", icon: "☕" },
  { id: "retail_store", label: "Магазин", icon: "🏪" },
  { id: "salon", label: "Салон", icon: "💇" },
  { id: "restaurant", label: "Ресторан", icon: "🍽️" },
  { id: "fitness", label: "Фитнес-центр", icon: "💪" },
  { id: "other", label: "Другое", icon: "🏢" },
];

const BUSINESS_SIZES = [
  { id: "solo", label: "Один человек", desc: "Фрилансер или индивидуальный предприниматель" },
  { id: "small", label: "Малый бизнес", desc: "2-10 сотрудников" },
  { id: "medium", label: "Средний бизнес", desc: "11-50 сотрудников" },
  { id: "large", label: "Крупный бизнес", desc: "50+ сотрудников" },
];

const BUSINESS_GOALS = [
  { id: "attract_customers", label: "Привлечь новых клиентов", icon: "📈" },
  { id: "retain_customers", label: "Вернуть старых клиентов", icon: "🔄" },
  { id: "increase_sales", label: "Увеличить продажи", icon: "💰" },
  { id: "build_loyalty", label: "Построить программу лояльности", icon: "🎁" },
  { id: "improve_analytics", label: "Улучшить аналитику", icon: "📊" },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const demoStore = useDemoStore();

  const [step, setStep] = useState<Step>("business-type");
  const [businessName, setBusinessName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === "business-type") {
      if (!selectedType) {
        toast.error("Выберите тип бизнеса");
        return;
      }
      setStep("business-size");
    } else if (step === "business-size") {
      if (!selectedSize) {
        toast.error("Выберите размер бизнеса");
        return;
      }
      setStep("business-goal");
    }
  };

  const handleBack = () => {
    if (step === "business-size") {
      setStep("business-type");
    } else if (step === "business-goal") {
      setStep("business-size");
    }
  };

  const handleComplete = async () => {
    if (!selectedGoal) {
      toast.error("Выберите цель");
      return;
    }

    setIsLoading(true);

    try {
      // Save onboarding data to store
      const businessTypeLabel = BUSINESS_TYPES.find(t => t.id === selectedType)?.label || selectedType;
      demoStore.setOnboarding(selectedType, selectedGoal);

      // Update business name if provided
      if (businessName) {
        demoStore.setBusinessName(businessName);
      }

      toast.success("Профиль создан успешно!");
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const progressSteps = [
    { id: "business-type", label: "Тип бизнеса" },
    { id: "business-size", label: "Размер" },
    { id: "business-goal", label: "Цель" },
  ];

  const currentStepIndex = progressSteps.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / progressSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Jaqyn AI</h1>
        </div>
        <p className="text-gray-600">Давайте настроим ваш профиль</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {progressSteps.map((s, idx) => (
            <div
              key={s.id}
              className={`text-xs font-medium ${
                idx <= currentStepIndex ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <Card className="w-full max-w-2xl">
        {/* Business Type Step */}
        {step === "business-type" && (
          <>
            <CardHeader>
              <CardTitle>Выберите тип вашего бизнеса</CardTitle>
              <CardDescription>
                Это поможет нам дать вам более точные рекомендации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedType === type.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                  </button>
                ))}
              </div>

              {/* Business Name Input */}
              <div className="mt-6 pt-6 border-t">
                <Label htmlFor="businessName" className="mb-2 block">
                  Название вашего бизнеса (опционально)
                </Label>
                <Input
                  id="businessName"
                  placeholder="Например: Мой кофейный магазин"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  className="gap-2"
                  disabled={!selectedType}
                >
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Business Size Step */}
        {step === "business-size" && (
          <>
            <CardHeader>
              <CardTitle>Размер вашего бизнеса</CardTitle>
              <CardDescription>
                Это поможет нам масштабировать решение под вас
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {BUSINESS_SIZES.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <Label htmlFor={size.id} className="cursor-pointer flex-1">
                      <p className="font-medium text-gray-900">{size.label}</p>
                      <p className="text-sm text-gray-600">{size.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2"
                  disabled={!selectedSize}
                >
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Business Goal Step */}
        {step === "business-goal" && (
          <>
            <CardHeader>
              <CardTitle>Какова ваша основная цель?</CardTitle>
              <CardDescription>
                Мы будем использовать это для персонализации рекомендаций
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BUSINESS_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedGoal === goal.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <p className="font-medium text-gray-900">{goal.label}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={handleComplete}
                  className="gap-2"
                  disabled={!selectedGoal || isLoading}
                >
                  {isLoading ? "Сохранение..." : "Завершить"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Footer */}
      <p className="text-center text-gray-600 text-sm mt-8">
        Вы всегда можете изменить эти настройки позже
      </p>
    </div>
  );
}
