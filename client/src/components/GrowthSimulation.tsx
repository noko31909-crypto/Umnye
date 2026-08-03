import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowRight } from "lucide-react";

interface GrowthSimulationProps {
  campaignName: string;
  targetSegmentSize: number;
  onClose?: () => void;
}

export default function GrowthSimulation({
  campaignName,
  targetSegmentSize,
  onClose,
}: GrowthSimulationProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Simulate growth metrics
  const beforeNewCustomers = Math.floor(targetSegmentSize * 0.15);
  const afterNewCustomers = Math.floor(targetSegmentSize * 0.24);
  const growthPercentage = Math.round(((afterNewCustomers - beforeNewCustomers) / beforeNewCustomers) * 100);

  const beforeRevenue = beforeNewCustomers * 1500;
  const afterRevenue = afterNewCustomers * 1500;
  const revenueGrowth = Math.round(((afterRevenue - beforeRevenue) / beforeRevenue) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Симуляция роста: {campaignName}
          </CardTitle>
          <CardDescription>
            Прогноз влияния кампании на ваш бизнес
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {/* Before and After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-4">До запуска кампании</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Новые клиенты</p>
                  <p className="text-3xl font-bold text-gray-900">{beforeNewCustomers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Прогнозируемый доход</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₸{beforeRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className={`p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 transition-all duration-1000 ${
              isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
            }`}>
              <p className="text-sm font-medium text-green-700 mb-4">После запуска кампании (прогноз)</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-green-700 mb-1">Новые клиенты</p>
                  <p className="text-3xl font-bold text-green-900">{afterNewCustomers}</p>
                  <p className="text-sm text-green-700 font-semibold mt-1">
                    +{growthPercentage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Прогнозируемый доход</p>
                  <p className="text-2xl font-bold text-green-900">
                    ₸{afterRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700 font-semibold mt-1">
                    +₸{(afterRevenue - beforeRevenue).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-600 mb-2">Рост новых клиентов</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-blue-900">+{growthPercentage}%</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs text-purple-600 mb-2">Рост дохода</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-purple-900">+{revenueGrowth}%</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-900 mb-2">💡 Ключевые выводы</p>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Ожидается привлечение {afterNewCustomers - beforeNewCustomers} новых клиентов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Дополнительный доход: ₸{(afterRevenue - beforeRevenue).toLocaleString()}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Рекомендуется отслеживать метрики в течение 7-14 дней</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2"
            >
              Запустить кампанию
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
