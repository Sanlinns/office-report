"use client";

import { useId, useMemo } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatKyat } from "@/lib/format-kyat";

/* =========================================
   Types
========================================= */

type DailySale = {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  count: number;
};

type CosmicAreaChartProps = {
  points: DailySale[];
  range: 1 | 7 | 30 | 90;
  mode?: "sales" | "factory";
};

/* =========================================
   Cosmic Color System
========================================= */

const COLORS = {
  income: {
    light: "#c4b5fd",
    bright: "#818cf8",
    middle: "#4338ca",
    deep: "#172554",
  },

  expense: {
    light: "#fef3c7",
    bright: "#fbbf24",
    middle: "#b45309",
    deep: "#451a03",
  },

  profit: {
    light: "#a7f3d0",
    bright: "#2dd4bf",
    middle: "#059669",
    deep: "#064e3b",
  },

  loss: {
    light: "#fecdd3",
    bright: "#fb7185",
    middle: "#e11d48",
    deep: "#881337",
  },
};

type ColorKey = keyof typeof COLORS;

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/* =========================================
   Safe Number
========================================= */

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* =========================================
   Cosmic Liquid Wave Chart
========================================= */

export default function CosmicAreaChart({
  points,
  range,
  mode = "factory",
}: CosmicAreaChartProps) {

  const reactId = useId();

  // Safe unique SVG gradient ID
  const id = `cosmic-${reactId.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  )}`;

  /* =======================================
     Labels
  ======================================= */

  const labels =
    mode === "factory"
      ? {
          income: "ဝင်ငွေ",
          expense: "ထွက်ငွေ",
          profit: "အသားတင်ငွေရလဒ်",
        }
      : {
          income: "ရောင်းရငွေ",
          expense: "ရောင်းပြီးကုန်ကျစရိတ်",
          profit: "အကြမ်းအမြတ်",
        };

  /* =======================================
     Normalize Chart Data
  ======================================= */

  const chartData = useMemo(() => {
    if (!Array.isArray(points)) {
      return [];
    }

    return points
      .map((point) => ({
        date: String(point.date ?? ""),
        revenue: safeNumber(point.revenue),
        cost: safeNumber(point.cost),
        profit: safeNumber(point.profit),
        count: safeNumber(point.count),
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );
  }, [points]);

  /* =======================================
     Calculate Totals
  ======================================= */

  const totals = useMemo(() => {
    return chartData.reduce(
      (sum, point) => ({
        revenue:
          sum.revenue + point.revenue,

        cost:
          sum.cost + point.cost,

        profit:
          sum.profit + point.profit,
      }),
      {
        revenue: 0,
        cost: 0,
        profit: 0,
      }
    );
  }, [chartData]);

  const hasRecords = chartData.some(
    (point) =>
      point.count > 0 ||
      point.revenue !== 0 ||
      point.cost !== 0 ||
      point.profit !== 0
  );

  const hasProfit = chartData.some(
    (point) => point.profit > 0
  );

  const hasLoss = chartData.some(
    (point) => point.profit < 0
  );

  const isNegative = totals.profit < 0;

  /* =======================================
     Summary Metrics
  ======================================= */

  const metrics: {
    key: ColorKey;
    label: string;
    value: number;
    className: string;
  }[] = [
    {
      key: "income",
      label: labels.income,
      value: totals.revenue,
      className: "cosmic-income-text",
    },
    {
      key: "expense",
      label: labels.expense,
      value: totals.cost,
      className: "cosmic-expense-text",
    },
    {
      key: isNegative ? "loss" : "profit",
      label: labels.profit,
      value: totals.profit,
      className: isNegative
        ? "cosmic-loss-text"
        : "cosmic-profit-text",
    },
  ];

  /* =======================================
     Today Chart Data
  ======================================= */

  const todayData = metrics.map((metric) => ({
    name: metric.label,
    value: metric.value,
    key: metric.key,
  }));

  /* =======================================
     Y Axis Domain
  ======================================= */

  const allValues = chartData.flatMap(
    (point) => [
      point.revenue,
      point.cost,
      point.profit,
    ]
  );

  const minimumValue = Math.min(
    0,
    ...allValues
  );

  const maximumValue = Math.max(
    0,
    ...allValues
  );

  const domainMin =
    minimumValue < 0
      ? minimumValue * 1.12
      : 0;

  const domainMax =
    maximumValue > 0
      ? maximumValue * 1.12
      : 1;

  /* =======================================
     Profit / Loss Gradient Offset
  ======================================= */

  const maximumProfit = Math.max(
    0,
    ...chartData.map(
      (point) => point.profit
    )
  );

  const minimumProfit = Math.min(
    0,
    ...chartData.map(
      (point) => point.profit
    )
  );

  const profitRange =
    maximumProfit - minimumProfit;

  const zeroOffset =
    profitRange > 0
      ? maximumProfit / profitRange
      : 1;

  /* =======================================
     Chart Configuration
  ======================================= */

  const axisTick = {
    fill: "var(--muted-foreground, #94a3b8)",
    fontSize: 11,
  };

  const tooltipStyle = {
    background: "var(--popover, #ffffff)",
    color: "var(--popover-foreground, #111827)",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 14,
    padding: "12px 14px",
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.12)",
  };

  const chartMargin = {
    top: 20,
    right: 16,
    left: 0,
    bottom: 12,
  };

  /* =======================================
     Render
  ======================================= */

  return (
    <div
      className="
        cosmic-area-chart
        flex w-full min-w-0
        flex-col gap-4
      "
    >

      {/* ===================================
          Summary Metrics
      =================================== */}

      <div
        className="
          cosmic-area-metrics
          grid grid-cols-3 gap-2
          md:gap-3
        "
      >
        {metrics.map((metric) => {
          const color = COLORS[metric.key];

          return (
            <div
              key={metric.key}
              className="
                cosmic-area-metric
                min-w-0 rounded-xl
                border border-border/60
                bg-muted/20
                p-2 md:p-3
              "
            >
              <div className="flex items-center gap-2">

                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    background: `linear-gradient(
                      135deg,
                      ${color.light},
                      ${color.bright},
                      ${color.middle}
                    )`,
                  }}
                />

                <p className="text-xs text-muted-foreground">
                  {metric.label}
                </p>

              </div>

              <p
                className={`
                  mt-2 break-words
                  text-sm font-semibold
                  tabular-nums md:text-lg
                  ${metric.className}
                `}
              >
                {formatKyat(metric.value)}
              </p>

            </div>
          );
        })}
      </div>

      {/* ===================================
          Empty State
      =================================== */}

      {!hasRecords ? (

        <div
          className="
            flex min-h-[260px]
            flex-col items-center
            justify-center gap-2
            text-center
          "
        >

          <p className="text-sm text-muted-foreground">
            ဒီရက်အပိုင်းအခြားမှာ
            ပြရန် စာရင်းမရှိသေးပါ။
          </p>

          <p className="text-xs text-muted-foreground">
            ဝင်ငွေနှင့် ထွက်ငွေစာရင်းရှိပါက
            Chart တွင် ဖော်ပြပေးပါမည်။
          </p>

        </div>

      ) : (

        /* =================================
           Fixed Chart Container

           Important:
           ResponsiveContainer requires
           a parent with a defined height.
        ================================= */

        <div
          className="
            cosmic-area-canvas
            relative
            w-full min-w-0
            h-[260px]
            md:h-[300px]
            lg:h-[340px]
          "
          style={{
            width: "100%",
            minWidth: 0,
            minHeight: 260,
          }}
        >

          {range === 1 ? (

            /* =============================
               Today Crystal Glass Bar
            ============================= */

            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={240}
              debounce={50}
            >

              <BarChart
                data={todayData}
                margin={chartMargin}
              >

                {/* Bar Gradients */}

                <defs>

                  {Object.entries(COLORS).map(
                    ([key, color]) => (
                      <linearGradient
                        key={key}
                        id={`${id}-bar-${key}`}
                        x1="0%"
                        y1="0%"
                        x2="30%"
                        y2="100%"
                      >

                        <stop
                          offset="0%"
                          stopColor={color.light}
                          className="cosmic-bar-highlight"
                        />

                        <stop
                          offset="25%"
                          stopColor={color.bright}
                        />

                        <stop
                          offset="65%"
                          stopColor={color.middle}
                        />

                        <stop
                          offset="100%"
                          stopColor={color.deep}
                        />

                      </linearGradient>
                    )
                  )}

                </defs>

                {/* Grid */}

                <CartesianGrid
                  vertical={false}
                  stroke="var(--border, #94a3b8)"
                  strokeDasharray="4 6"
                  opacity={0.5}
                />

                {/* X Axis */}

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={axisTick}
                />

                {/* Y Axis */}

                <YAxis
                  width={65}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={axisTick}
                  tickFormatter={(
                    value: number
                  ) =>
                    compact.format(value)
                  }
                  domain={[
                    (min: number) =>
                      Math.min(0, min),

                    (max: number) =>
                      Math.max(1, max),
                  ]}
                />

                {/* Zero Reference */}

                <ReferenceLine
                  y={0}
                  stroke="var(--muted-foreground, #94a3b8)"
                  strokeOpacity={0.35}
                />

                {/* Tooltip */}

                <Tooltip
                  formatter={(value) =>
                    formatKyat(
                      safeNumber(value)
                    )
                  }
                  contentStyle={tooltipStyle}
                  cursor={{
                    fill: "var(--muted, #94a3b8)",
                    opacity: 0.12,
                  }}
                />

                {/* Crystal Bars */}

                <Bar
                  dataKey="value"
                  name="ငွေပမာဏ"
                  maxBarSize={75}
                  radius={[10, 10, 10, 10]}
                  isAnimationActive={false}
                >

                  {todayData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={`url(#${id}-bar-${entry.key})`}
                    />
                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          ) : (

            /* =============================
               Cosmic Liquid Wave Area
            ============================= */

            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={240}
              debounce={50}
            >

              <AreaChart
                data={chartData}
                margin={chartMargin}
              >

                <defs>

                  {/* =====================
                      Cosmic Gradients
                  ===================== */}

                  {Object.entries(COLORS).map(
                    ([key, color]) => (
                      <linearGradient
                        key={key}
                        id={`${id}-area-${key}`}
                        x1="0%"
                        y1="0%"
                        x2="15%"
                        y2="100%"
                      >

                        <stop
                          offset="0%"
                          stopColor={color.light}
                          stopOpacity={0.75}
                          className="cosmic-wave-highlight"
                        />

                        <stop
                          offset="20%"
                          stopColor={color.bright}
                          stopOpacity={0.65}
                        />

                        <stop
                          offset="55%"
                          stopColor={color.middle}
                          stopOpacity={0.35}
                        />

                        <stop
                          offset="100%"
                          stopColor={color.deep}
                          stopOpacity={0.025}
                        />

                      </linearGradient>
                    )
                  )}

                  {/* =====================
                      Profit / Loss Fill
                  ===================== */}

                  <linearGradient
                    id={`${id}-profit-fill`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >

                    {hasProfit && (
                      <>

                        <stop
                          offset={0}
                          stopColor={
                            COLORS.profit.light
                          }
                          stopOpacity={0.75}
                          className="cosmic-wave-highlight"
                        />

                        <stop
                          offset={
                            zeroOffset * 0.4
                          }
                          stopColor={
                            COLORS.profit.bright
                          }
                          stopOpacity={0.55}
                        />

                        <stop
                          offset={zeroOffset}
                          stopColor={
                            COLORS.profit.deep
                          }
                          stopOpacity={0.02}
                        />

                      </>
                    )}

                    {hasLoss && (
                      <>

                        <stop
                          offset={zeroOffset}
                          stopColor={
                            COLORS.loss.deep
                          }
                          stopOpacity={0.02}
                        />

                        <stop
                          offset={
                            zeroOffset +
                            (1 - zeroOffset) * 0.5
                          }
                          stopColor={
                            COLORS.loss.middle
                          }
                          stopOpacity={0.4}
                        />

                        <stop
                          offset={1}
                          stopColor={
                            COLORS.loss.bright
                          }
                          stopOpacity={0.75}
                        />

                      </>
                    )}

                    {!hasProfit && !hasLoss && (
                      <stop
                        offset={0}
                        stopColor={
                          COLORS.profit.bright
                        }
                        stopOpacity={0}
                      />
                    )}

                  </linearGradient>

                  {/* =====================
                      Profit / Loss Stroke
                  ===================== */}

                  <linearGradient
                    id={`${id}-profit-stroke`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >

                    <stop
                      offset={0}
                      stopColor={
                        COLORS.profit.bright
                      }
                    />

                    <stop
                      offset={zeroOffset}
                      stopColor={
                        COLORS.profit.bright
                      }
                    />

                    <stop
                      offset={zeroOffset}
                      stopColor={
                        COLORS.loss.bright
                      }
                    />

                    <stop
                      offset={1}
                      stopColor={
                        COLORS.loss.bright
                      }
                    />

                  </linearGradient>

                </defs>

                {/* =======================
                    Grid
                ======================= */}

                <CartesianGrid
                  vertical={false}
                  stroke="var(--border, #94a3b8)"
                  strokeDasharray="4 6"
                  opacity={0.5}
                />

                {/* =======================
                    X Axis
                ======================= */}

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={axisTick}
                  minTickGap={
                    range === 90
                      ? 45
                      : range === 30
                        ? 28
                        : 12
                  }
                  tickFormatter={(
                    date: string
                  ) =>
                    date.length >= 10
                      ? date.slice(5, 10)
                      : date
                  }
                />

                {/* =======================
                    Y Axis
                ======================= */}

                <YAxis
                  width={65}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={axisTick}
                  domain={[
                    domainMin,
                    domainMax,
                  ]}
                  tickFormatter={(
                    value: number
                  ) =>
                    compact.format(value)
                  }
                />

                {/* =======================
                    Zero Reference
                ======================= */}

                <ReferenceLine
                  y={0}
                  stroke="var(--muted-foreground, #94a3b8)"
                  strokeOpacity={0.35}
                />

                {/* =======================
                    Glass Tooltip
                ======================= */}

                <Tooltip
                  formatter={(value) =>
                    formatKyat(
                      safeNumber(value)
                    )
                  }
                  contentStyle={tooltipStyle}
                  cursor={{
                    stroke:
                      "var(--muted-foreground, #94a3b8)",

                    strokeDasharray: "4 4",

                    strokeOpacity: 0.6,
                  }}
                />

                {/* =======================
                    Income Wave
                    Midnight Galaxy
                ======================= */}

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={labels.income}
                  className="cosmic-wave-income"
                  stroke={COLORS.income.bright}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={`url(#${id}-area-income)`}
                  fillOpacity={1}
                  baseValue={0}
                  dot={
                    chartData.length === 1
                      ? { r: 4 }
                      : false
                  }
                  activeDot={{
                    r: 5,
                    fill: COLORS.income.light,
                    stroke: COLORS.income.middle,
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />

                {/* =======================
                    Expense Wave
                    Solar Gold
                ======================= */}

                <Area
                  type="monotone"
                  dataKey="cost"
                  name={labels.expense}
                  className="cosmic-wave-expense"
                  stroke={COLORS.expense.bright}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={`url(#${id}-area-expense)`}
                  fillOpacity={1}
                  baseValue={0}
                  dot={
                    chartData.length === 1
                      ? { r: 4 }
                      : false
                  }
                  activeDot={{
                    r: 5,
                    fill: COLORS.expense.light,
                    stroke: COLORS.expense.middle,
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />

                {/* =======================
                    Profit / Loss Wave
                    Emerald & Crimson
                ======================= */}

                <Area
                  type="monotone"
                  dataKey="profit"
                  name={labels.profit}
                  className="cosmic-wave-profit"
                  stroke={
                    hasProfit && hasLoss
                      ? `url(#${id}-profit-stroke)`
                      : hasLoss
                        ? COLORS.loss.bright
                        : COLORS.profit.bright
                  }
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={`url(#${id}-profit-fill)`}
                  fillOpacity={1}
                  baseValue={0}
                  dot={
                    chartData.length === 1
                      ? { r: 4 }
                      : false
                  }
                  activeDot={{
                    r: 5,
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />

              </AreaChart>

            </ResponsiveContainer>

          )}

        </div>

      )}

      {/* ===================================
          Chart Legend
      =================================== */}

      <div
        className="
          cosmic-area-legend
          flex flex-wrap
          items-center justify-center
          gap-4
        "
      >

        {/* Income */}

        <div className="flex items-center gap-2">

          <span
            className="size-2.5 rounded-full"
            style={{
              backgroundColor:
                COLORS.income.bright,
            }}
          />

          <span className="text-xs text-muted-foreground">
            {labels.income}
          </span>

        </div>

        {/* Expense */}

        <div className="flex items-center gap-2">

          <span
            className="size-2.5 rounded-full"
            style={{
              backgroundColor:
                COLORS.expense.bright,
            }}
          />

          <span className="text-xs text-muted-foreground">
            {labels.expense}
          </span>

        </div>

        {/* Profit */}

        {(range === 1
          ? !isNegative
          : hasProfit || !hasLoss) && (

          <div className="flex items-center gap-2">

            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor:
                  COLORS.profit.bright,
              }}
            />

            <span className="text-xs text-muted-foreground">
              {labels.profit}
            </span>

          </div>

        )}

        {/* Loss */}

        {(range === 1
          ? isNegative
          : hasLoss) && (

          <div className="flex items-center gap-2">

            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor:
                  COLORS.loss.bright,
              }}
            />

            <span className="text-xs text-muted-foreground">
              အနုတ်ငွေရလဒ်
            </span>

          </div>

        )}

      </div>

    </div>
  );
}