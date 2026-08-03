import { useDemoStore } from "@/store/demoStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const TOOL_ICONS: Record<string, string> = {
  iiko: "🍽️",
  poster: "📱",
  whatsapp: "💬",
  sms_gateway: "📞",
  loyalty: "🎁",
  analytics: "📊",
  telegram: "✈️",
  email: "📧",
};

export default function ActiveTools() {
  const demoStore = useDemoStore();
  const activeTools = demoStore.getActiveTools();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Активные инструменты
        </CardTitle>
        <CardDescription>
          {activeTools.length} из {demoStore.integrations.length} инструментов подключено
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeTools.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            Нет активных инструментов. Перейдите в раздел "Инструменты" для подключения.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeTools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-2">
                  {TOOL_ICONS[tool.type] || "🔧"}
                </div>
                <p className="text-xs font-medium text-center text-gray-900">
                  {tool.name}
                </p>
                <Badge className="mt-2 bg-green-600 text-white text-xs">
                  ✓ Активно
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
