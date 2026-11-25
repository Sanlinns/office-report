"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKyat } from "@/lib/format-kyat";
import { RefreshCcw } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type OutcomeRow = {
  id?: number;
  amount?: number | string;
  date?: string;
  createdAt?: string;

  shop?: string;
  shop_name?: string;
  shopName?: string;
  supplier?: string;
  vendor?: string;
};

const salesRanges = [7, 15, 30] as const;
type SalesRange = (typeof salesRanges)[number];
type SalesPoint = { id: string; name: string; values: Record<SalesRange, number> };
type PiePoint = { name: string; value: number; id?: string };

function getShopName(r: OutcomeRow) {
  return (
    r.shop ??
    r.shop_name ??
    r.shopName ??
    r.supplier ??
    r.vendor ??
    "Unknown"
  );
}

function toNumber(v: unknown) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function sumOutcomeByShop(rows: OutcomeRow[]): PiePoint[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const shop = String(getShopName(r)).trim() || "Unknown";
    map.set(shop, (map.get(shop) ?? 0) + toNumber(r.amount));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const PIE_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

function CustomTooltip({ active, payload, salesMode, budgetMode }: { active?: boolean; payload?: readonly { name?: string; value?: unknown }[]; salesMode: boolean; budgetMode: boolean }) {
  if (!active || !payload?.length) return null;

  const p = payload[0];
  const name = p?.name ?? "";
  const value = Number(p?.value ?? 0);

  return (
    <div className="z-[9999] rounded-2xl border border-border/60 bg-background/95 px-3 py-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="text-[11px] text-muted-foreground">{budgetMode ? "ရန်ပုံငွေ" : salesMode ? "ကုန်ပစ္စည်း" : "Shop"}</div>
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{budgetMode ? "ငွေပမာဏ" : salesMode ? "ရောင်းရငွေ" : "Outcome"}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {salesMode || budgetMode ? formatKyat(value) : value.toLocaleString()}
      </div>
    </div>
  );
}

function niceCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

export default function PieChartBox({ sales, budget }: { sales?: SalesPoint[]; budget?: { funds: number; spent: number } | null }) {
  const [range, setRange] = useState<SalesRange>(30);
  const salesMode = sales !== undefined;
  const budgetMode = budget !== undefined;
  const totalLabel = budgetMode ? "စုစုပေါင်းရန်ပုံငွေ" : salesMode ? "စုစုပေါင်း ရောင်းရငွေ" : "Total Outcome";
  const displayValue = (value: number) => salesMode || budgetMode ? formatKyat(value) : niceCompact(value);
  const [loading, setLoading] = useState(false);
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fetchOutcome = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outcome", { cache: "no-store" });
      const json = await res.json();
      setOutcomes(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!salesMode && !budgetMode) void fetchOutcome();
  }, [salesMode, budgetMode]);

  const data = useMemo(() => budgetMode ? [
    { name: "သုံးစွဲပြီးငွေ", value: Math.min(budget?.spent ?? 0, budget?.funds ?? 0) },
    { name: "လက်ကျန်ငွေ", value: (budget?.funds ?? 0) - (budget?.spent ?? 0) },
  ].filter(({ value }) => value > 0) : sales
    ? sales.map(({ id, name, values }) => ({ id, name, value: values[range] }))
      .filter(({ value }) => value > 0)
      .sort((a, b) => b.value - a.value)
    : sumOutcomeByShop(outcomes), [budget, budgetMode, outcomes, range, sales]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const top = useMemo(() => (data as PiePoint[]).slice(0, 4), [data]);

  const active = activeIndex != null ? data[activeIndex] : null;

  return (
    // ✅ overflow-visible so Tooltip won't be clipped
    <Card className="group relative h-full overflow-visible rounded-2xl border border-border/60 bg-gradient-to-b from-background to-muted/20 report-chart-depth transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border">
      {/* clip only the background effects */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl opacity-60 transition-opacity group-hover:opacity-80" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl opacity-40" />

        <CardHeader className="flex flex-wrap items-start justify-between gap-3 pb-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold tracking-wide">
              {budgetMode ? "ကုန်ဝယ်ရန်ပုံငွေ" : salesMode ? "ကုန်ပစ္စည်းအလိုက် ရောင်းရငွေအချိုး" : "Outcome by Shop"}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {budgetMode ? "ရန်ပုံငွေထဲမှ သုံးပြီးငွေနှင့် လက်ကျန်အချိုး" : salesMode ? "ရွေးထားတဲ့ကာလအတွင်း ရောင်းရငွေအလိုက်" : "Hover slice to see details"}
            </p>
          </div>

          {budgetMode ? (
            <Link href="/dashboard/purchase-budget" className="text-sm text-blue-600 underline dark:text-blue-400">စာရင်းကြည့်ရန်</Link>
          ) : salesMode ? (
            <div role="group" aria-label="ရက်အပိုင်းအခြား" className="flex flex-wrap gap-1.5">
              {salesRanges.map((days) => (
                <Button key={days} type="button" size="sm" variant={range === days ? "default" : "outline"}
                  aria-pressed={range === days} onClick={() => { setRange(days); setActiveIndex(null); }}>
                  {days} ရက်
                </Button>
              ))}
            </div>
          ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOutcome}
            disabled={loading}
            className="gap-2 rounded-full"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          )}
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_190px]">
            {/* LEFT: donut */}
            <div className="relative h-[320px] w-full">
              {/* center label */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/40">
                  <div className="text-[11px] text-muted-foreground">
                    {active ? active.name : totalLabel}
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {displayValue(active ? active.value : total)}
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<CustomTooltip salesMode={salesMode} budgetMode={budgetMode} />}
                    wrapperStyle={{ zIndex: 9999 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />

                  {/* Legend ကို small + clean */}
                  <Legend
                    verticalAlign="bottom"
                    height={42}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                    }}
                    formatter={(value: unknown) => (
                      <span className="text-muted-foreground">{String(value)}</span>
                    )}
                  />

                  <Pie
                    className="report-donut-depth"
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="56%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="var(--background)"
                    strokeWidth={2}
                    onMouseLeave={() => setActiveIndex(null)}
                    onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        opacity={activeIndex == null ? 0.95 : activeIndex === i ? 1 : 0.35}
                        style={{
                          filter: `drop-shadow(0 2px ${activeIndex === i ? 5 : 2}px ${PIE_COLORS[i % PIE_COLORS.length]})`,
                          transition: "opacity 200ms ease",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT: Top list (kpi-style) */}
            {budgetMode ? (
              <dl className="space-y-3 rounded-2xl border border-border/60 p-3 text-sm">
                {budget ? [
                  { label: "သုံးစွဲပြီးငွေ", value: budget.spent },
                  { label: "လက်ကျန်ငွေ", value: budget.funds - budget.spent },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-wrap justify-between gap-2">
                    <dt>{label}</dt>
                    <dd className={value < 0 ? "font-semibold text-red-600 dark:text-red-400" : "font-semibold"}>{formatKyat(value)}</dd>
                  </div>
                )) : <div className="text-muted-foreground">ရန်ပုံငွေ မသတ်မှတ်ရသေးပါ။</div>}
              </dl>
            ) : <div className="h-[320px] rounded-2xl border border-border/60 bg-background/70 p-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/50">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">{salesMode ? "ရောင်းရငွေအများဆုံး ပစ္စည်းများ" : "Top Shops"}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {displayValue(total)}
                </div>
              </div>

              <div className="mt-3 max-h-[240px] space-y-2 overflow-auto pr-1">
                {top.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{salesMode ? "ဒီကာလမှာ ရောင်းရငွေ မရှိသေးပါ။" : "No data"}</div>
                ) : (
                  top.map((t, i) => {
                    const pct = total > 0 ? (t.value / total) * 100 : 0;
                    return (
                      <div
                        key={t.id ?? t.name}
                        className="rounded-xl border border-border/50 bg-background/60 p-2 transition hover:bg-background/80"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{t.name}</div>
                            <div className="text-[11px] text-muted-foreground tabular-nums">
                              {pct.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-sm font-semibold tabular-nums">
                            {displayValue(t.value)}
                          </div>
                        </div>

                        {/* progress bar */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, pct))}%`,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{totalLabel}</span>
                <span className="font-medium text-foreground tabular-nums">
                  {salesMode ? formatKyat(total) : total.toLocaleString()}
                </span>
              </div>
            </div>}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
