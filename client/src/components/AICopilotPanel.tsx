import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, X, Loader2, RotateCcw, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

const QUICK_ACTIONS = [
  {
    label: "Analyze Quiet Hours",
    icon: "⏰",
    prompt:
      "Analyze my business quiet hours and suggest the best campaign strategy to boost traffic during slow periods. Include specific timing and offer recommendations.",
  },
  {
    label: "Generate Offer",
    icon: "🎁",
    prompt:
      "Generate a compelling promotional offer for my inactive customer segment. Include the offer details, recommended channel, timing, and expected conversion rate.",
  },
  {
    label: "Predict Traffic",
    icon: "📈",
    prompt:
      "Predict today's foot traffic based on typical patterns and suggest how to maximize revenue during peak and off-peak hours.",
  },
  {
    label: "Customer Health",
    icon: "❤️",
    prompt:
      "Analyze my customer health metrics. Identify at-risk customers, VIP segments, and recommend specific retention strategies with expected impact.",
  },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
      <span className="text-xs text-gray-400 ml-1 italic">Jaqyn AI is analyzing...</span>
    </div>
  );
}

interface AICopilotPanelProps {
  businessContext?: {
    businessName?: string;
    businessType?: string;
    activeCustomers?: number;
    atRiskCustomers?: number;
    weeklyRevenue?: number;
  };
}


/** Demo AI replies when server LLM is unavailable (Vercel serverless / missing keys). */
function buildDemoReply(userText: string, ctx?: AICopilotPanelProps["businessContext"]): string {
  const t = userText.toLowerCase();
  const biz = ctx?.businessName || "вашего бизнеса";
  const type = ctx?.businessType || "локальный бизнес";

  if (/quiet|тихие|slow|слабые|off.?peak|непроходимые/i.test(t)) {
    return `**Анализ тихих часов для ${biz}**\n\n1. **10:00–12:00 и 15:00–17:00** обычно самые спокойные.\n2. Предложите **«счастливые часы»**: −15% на напитки / комбо в эти окна.\n3. Канал: SMS + WhatsApp за 1 час до слота.\n4. Ожидаемый эффект: +12–18% трафика в тихие часы.\n\n_Демо-режим: ответы на основе шаблонов Jaqyn AI (серверный LLM сейчас недоступен)._`;
  }
  if (/offer|акци|промо|скид|generate|сгенерир/i.test(t)) {
    return `**Промо-предложение**\n\n🎁 **«Вернись за бонусом»** для неактивных клиентов (14+ дней без визита).\n- Оффер: −20% на следующий заказ + бесплатный апселл.\n- Канал: WhatsApp / SMS.\n- Время: будни 11:00–13:00.\n- Ожидаемая конверсия: 8–12%.\n\n_Демо-режим Jaqyn AI._`;
  }
  if (/traffic|трафик|predict|прогноз|посещаем/i.test(t)) {
    return `**Прогноз трафика на сегодня**\n\n- Пик: **12:00–14:00** и **18:00–20:00**\n- Спад: **15:00–17:00**\n- Рекомендация: усилить смену в пик, в спад — push «комбо дня».\n\n_Демо-режим Jaqyn AI._`;
  }
  if (/customer|клиент|health|удержан|retention|at.?risk/i.test(t)) {
    return `**Здоровье клиентской базы**\n\n- VIP: удерживайте персональными офферами.\n- At-risk (нет визитов 14–30 дней): реактивация SMS + −15%.\n- Новые: программа лояльности после 2-го визита.\n\n_Демо-режим Jaqyn AI._`;
  }
  if (/stock|запас|инвентар|order|заказ|supplier|поставщик|milk|молок/i.test(t)) {
    return `**Инвентарь / автозаказ**\n\n1. Откройте **Инвентарь** → проверьте критические позиции.\n2. Нажмите **Симулировать продажу (Молоко)** на панели запасов — AI обновит риск дефицита.\n3. **Авто-заказ** → выберите товары → подтвердите → статус в **Заказах**.\n4. **Сравнение поставщиков** поможет выбрать цену и срок доставки.\n\n_Демо-режим: модуль запасов работает локально._`;
  }
  return `Я **Jaqyn AI** (демо-режим) для **${type}** «${biz}».\n\nМогу помочь с:\n- тихими часами и кампаниями\n- промо-офферами\n- прогнозом трафика\n- здоровьем клиентов\n- инвентарём и автозаказом\n\nНапишите, что нужно — или выберите быстрое действие выше.\n\n_Серверный LLM сейчас недоступен на хостинге; ответы генерируются локально для демо._`;
}


export default function AICopilotPanel({ businessContext }: AICopilotPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm **Jaqyn AI**, your AI Growth Copilot. I can help you analyze your business, generate campaigns, predict customer behavior, and grow your revenue.\n\nWhat would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState("");
  // Vertical position: offset from bottom (px), draggable up/down
  const [panelBottom, setPanelBottom] = useState(() => {
    if (typeof window === "undefined") return 24;
    const saved = localStorage.getItem("jaqyn-ai-panel-bottom");
    return saved ? Math.max(8, Math.min(Number(saved) || 24, window.innerHeight - 120)) : 24;
  });
  const [panelRight, setPanelRight] = useState(() => {
    if (typeof window === "undefined") return 24;
    const saved = localStorage.getItem("jaqyn-ai-panel-right");
    return saved ? Math.max(8, Number(saved) || 24) : 24;
  });
  const dragRef = useRef<{ startY: number; startBottom: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    // Errors are handled in sendMessage with a local demo fallback
    onError: () => {},
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return;
      setIsSending(true);

      const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content };
      const loadingMsg: Message = { id: `loading-${Date.now()}`, role: "assistant", content: "", isLoading: true };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");

      const history = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      history.push({ role: "user", content });

      const finish = (text: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.isLoading ? { ...m, content: text, isLoading: false } : m))
        );
        setIsSending(false);
      };

      try {
        // Race: server vs 1.2s timeout → always answer (demo on stage)
        const result = await Promise.race([
          chatMutation.mutateAsync({ messages: history, businessContext }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
        ]);
        if (result && (result as any).content) {
          finish((result as any).content);
        } else {
          await new Promise((r) => setTimeout(r, 400));
          finish(buildDemoReply(content, businessContext));
        }
      } catch {
        await new Promise((r) => setTimeout(r, 400));
        finish(buildDemoReply(content, businessContext));
      }
    },
    [messages, chatMutation, businessContext, isSending]
  );

  const handleSend = () => { if (input.trim()) sendMessage(input.trim()); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([{ id: "welcome-reset", role: "assistant", content: "Hi! I'm **Jaqyn AI**, your AI Growth Copilot. How can I help you today?" }]);
  };


  const onDragStart = (e: React.PointerEvent) => {
    // Don't start drag from action buttons
    const t = e.target as HTMLElement;
    if (t.closest("button") && !t.closest("[data-drag-handle]")) return;
    e.preventDefault();
    const startY = e.clientY;
    const startX = e.clientX;
    const startBottom = panelBottom;
    const startRight = panelRight;
    dragRef.current = { startY, startBottom };

    let lastBottom = startBottom;
    let lastRight = startRight;
    const onMove = (ev: PointerEvent) => {
      const dy = startY - ev.clientY;
      const dx = startX - ev.clientX;
      lastBottom = Math.max(8, Math.min(window.innerHeight - 80, startBottom + dy));
      lastRight = Math.max(8, Math.min(window.innerWidth - 80, startRight + dx));
      setPanelBottom(lastBottom);
      setPanelRight(lastRight);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      try {
        localStorage.setItem("jaqyn-ai-panel-bottom", String(lastBottom));
        localStorage.setItem("jaqyn-ai-panel-right", String(lastRight));
      } catch {}
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const onDragMove = (_e: React.PointerEvent) => {};
  const onDragEnd = () => {};

  const hasConversation = messages.length > 1;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ bottom: panelBottom, right: panelRight }}
          className="fixed z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Open Jaqyn AI"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold">Jaqyn AI</span>
        </button>
      )}

      {isOpen && (
        <div style={{ bottom: panelBottom, right: panelRight, maxHeight: "min(600px, calc(100vh - 24px))" }}
          className={cn("fixed z-50 w-[min(400px,calc(100vw-24px))] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300", isMinimized ? "h-16" : "h-[min(600px,calc(100vh-48px))]")}>
          <div
            data-drag-handle
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={onDragStart}
            title="Перетащите панель"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">Jaqyn AI</h3>
                <p className="text-xs text-blue-200 mt-0.5">AI Growth Copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasConversation && (
                <button onClick={handleReset} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors" title="New conversation">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                <ChevronDown className={cn("w-4 h-4 transition-transform", isMinimized && "rotate-180")} />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 bg-gray-50">
                <div className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm", msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm")}>
                        {msg.isLoading ? (
                          <TypingDots />
                        ) : msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {!hasConversation && (
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.prompt)}
                        disabled={isSending}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all text-left disabled:opacity-50"
                      >
                        <span className="text-base">{action.icon}</span>
                        <span className="text-xs font-medium text-blue-800 leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 p-3 bg-white shrink-0">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Jaqyn AI anything..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm border-gray-200 focus:border-blue-300 rounded-xl"
                    rows={1}
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                  >
                    {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 text-center">Powered by Jaqyn AI · Press Enter to send</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
