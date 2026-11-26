"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ChartBox from "../chart/ChartBox";
import ReportCardGlow from "../chart/ReportCardGlow";

import IncomeSphereChart from "../chart/IncomeSphereChart";
import CosmicAreaChart from "../chart/CosmicAreaChart";

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

type SalesReportChartProps = {
  points: DailySale[];
  mode?: "sales" | "factory";
};

/* =========================================
   Date Range Configuration
========================================= */

const ranges = [1, 7, 30, 90] as const;

type ReportRange = (typeof ranges)[number];

function getRangeLabel(range: ReportRange) {
  return range === 1
    ? "ယနေ့"
    : `${range} ရက်`;
}

/* =========================================
   Sales Report Chart
========================================= */

export default function SalesReportChart({
  points,
  mode = "sales",
}: SalesReportChartProps) {
  const [range, setRange] =
    useState<ReportRange>(30);

  /* =======================================
     Selected Date Range
  ======================================= */

  const visible = points.slice(-range);

  const rangeLabel = getRangeLabel(range);

  const hasRecords = visible.some(
    (point) =>
      point.count > 0 ||
      point.revenue !== 0 ||
      point.cost !== 0 ||
      point.profit !== 0
  );

  /* =======================================
     Calculate Totals
  ======================================= */

  const totals = visible.reduce(
    (sum, point) => ({
      revenue: sum.revenue + point.revenue,

      cost: sum.cost + point.cost,

      profit: sum.profit + point.profit,
    }),
    {
      revenue: 0,
      cost: 0,
      profit: 0,
    }
  );

  const isNegative = totals.profit < 0;

  const margin =
    totals.revenue > 0
      ? (totals.profit / totals.revenue) * 100
      : null;

  /* =======================================
     Factory / Sales Labels
  ======================================= */

  const labels =
    mode === "factory"
      ? {
          income: "ဝင်ငွေ",

          expense: "ထွက်ငွေ",

          profit: "အသားတင်ငွေရလဒ်",

          margin: "အသားတင်ငွေရလဒ်နှုန်း",

          composition: "ဝင်ငွေ ခွဲခြမ်းပြချက်",

          trend:
            "နေ့စဉ် ဝင်ငွေ၊ ထွက်ငွေနှင့် ငွေရလဒ်",

          todayTrend:
            "ယနေ့ ဝင်ငွေ၊ ထွက်ငွေနှင့် ငွေရလဒ်",
        }
      : {
          income: "ရောင်းရငွေ",

          expense: "ရောင်းပြီးကုန်ကျစရိတ်",

          profit: "အကြမ်းအမြတ်",

          margin: "အကြမ်းအမြတ်နှုန်း",

          composition: "ရောင်းရငွေ ဖွဲ့စည်းပုံ",

          trend: "နေ့စဉ် အရောင်းအစီရင်ခံစာ",

          todayTrend: "ယနေ့ အရောင်းအစီရင်ခံစာ",
        };

  /* =======================================
     Summary Card Metrics
  ======================================= */

  const metrics = [
    {
      label: labels.income,

      value: formatKyat(totals.revenue),

      key: "revenue",

      color: "#2563eb",
    },

    {
      label: labels.expense,

      value: formatKyat(totals.cost),

      key: "cost",

      color: "#d97706",
    },

    {
      label: labels.profit,

      value: formatKyat(totals.profit),

      key: "profit",

      color: isNegative
        ? "#dc2626"
        : "#059669",
    },

    {
      label: labels.margin,

      value:
        margin !== null
          ? `${margin.toFixed(1)}%`
          : "—",

      key: "margin",

      color: isNegative
        ? "#dc2626"
        : "#059669",
    },
  ];

  /* =======================================
     Daily Trend Data
  ======================================= */

  const trends = visible.map((point) => ({
    ...point,

    name: point.date,

    margin:
      point.revenue > 0
        ? (point.profit / point.revenue) * 100
        : null,
  }));

  /* =======================================
     Render
  ======================================= */

  return (
    <div className="min-w-0 space-y-4">

      {/* =====================================
          Date Range Filter
      ===================================== */}

      <div className="flex justify-end">

        <div
          className="
            flex flex-wrap
            items-center gap-2
          "
          role="group"
          aria-label="ရက်အပိုင်းအခြား"
        >

          {ranges.map((days) => (
            <Button
              key={days}
              type="button"
              size="sm"
              variant={
                range === days
                  ? "default"
                  : "outline"
              }
              className={
                range === days
                  ? `
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                  `
                  : undefined
              }
              aria-pressed={range === days}
              onClick={() => setRange(days)}
            >
              {getRangeLabel(days)}
            </Button>
          ))}

        </div>

      </div>

      {/* =====================================
          Summary & Income Composition
      ===================================== */}

      <div
        className="
          grid min-w-0 gap-4
          lg:grid-cols-2
        "
      >

        {/* ===================================
            Summary Cards
        =================================== */}

        <div
          className="
            grid min-w-0 gap-4
            sm:grid-cols-2
          "
        >

          {metrics.map(
            ({ label, value, key, color }) => (
              <ChartBox
                key={key}
                color={color}
                props={{
                  title: label,

                  subtitle:
                    key === "profit" &&
                    mode === "factory"
                      ? "ရောင်းရငွေ − ဝယ်ဖိုး"
                      : `${rangeLabel} အနှစ်ချုပ်`,

                  number: value,

                  percentage:
                    key === "margin" &&
                    margin !== null
                      ? margin
                      : 0,

                  dataKey: key,

                  chartData: trends,
                }}
                detail={
                  key === "profit" &&
                  mode === "factory"
                    ? `${formatKyat(
                        totals.revenue
                      )} − ${formatKyat(
                        totals.cost
                      )}`
                    : undefined
                }
                emptyMessage={
                  !hasRecords
                    ? "ဒီကာလမှာ စာရင်းမရှိသေးပါ။"
                    : key === "margin" &&
                        trends.every(
                          ({ margin }) =>
                            margin === null
                        )
                      ? "နှုန်းတွက်ရန် ရောင်းရငွေ မရှိသေးပါ။"
                      : undefined
                }
              />
            )
          )}

        </div>

        {/* ===================================
            Cosmic Glass Sphere Chart
        =================================== */}

        <Card
          className="
            report-chart-depth
            relative isolate
            min-w-0 h-full
            overflow-hidden
            rounded-2xl
            border-border/60
            bg-gradient-to-b
            from-background to-muted/20
          "
        >

          <ReportCardGlow />

          {/* Card Header */}

          <CardHeader className="relative z-10">

            <div
              className="
                flex flex-wrap
                items-center
                justify-between
                gap-2
              "
            >

              <CardTitle>
                {labels.composition}
              </CardTitle>

              <span
                className="
                  shrink-0
                  rounded-full
                  border border-border/60
                  bg-background/60
                  px-2.5 py-1
                  text-xs
                  text-muted-foreground
                "
              >
                {rangeLabel}
              </span>

            </div>

          </CardHeader>

          {/* Card Content */}

          <CardContent
            className="
              relative z-10
              flex flex-1
              flex-col
              justify-center
              min-w-0
            "
          >

            {hasRecords ? (

              <IncomeSphereChart
                income={totals.revenue}
                expense={totals.cost}
              />

            ) : (

              <div
                className="
                  flex min-h-52
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  text-center
                "
              >

                <p className="text-sm text-muted-foreground">
                  ဒီရက်အပိုင်းအခြားအတွက်
                  စာရင်းမရှိသေးပါ။
                </p>

                <p className="text-xs text-muted-foreground">
                  ဝင်ငွေနှင့် ထွက်ငွေစာရင်းရှိပါက
                  Chart တွင် ဖော်ပြပေးပါမည်။
                </p>

              </div>

            )}

          </CardContent>

        </Card>

      </div>

      {/* =====================================
          Cosmic Liquid Wave Area Chart
      ===================================== */}

      <Card
        className="
          report-chart-depth
          relative isolate
          min-w-0
          overflow-hidden
          rounded-2xl
          border-border/60
          bg-gradient-to-b
          from-background to-muted/20
        "
      >

        <ReportCardGlow />

        {/* ===================================
            Daily Chart Header
        =================================== */}

        <CardHeader className="relative z-10">

          <div
            className="
              flex flex-wrap
              items-center
              justify-between
              gap-3
            "
          >

            <div className="min-w-0 space-y-1">

              <CardTitle className="leading-relaxed">
                {range === 1
                  ? labels.todayTrend
                  : labels.trend}
              </CardTitle>

              <p className="text-xs text-muted-foreground">
                {range === 1
                  ? "ယနေ့အတွက် စုစုပေါင်းငွေစာရင်း"
                  : `${rangeLabel} အတွင်း နေ့စဉ်ငွေစာရင်း အတက်အကျ`}
              </p>

            </div>

            <span
              className="
                shrink-0
                rounded-full
                border border-border/60
                bg-background/60
                px-3 py-1
                text-xs
                text-muted-foreground
              "
            >
              {rangeLabel}
            </span>

          </div>

        </CardHeader>

        {/* ===================================
            Cosmic Area Chart Content
        =================================== */}

        <CardContent className="relative z-10">

          <CosmicAreaChart
            points={visible}
            range={range}
            mode={mode}
          />

        </CardContent>

      </Card>

    </div>
  );
}