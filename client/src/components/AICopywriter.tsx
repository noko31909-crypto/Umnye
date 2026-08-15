import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Zap, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tone = "Friendly" | "Professional" | "Urgent" | "Casual";

interface AICopywriterProps {
  goal?: string;
  segment?: string;
  businessName?: string;
  businessType?: string;
  onApply?: (message: string, tone: Tone) => void;
}

const TONE_CONFIG: Record<Tone, { emoji: string; desc: string }> = {
  Friendly: { emoji: "😊", desc: "Warm & approachable" },
  Professional: { emoji: "💼", desc: "Formal & trustworthy" },
  Urgent: { emoji: "⚡", desc: "High urgency & FOMO" },
  Casual: { emoji: "🎉", desc: "Relaxed & fun" },
};

const VARIABLES = ["First_Name", "Last_Name", "Favorite_Drink", "Promo_Code", "Discount"];

function getStrengthColor(s: number) {
  if (s >= 85) return "text-green-600";
  if (s >= 70) return "text-blue-600";
  if (s >= 50) return "text-amber-600";
  return "text-red-500";
}

function getStrengthLabel(s: number) {
  if (s >= 85) return "Excellent";
  if (s >= 70) return "Good";
  if (s >= 50) return "Fair";
  return "Needs Improvement";
}

export default function AICopywriter({
  goal = "Win back inactive customers",
  segment = "Inactive 14+ days",
  businessName = "Your Business",
  businessType = "coffee_shop",
  onApply,
}: AICopywriterProps) {
  const [tone, setTone] = useState<Tone>("Friendly");
  const [message, setMessage] = useState("Hi {First_Name}! ☕ We miss you. Come back for 20% off your favorite drink. Code: WELCOME20");
  const [offerStrength, setOfferStrength] = useState(85);
  const [tips, setTips] = useState<string[]>([
    "High urgency + weather trigger = 45% higher open rate",
    "Emoji increases engagement by 32%",
    "Personalization boosts conversion by 28%",
  ]);

  const copyMutation = trpc.ai.campaignCopy.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setOfferStrength(data.strength);
      setTips(data.tips);
      toast.success("Campaign copy generated with Jaqyn AI!");
    },
    onError: () => {
      // demo: keep UI usable without server LLM
    },
  });

  const handleGenerate = () => {
    copyMutation.mutate({ goal, segment, tone, businessName, businessType });
  };

  const handleInsertVariable = (variable: string) => {
    const el = document.getElementById("msg-input") as HTMLTextAreaElement;
    const pos = el?.selectionStart ?? message.length;
    setMessage(message.slice(0, pos) + `{${variable}}` + message.slice(pos));
  };

  const isGenerating = copyMutation.isPending;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Tone of Voice</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TONE_CONFIG) as Tone[]).map((t) => {
            const cfg = TONE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left",
                  tone === t ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <span className="text-lg">{cfg.emoji}</span>
                <div>
                  <p className={cn("text-sm font-semibold", tone === t ? "text-blue-700" : "text-gray-900")}>{t}</p>
                  <p className="text-xs text-gray-500">{cfg.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">Campaign Message</p>
          <span className={cn("text-xs font-medium", message.length > 160 ? "text-red-500" : "text-gray-500")}>
            {message.length}/160
          </span>
        </div>
        <Textarea
          id="msg-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your campaign message..."
          className="mb-3 font-mono text-sm resize-none"
          rows={4}
        />
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
          <div
            className={cn("h-1.5 rounded-full transition-all", message.length > 160 ? "bg-red-500" : message.length > 140 ? "bg-amber-500" : "bg-green-500")}
            style={{ width: `${Math.min(100, (message.length / 160) * 100)}%` }}
          />
        </div>
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">Insert Variables</p>
          <div className="flex gap-2 flex-wrap">
            {VARIABLES.map((v) => (
              <button key={v} onClick={() => handleInsertVariable(v)} className="px-2.5 py-1 text-xs bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-blue-700 font-medium transition-colors">
                {"{" + v + "}"}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Jaqyn AI is generating...</> : <><Sparkles className="w-4 h-4" />Generate with Jaqyn AI</>}
        </Button>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        {isGenerating ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-gray-900 text-sm">Offer Strength Score</span>
              </div>
              <div className={cn("text-2xl font-bold", getStrengthColor(offerStrength))}>{offerStrength}/100</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className={cn("h-2 rounded-full transition-all", offerStrength >= 85 ? "bg-green-500" : offerStrength >= 70 ? "bg-blue-500" : offerStrength >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${offerStrength}%` }} />
            </div>
            <p className={cn("text-sm font-semibold mb-3", getStrengthColor(offerStrength))}>{getStrengthLabel(offerStrength)}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-600">Jaqyn AI Tips:</p>
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Button onClick={() => { onApply?.(message, tone); toast.success("Campaign message applied!"); }} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Apply to Campaign
      </Button>
    </div>
  );
}
