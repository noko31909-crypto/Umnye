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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onError: () => {
      toast.error("Jaqyn AI encountered an error. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? { ...m, content: "I encountered an error. Please try again.", isLoading: false }
            : m
        )
      );
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || chatMutation.isPending) return;

      const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content };
      const loadingMsg: Message = { id: `loading-${Date.now()}`, role: "assistant", content: "", isLoading: true };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");

      const history = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      history.push({ role: "user", content });

      try {
        const result = await chatMutation.mutateAsync({ messages: history, businessContext });
        setMessages((prev) =>
          prev.map((m) => (m.isLoading ? { ...m, content: result.content, isLoading: false } : m))
        );
      } catch {
        // handled by onError
      }
    },
    [messages, chatMutation, businessContext]
  );

  const handleSend = () => { if (input.trim()) sendMessage(input.trim()); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([{ id: "welcome-reset", role: "assistant", content: "Hi! I'm **Jaqyn AI**, your AI Growth Copilot. How can I help you today?" }]);
  };

  const hasConversation = messages.length > 1;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Open Jaqyn AI"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold">Jaqyn AI</span>
        </button>
      )}

      {isOpen && (
        <div className={cn("fixed bottom-6 right-6 z-50 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300", isMinimized ? "h-16" : "h-[600px]")}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
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
                        disabled={chatMutation.isPending}
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
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isPending}
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
