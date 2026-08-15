import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useInventory } from "@/lib/inventory-api";
import { useLocation } from "wouter";

const BUSINESS_ID = 1;

const toneStyles = {
  good: {
    ring: "border-emerald-300 bg-emerald-50 text-emerald-900",
    bar: "bg-emerald-500",
    badge: "bg-emerald-600 text-white",
  },
  warn: {
    ring: "border-amber-300 bg-amber-50 text-amber-950",
    bar: "bg-amber-500",
    badge: "bg-amber-500 text-white",
  },
  bad: {
    ring: "border-red-300 bg-red-50 text-red-900",
    bar: "bg-red-500",
    badge: "bg-red-600 text-white",
  },
};

/** Compact chip for header — same look on every inventory screen */
export function SupplyScoreChip({ className }: { className?: string }) {
  const inv = useInventory();
  let health;
  try {
    health = inv.supplyHealth.get(BUSINESS_ID);
  } catch {
    health = {
      score: 70, grade: "B" as const, label: "Стабильное снабжение", tone: "good" as const,
      deltaVsCity: 8, cityAvg: 62,
      breakdown: { stockHealth: 70, deliveryReliability: 70, forecastAccuracy: 70, autoOrderCoverage: 70 },
      drags: [], narrative: "Supply Score временно в демо-режиме.",
    };
  }
  const t = toneStyles[health.tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm",
        t.ring,
        className
      )}
      title={health.narrative}
    >
      <Activity className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Supply Score</span>
      <span className="tabular-nums font-bold">{health.score}</span>
      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", t.badge)}>{health.grade}</span>
    </div>
  );
}

/** Full card for dashboard / profile / admin */
export function SupplyScoreCard({
  variant = "full",
  platformAvg,
}: {
  variant?: "full" | "compact" | "admin";
  platformAvg?: number;
}) {
  const inv = useInventory();
  const [, navigate] = useLocation();
  let health: any;
  try {
    health = inv.supplyHealth.get(BUSINESS_ID);
  } catch {
    health = {
      score: 70, grade: "B", label: "Стабильное снабжение", tone: "good",
      deltaVsCity: 8, cityAvg: 62,
      breakdown: { stockHealth: 70, deliveryReliability: 70, forecastAccuracy: 70, autoOrderCoverage: 70 },
      drags: [], narrative: "Supply Score временно в демо-режиме.",
    };
  }
  const t = toneStyles[health.tone];

  if (variant === "admin") {
    const avg = platformAvg ?? 68;
    return (
      <div className={cn("rounded-xl border p-4", t.ring)}>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Масштаб платформы</p>
        <p className="text-2xl font-bold tabular-nums mt-1">Supply Score · {avg}</p>
        <p className="text-xs mt-1 opacity-80">
          Средний индекс по всем бизнесам на Jaqyn. Мы видим здоровье снабжения сети целиком.
        </p>
        <div className="mt-3 h-2 rounded-full bg-black/5 overflow-hidden">
          <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${avg}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border p-4 md:p-5", t.ring)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 flex items-center gap-1">
            <Activity className="h-3 w-3" /> Supply Health Score
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold tabular-nums">{health.score}</span>
            <span className={cn("rounded-md px-2 py-0.5 text-sm font-bold", t.badge)}>{health.grade}</span>
            <span className="text-sm opacity-80">{health.label}</span>
          </div>
          <p className="text-sm mt-2 max-w-xl opacity-90">{health.narrative}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 min-w-[200px] text-xs">
          {(
            [
              ["Остатки", health.breakdown.stockHealth],
              ["Поставки", health.breakdown.deliveryReliability],
              ["Прогноз", health.breakdown.forecastAccuracy],
              ["Автозаказ", health.breakdown.autoOrderCoverage],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/70 border border-black/5 px-2 py-1.5">
              <p className="opacity-60">{k}</p>
              <p className="font-bold tabular-nums text-sm">{v}</p>
            </div>
          ))}
        </div>
      </div>
      {variant === "full" && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Что тянет индекс</p>
          {health.drags.map((d) => (
            <button
              key={d.title}
              type="button"
              onClick={() => navigate(d.href)}
              className="w-full text-left rounded-lg bg-white/80 border border-black/5 px-3 py-2 hover:bg-white transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{d.title}</span>
                {d.points > 0 && (
                  <Badge variant="outline" className="text-[10px] shrink-0">−{d.points} пт</Badge>
                )}
              </div>
              <p className="text-xs opacity-70 mt-0.5">{d.detail}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
