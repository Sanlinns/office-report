
"use client";

import React, { useId, useMemo } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { ChartBoxConfig } from "./types";

/* =========================================
   Original Color Preset
========================================= */

type ColorPreset = {
  stroke: string;
  glow: string;
};

function pickPreset(key: string): ColorPreset {
  const k = (key ?? "").toLowerCase();

  // Income / Revenue
  if (
    k.includes("income") ||
    k.includes("revenue") ||
    k.includes("total")
  ) {
    return {
      stroke: "hsl(262.1 83.3% 57.8%)",
      glow: "hsl(262.1 83.3% 57.8%)",
    };
  }

  // Expense / Cost
  if (
    k.includes("outcome") ||
    k.includes("expense") ||
    k.includes("cost")
  ) {
    return {
      stroke: "hsl(0 84.2% 60.2%)",
      glow: "hsl(0 84.2% 60.2%)",
    };
  }

  // Profit
  if (k.includes("profit")) {
    return {
      stroke: "hsl(48 96% 53%)",
      glow: "hsl(48 96% 53%)",
    };
  }

  // Users / Visitors
  if (
    k.includes("users") ||
    k.includes("visit")
  ) {
    return {
      stroke: "hsl(142.1 76.2% 36.3%)",
      glow: "hsl(142.1 76.2% 36.3%)",
    };
  }

  return {
    stroke: "var(--primary)",
    glow: "var(--primary)",
  };
}

/* =========================================
   Number Helpers
========================================= */

function toNumber(value: unknown) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function niceCompact(number: number) {
  const abs = Math.abs(number);

  if (abs >= 1_000_000_000) {
    return (
      (number / 1_000_000_000)
        .toFixed(1)
        .replace(/\.0$/, "") + "B"
    );
  }

  if (abs >= 1_000_000) {
    return (
      (number / 1_000_000)
        .toFixed(1)
        .replace(/\.0$/, "") + "M"
    );
  }

  if (abs >= 1_000) {
    return (
      (number / 1_000)
        .toFixed(1)
        .replace(/\.0$/, "") + "K"
    );
  }

  return number.toLocaleString();
}

/* =========================================
   Mini Chart Tooltip
========================================= */

type CustomMiniTooltipProps = {
  active?: boolean;

  payload?: readonly {
    value?: unknown;
    name?: string | number;
  }[];

  label?: string | number;
};

function CustomMiniTooltip({
  active,
  payload,
  label,
}: CustomMiniTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0];
  const value = toNumber(point?.value);

  return (
    <div
      className="
        rounded-2xl
        border border-border/60
        bg-background/95
        px-3 py-2
        shadow-xl
        backdrop-blur
        supports-[backdrop-filter]:bg-background/75
      "
    >
      <div className="text-[11px] text-muted-foreground">
        {label ?? ""}
      </div>

      <div
        className="
          mt-1 flex items-center
          justify-between gap-6
          text-sm
        "
      >
        <span className="text-muted-foreground">
          {point?.name ?? "Value"}
        </span>

        <span className="font-semibold tabular-nums">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* =========================================
   Component Props
========================================= */

type ChartBoxProps = {
  props: ChartBoxConfig;
  color?: string;
  detail?: string;
  emptyMessage?: string;
};

/* =========================================
   Main ChartBox Component
========================================= */

export default function ChartBox({
  props,
  color,
  detail,
  emptyMessage,
}: ChartBoxProps) {
  const isPositive =
    (props.percentage ?? 0) >= 0;

  const dataKey =
    props.dataKey ?? "value";

  /* =======================================
     Original Chart Color
  ======================================= */

  const preset = useMemo(
    () =>
      color
        ? {
            stroke: color,
            glow: color,
          }
        : pickPreset(
            props.dataKey ?? props.title
          ),
    [
      color,
      props.dataKey,
      props.title,
    ]
  );

  /* =======================================
     Unique SVG Gradient ID
  ======================================= */

  const reactId = useId();

  const gid = `chartbox-${reactId.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  )}`;

  /* =======================================
     Real Chart Data
  ======================================= */

  const chartData = props.chartData;

  /* =======================================
     Chart Min / Max Range

     Negative Profit values supported
  ======================================= */

  const [min, max] = useMemo(() => {
    const values = (chartData ?? []).map(
      (point) =>
        toNumber(point?.[dataKey])
    );

    return [
      Math.min(0, ...values),
      Math.max(1, ...values),
    ];
  }, [chartData, dataKey]);

  const yTop = Math.ceil(max * 1.12);

  /* =======================================
     Single Data Point
  ======================================= */

  const hasSinglePoint = useMemo(
    () =>
      (chartData ?? []).filter(
        (point) =>
          point[dataKey] != null
      ).length === 1,
    [chartData, dataKey]
  );

  /* =======================================
     Original Main Number
  ======================================= */

  const mainNumber =
    typeof props.number === "number"
      ? props.number
      : Number(
          String(props.number ?? "")
            .replace(/,/g, "")
        ) || 0;

  /* =======================================
     Render
  ======================================= */

  return (
    <Card
      className={[
        "group relative h-full overflow-visible rounded-2xl border",
        "border border-border/60 bg-gradient-to-b from-background to-muted/20",
        "shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-border",
      ].join(" ")}
    >

      {/* =================================
          Original Background Glow
      ================================= */}

      <div
        className="
          pointer-events-none
          absolute -top-20 -right-20
          h-56 w-56
          rounded-full
          blur-3xl
          opacity-25
          transition-opacity duration-300
          group-hover:opacity-35
        "
        style={{
          background: preset.glow,
        }}
      />

      <div
        className="
          pointer-events-none
          absolute -bottom-24 -left-24
          h-56 w-56
          rounded-full
          blur-3xl
          opacity-15
        "
        style={{
          background: preset.glow,
        }}
      />

      {/* =================================
          Original Noise Layer
      ================================= */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          opacity-[0.03]
          [background-image:radial-gradient(#000_1px,transparent_1px)]
          [background-size:14px_14px]
          dark:opacity-[0.06]
        "
      />

      {/* =================================
          Card Header
      ================================= */}

      <CardHeader className="pb-2">

        <div
          className="
            flex items-start
            justify-between gap-3
          "
        >

          <div className="min-w-0">

            <CardTitle
              className="
                text-sm
                font-semibold
                tracking-wide
              "
            >
              {props.title}
            </CardTitle>

            <CardDescription
              className="
                mt-1 text-xs
              "
            >
              {props.subtitle ??
                "Mini trend for recent days"}
            </CardDescription>

          </div>

          {/* =============================
              Percentage Badge
          ============================= */}

          {props.percentage != null && (

            <Badge
              variant="secondary"
              className={[
                "gap-1.5 rounded-full",
                "border border-border/60",
                "bg-background/60",
                "px-2.5 py-1 text-[11px]",
                "backdrop-blur",
                "supports-[backdrop-filter]:bg-background/40",

                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",

              ].join(" ")}
            >

              {isPositive ? (
                <TrendingUp
                  className="h-3.5 w-3.5"
                />
              ) : (
                <TrendingDown
                  className="h-3.5 w-3.5"
                />
              )}

              <span className="tabular-nums">
                {isPositive ? "+" : ""}
                {props.percentage}%
              </span>

            </Badge>

          )}

        </div>

      </CardHeader>

      {/* =================================
          Card Content
      ================================= */}

      <CardContent className="space-y-3">

        <div
          className="
            flex flex-wrap
            items-end
            justify-between
            gap-3
          "
        >

          {/* =============================
              Amount — Always Visible
          ============================= */}

          <div
            className="
              min-w-0 flex-1
              basis-24 space-y-1
            "
          >

            <div
              className="
                break-words
                text-xl
                font-semibold
                leading-tight
                tabular-nums
              "
            >
              {typeof props.number === "string"
                ? props.number
                : mainNumber.toLocaleString()}
            </div>

            {(detail || !props.subtitle) && (

              <div className="text-xs text-muted-foreground">

                {detail ??
                  `Total · ${niceCompact(mainNumber)}`}

              </div>

            )}

          </div>

          {/* =============================
              Empty State
          ============================= */}

          {emptyMessage ? (

            <p className="text-xs text-muted-foreground">

              {emptyMessage}

            </p>

          ) : (

            /* ===========================
               Mini Area Chart

               Progressive Drawing
               Every 10 Seconds
            =========================== */

            <div
              className="
                chartbox-draw-active
                h-16
                w-[58%]
                min-w-0
                shrink-0
              "
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  {/* ===================
                      SVG Gradient
                  =================== */}

                  <defs>

                    <linearGradient
                      id={gid}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor={preset.stroke}
                        stopOpacity={0.95}
                      />

                      <stop
                        offset="75%"
                        stopColor={preset.stroke}
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="100%"
                        stopColor={preset.stroke}
                        stopOpacity={0.06}
                      />

                    </linearGradient>

                    {/* =================
                        Original Glow
                    ================= */}

                    <filter
                      id={`${gid}-shadow`}
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >

                      <feGaussianBlur
                        stdDeviation="2.2"
                        result="coloredBlur"
                      />

                      <feMerge>

                        <feMergeNode
                          in="coloredBlur"
                        />

                        <feMergeNode
                          in="SourceGraphic"
                        />

                      </feMerge>

                    </filter>

                  </defs>

                  {/* ===================
                      Grid
                  =================== */}

                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                  />

                  {/* ===================
                      Chart Axes
                  =================== */}

                  <XAxis
                    dataKey="name"
                    hide
                  />

                  <YAxis
                    hide
                    domain={[min, yTop]}
                  />

                  {/* ===================
                      Tooltip
                  =================== */}

                  <Tooltip
                    cursor={false}
                    content={
                      <CustomMiniTooltip />
                    }
                    wrapperStyle={{
                      zIndex: 9999,
                    }}
                    allowEscapeViewBox={{
                      x: true,
                      y: true,
                    }}
                  />

                  {/* ===================
                      Background Glow Line
                  =================== */}

                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={preset.stroke}
                    fill="transparent"
                    strokeWidth={4}
                    opacity={0.18}
                    dot={false}
                    activeDot={false}

                    isAnimationActive={false}
                  />

                  {/* ===================
                      Main Area Chart

                      Original Data
                      Original Color
                      Original Gradient
                  =================== */}

                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={preset.stroke}
                    fill={`url(#${gid})`}
                    strokeWidth={2}
                    filter={`url(#${gid}-shadow)`}
                    fillOpacity={1}

                    dot={
                      hasSinglePoint
                        ? { r: 3 }
                        : false
                    }

                    activeDot={{
                      r: 3.5,
                      strokeWidth: 0,
                      fill: preset.stroke,
                    }}

                    isAnimationActive={false}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </CardContent>

    </Card>
  );
}
