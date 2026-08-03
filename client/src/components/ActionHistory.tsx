import { useDemoStore } from "@/store/demoStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";

export default function ActionHistory() {
  const demoStore = useDemoStore();
  const history = demoStore.actionHistory;

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            История действий
          </CardTitle>
          <CardDescription>
            Здесь будут отображаться все ваши действия
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            История действий пуста. Начните создавать кампании и подключать инструменты!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          История действий
        </CardTitle>
        <CardDescription>
          Последние {history.length} действий
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.action}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleString("ru-RU", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
