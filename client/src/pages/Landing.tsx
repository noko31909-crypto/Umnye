import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowRight, Zap, Users, TrendingUp, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import JaqynLogo from "@/components/JaqynLogo";

export default function Landing() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const handleStartClick = () => {
    navigate("/login");
  };

  const handleCreatePromoClick = () => {
    navigate("/login");
  };

  const handleFindClientsClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-200/50 backdrop-blur-sm sticky top-0 z-40 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Jaqyn AI</h1>
          </div>
          <Button onClick={handleStartClick} variant="outline" className="gap-2">
            {t("signIn")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Автоматизация маркетинга для вашего бизнеса
              </h2>
              <p className="text-xl text-gray-600">
                Jaqyn AI — это платформа для автоматизации маркетинга, которая помогает малому офлайн-бизнесу привлекать и удерживать клиентов с помощью AI.
              </p>
            </div>

            {/* Value Propositions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <JaqynLogo size={18} className="text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Интеллектуальные рекомендации</p>
                  <p className="text-sm text-gray-600">AI анализирует ваш бизнес и предлагает оптимальные стратегии</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Быстрое внедрение</p>
                  <p className="text-sm text-gray-600">Начните использовать за минуты, без технических знаний</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Измеримые результаты</p>
                  <p className="text-sm text-gray-600">Отслеживайте рост продаж и удержание клиентов в реальном времени</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleStartClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 py-6 text-lg"
              >
                Начать
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleCreatePromoClick}
                variant="outline"
                className="py-6 text-lg"
              >
                Создать акцию
              </Button>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Средний рост</p>
                  <p className="text-2xl font-bold text-gray-900">+45%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Новые клиенты</p>
                  <p className="text-2xl font-bold text-gray-900">+120/месяц</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Автоматизированные кампании</p>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Small Offline Business Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Для малого офлайн-бизнеса
            </h3>
            <p className="text-xl text-gray-600">
              Идеально подходит для кофеен, магазинов, салонов и других локальных бизнесов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coffee Shop */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">☕</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Кофейня</h4>
              <p className="text-gray-600 mb-6">
                Привлекайте клиентов в тихие часы, создавайте программы лояльности и отслеживайте эффективность каждой кампании.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Программы лояльности
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> SMS и WhatsApp кампании
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Анализ посещаемости
                </li>
              </ul>
            </div>

            {/* Retail Store */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">🏪</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Магазин</h4>
              <p className="text-gray-600 mb-6">
                Управляйте инвентарем, создавайте персонализированные предложения и увеличивайте средний чек покупки.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Персональные предложения
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Управление скидками
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Аналитика продаж
                </li>
              </ul>
            </div>

            {/* Salon */}
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">💇</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Салон</h4>
              <p className="text-gray-600 mb-6">
                Напоминайте клиентам о записях, предлагайте новые услуги и строите долгосрочные отношения.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Напоминания о записях
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Кросс-продажи услуг
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span> Программы лояльности
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Мощные инструменты для вашего успеха
          </h3>
          <p className="text-xl text-gray-600">
            Всё что нужно для управления маркетингом в одной платформе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "📊", title: "Аналитика", desc: "Детальные отчёты о продажах и поведении клиентов" },
            { icon: "🤖", title: "AI Помощник", desc: "Интеллектуальные рекомендации для вашего бизнеса" },
            { icon: "💬", title: "Кампании", desc: "Создавайте и управляйте маркетинговыми кампаниями" },
            { icon: "🎁", title: "Лояльность", desc: "Программы вознаграждений для постоянных клиентов" },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h3 className="text-4xl font-bold mb-4">
            Готовы начать?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Присоединитесь к сотням бизнесов, которые уже используют Jaqyn AI для роста
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartClick}
              className="bg-white text-blue-600 hover:bg-gray-100 gap-2 py-6 text-lg"
            >
              Начать бесплатно
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleFindClientsClick}
              variant="outline"
              className="border-white text-white hover:bg-white/10 py-6 text-lg"
            >
              Найти клиентов
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✨</span>
              </div>
              <p className="text-gray-600">© 2024 Jaqyn AI. Все права защищены.</p>
            </div>
            <p className="text-gray-600 text-sm">Made with Manus</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
