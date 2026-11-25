// "use client";

// import { useState } from "react";
// import { Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatKyat } from "@/lib/format-kyat";

// type DailySale = { date: string; revenue: number; cost: number; profit: number; count: number };
// const ranges = [7, 30, 90] as const;
// const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

// export default function SalesReportChart({ points, mode = "sales" }: { points: DailySale[]; mode?: "sales" | "factory" }) {
//   const [range, setRange] = useState<(typeof ranges)[number]>(30);
//   const visible = points.slice(-range);
//   const hasRecords = visible.some(({ count }) => count > 0);

//   const totals = visible.reduce((sum, point) => ({
//     revenue: sum.revenue + point.revenue,
//     cost: sum.cost + point.cost,
//     profit: sum.profit + point.profit,
//   }), { revenue: 0, cost: 0, profit: 0 });

//   const labels = mode === "factory" ? {
//     income: "ဝင်ငွေ", expense: "ထွက်ငွေ", profit: "အသားတင်ငွေရလဒ်",
//     margin: "အသားတင်ငွေရလဒ်နှုန်း", composition: "ဝင်ငွေ ခွဲခြမ်းပြချက်", trend: "နေ့စဉ် ဝင်ငွေ၊ ထွက်ငွေနှင့် ငွေရလဒ်",
//   } : {
//     income: "ရောင်းရငွေ", expense: "ရောင်းပြီးကုန်ကျစရိတ်", profit: "အကြမ်းအမြတ်",
//     margin: "အကြမ်းအမြတ်နှုန်း", composition: "ရောင်းရငွေ ဖွဲ့စည်းပုံ", trend: "နေ့စဉ် အရောင်းအစီရင်ခံစာ",
//   };
//   const hasShortfall = mode === "factory" && totals.revenue >= 0 && totals.cost > totals.revenue;
//   const hasComposition = totals.revenue > 0 && totals.cost >= 0 && totals.profit >= 0;
//   const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
//   const composition = [
//     { name: labels.expense, value: totals.cost, color: "#d97706" },
//     { name: labels.profit, value: totals.profit, color: "#059669" },
//   ];
//   const slices = hasShortfall ? [
//     { name: "ဝယ်ဖိုးကို ကာမိသည့် ရောင်းရငွေ", value: totals.revenue, color: "#2563eb" },
//     { name: "ရောင်းရငွေဖြင့် မကာမိသည့် ဝယ်ဖိုး", value: totals.cost - totals.revenue, color: "#dc2626" },
//   ].filter(({ value }) => value > 0) : composition;
//   const metrics = [
//     { label: labels.income, value: formatKyat(totals.revenue), key: "revenue", color: "#2563eb" },
//     { label: labels.expense, value: formatKyat(totals.cost), key: "cost", color: "#d97706" },
//     { label: labels.profit, value: formatKyat(totals.profit), key: "profit", color: "#059669" },
//     { label: labels.margin, value: totals.revenue > 0 ? percent(totals.profit / totals.revenue) : "—", key: "margin", color: "#059669" },
//   ];
//   const trends = visible.map((point) => ({
//     ...point,
//     margin: point.revenue > 0 ? point.profit / point.revenue : null,
//   }));

//   return (
//     <div className="min-w-0 space-y-4">
//       <div className="flex justify-end">
//           <div className="flex flex-wrap gap-2" role="group" aria-label="ရက်အပိုင်းအခြား">
//             {ranges.map((days) => (
//               <Button key={days} type="button" size="sm" variant={range === days ? "default" : "outline"}
//                 className={range === days ? "bg-blue-600 text-white hover:bg-blue-700" : undefined}
//                 aria-pressed={range === days} onClick={() => setRange(days)}>
//                 {days} ရက်
//               </Button>
//             ))}
//           </div>
//       </div>
//       <div className="grid min-w-0 gap-4 lg:grid-cols-2">
//         <div className="grid min-w-0 gap-4 sm:grid-cols-2">
//           {metrics.map(({ label, value, key, color }) => (
//             <Card
//               key={key}
//               className="report-chart-depth relative isolate min-w-0 gap-2 overflow-hidden rounded-2xl border-border/60 bg-gradient-to-b from-background to-muted/20"
//             >
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full opacity-35 blur-3xl"
//                 style={{ backgroundColor: color }}
//               />
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -bottom-24 -left-24 size-56 rounded-full opacity-20 blur-3xl"
//                 style={{ backgroundColor: color }}
//               />
//               <CardHeader className="relative">
//                 <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
//               </CardHeader>
//               <CardContent className="relative">
//                 <div className={`text-xl font-semibold tabular-nums ${key === "profit" && totals.profit < 0 ? "text-red-600 dark:text-red-400" : ""}`}>{value}</div>
//                 {mode === "factory" && key === "profit" && (
//                   <div className="mt-2 space-y-1 text-xs text-muted-foreground">
//                     <p>ရောင်းရငွေ − ဝယ်ဖိုး</p>
//                     <p className="tabular-nums">{formatKyat(totals.revenue)} − {formatKyat(totals.cost)}</p>
//                     {!hasRecords && <p>ရွေးထားတဲ့ {range} ရက်အတွင်း အရောင်း၊ အဝယ်စာရင်း မရှိသေးပါ။</p>}
//                   </div>
//                 )}
//                 {hasRecords && (key !== "margin" || trends.some(({ margin }) => margin !== null)) ? (
//                   <div aria-hidden="true" className="mt-3 h-12">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart className="report-chart-glow" data={trends} margin={{ top: 4, bottom: 4 }}>
//                         <YAxis hide domain={[(minimum: number) => Math.min(0, minimum), (maximum: number) => Math.max(0, maximum)]} />
//                         <Area dataKey={key} type="monotone" stroke={color} fill={color} fillOpacity={0.12} dot={key === "margin" && trends.filter(({ margin }) => margin !== null).length === 1 ? { r: 3 } : false} isAnimationActive={false} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : (
//                   <p className="mt-3 text-xs text-muted-foreground">
//                     {hasRecords ? "နှုန်းတွက်ရန် ရောင်းရငွေ မရှိသေးပါ။" : "ဒီကာလမှာ Chart ပြရန် စာရင်းမရှိသေးပါ။"}
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//         <Card className="min-w-0 rounded-2xl border-border/60 bg-gradient-to-b from-card to-muted/20 report-chart-depth">
//           <CardHeader><CardTitle>{labels.composition}</CardTitle></CardHeader>
//           <CardContent className="grid items-center gap-4 sm:grid-cols-2">
//             {hasComposition || hasShortfall ? (
//               <div className="relative h-52 min-w-0" aria-hidden="true">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie className="report-donut-depth" data={slices} dataKey="value" innerRadius="68%" outerRadius="90%" stroke="var(--card)" isAnimationActive={false}>
//                       {slices.map(({ name, color }) => <Cell key={name} fill={color} style={{ filter: `drop-shadow(0 2px 4px ${color}59)` }} />)}
//                     </Pie>
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <span className="pointer-events-none absolute inset-0 grid place-items-center text-center text-sm font-semibold tabular-nums">
//                   {formatKyat(hasShortfall ? totals.cost - totals.revenue : totals.revenue)}
//                 </span>
//               </div>
//             ) : <p className="text-sm text-muted-foreground">ဒီကာလအတွက် အချိုးပြ Chart မရှိပါ။</p>}
//             <ul className="space-y-4">
//               {hasShortfall && <li className="text-sm text-muted-foreground">ဝယ်ဖိုးက ရောင်းရငွေထက် များနေပါတယ်။ Chart မှာ ဝယ်ဖိုးထဲက ကာမိသည့်ငွေနဲ့ လိုငွေကို ပြထားပါတယ်။</li>}
//               {slices.map(({ name, value, color }) => (
//                 <li key={name} className="flex items-start gap-2 text-sm">
//                   <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: color }} />
//                   <div>
//                     <div className="font-medium">{name}</div>
//                     <div className="text-muted-foreground tabular-nums">
//                       {formatKyat(value)}{(hasComposition || hasShortfall) && ` (${percent(value / (hasShortfall ? totals.cost : totals.revenue))})`}
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//       <Card className="min-w-0 rounded-2xl border-border/60 bg-gradient-to-b from-card to-muted/20 report-chart-depth">
//         <CardHeader>
//           <CardTitle><h2>{labels.trend}</h2></CardTitle>
//         </CardHeader>
//         <CardContent>
//           {hasRecords ? (
//             <div className="h-72 min-w-0 sm:h-80">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart className="report-chart-glow" data={visible} margin={{ top: 12, right: 12, bottom: 4 }}>
//                   <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
//                   <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} minTickGap={28} />
//                   <YAxis tickFormatter={(value: number) => compact.format(value)} width={56} />
//                   <Tooltip formatter={(value) => formatKyat(Number(value))}
//                     contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", borderColor: "var(--border)", borderRadius: 12 }} />
//                   <Legend />
//                   <Line dataKey="revenue" name={labels.income} stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
//                   <Line dataKey="cost" name={labels.expense} stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
//                   <Line dataKey="profit" name={labels.profit} stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ) : <p className="py-12 text-center text-sm text-muted-foreground">ဒီရက်အပိုင်းအခြားမှာ ပြရန် စာရင်း မရှိသေးပါ။</p>}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartBox from "../chart/ChartBox";
import ReportCardGlow from "../chart/ReportCardGlow";
import { formatKyat } from "@/lib/format-kyat";

type DailySale = { date: string; revenue: number; cost: number; profit: number; count: number };
const ranges = [7, 30, 90] as const;
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export default function SalesReportChart({ points, mode = "sales" }: { points: DailySale[]; mode?: "sales" | "factory" }) {
  const [range, setRange] = useState<(typeof ranges)[number]>(30);
  const visible = points.slice(-range);
  const hasRecords = visible.some(({ count }) => count > 0);

  const totals = visible.reduce((sum, point) => ({
    revenue: sum.revenue + point.revenue,
    cost: sum.cost + point.cost,
    profit: sum.profit + point.profit,
  }), { revenue: 0, cost: 0, profit: 0 });

  const labels = mode === "factory" ? {
    income: "ဝင်ငွေ", expense: "ထွက်ငွေ", profit: "အသားတင်ငွေရလဒ်",
    margin: "အသားတင်ငွေရလဒ်နှုန်း", composition: "ဝင်ငွေ ခွဲခြမ်းပြချက်", trend: "နေ့စဉ် ဝင်ငွေ၊ ထွက်ငွေနှင့် ငွေရလဒ်",
  } : {
    income: "ရောင်းရငွေ", expense: "ရောင်းပြီးကုန်ကျစရိတ်", profit: "အကြမ်းအမြတ်",
    margin: "အကြမ်းအမြတ်နှုန်း", composition: "ရောင်းရငွေ ဖွဲ့စည်းပုံ", trend: "နေ့စဉ် အရောင်းအစီရင်ခံစာ",
  };
  const hasShortfall = mode === "factory" && totals.revenue >= 0 && totals.cost > totals.revenue;
  const hasComposition = totals.revenue > 0 && totals.cost >= 0 && totals.profit >= 0;
  const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const composition = [
    { name: labels.expense, value: totals.cost, color: "#d97706" },
    { name: labels.profit, value: totals.profit, color: "#059669" },
  ];
  const slices = hasShortfall ? [
    { name: "ဝယ်ဖိုးကို ကာမိသည့် ရောင်းရငွေ", value: totals.revenue, color: "#2563eb" },
    { name: "ရောင်းရငွေဖြင့် မကာမိသည့် ဝယ်ဖိုး", value: totals.cost - totals.revenue, color: "#dc2626" },
  ].filter(({ value }) => value > 0) : composition;
  const metrics = [
    { label: labels.income, value: formatKyat(totals.revenue), key: "revenue", color: "#2563eb" },
    { label: labels.expense, value: formatKyat(totals.cost), key: "cost", color: "#d97706" },
    { label: labels.profit, value: formatKyat(totals.profit), key: "profit", color: "#059669" },
    { label: labels.margin, value: totals.revenue > 0 ? percent(totals.profit / totals.revenue) : "—", key: "margin", color: "#059669" },
  ];
  const trends = visible.map((point) => ({
    ...point,
    name: point.date,
    margin: point.revenue > 0 ? 100 * point.profit / point.revenue : null,
  }));

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex justify-end">
          <div className="flex flex-wrap gap-2" role="group" aria-label="ရက်အပိုင်းအခြား">
            {ranges.map((days) => (
              <Button key={days} type="button" size="sm" variant={range === days ? "default" : "outline"}
                className={range === days ? "bg-blue-600 text-white hover:bg-blue-700" : undefined}
                aria-pressed={range === days} onClick={() => setRange(days)}>
                {days} ရက်
              </Button>
            ))}
          </div>
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {metrics.map(({ label, value, key, color }) => (
            <ChartBox
              key={key}
              color={color}
              props={{
                title: label,
                subtitle: key === "profit" && mode === "factory" ? "ရောင်းရငွေ − ဝယ်ဖိုး" : `${range} ရက် အနှစ်ချုပ်`,
                number: value,
                percentage: key === "margin" && totals.revenue > 0 ? 100 * totals.profit / totals.revenue : 0,
                dataKey: key,
                chartData: trends,
              }}
              detail={key === "profit" && mode === "factory" ? `${formatKyat(totals.revenue)} − ${formatKyat(totals.cost)}` : undefined}
              emptyMessage={!hasRecords ? "ဒီကာလမှာ စာရင်းမရှိသေးပါ။" :
                key === "margin" && trends.every(({ margin }) => margin === null) ? "နှုန်းတွက်ရန် ရောင်းရငွေ မရှိသေးပါ။" : undefined}
            />
          ))}
        </div>
        <Card className="min-w-0 rounded-2xl border-border/60 relative isolate bg-gradient-to-b from-background to-muted/20 report-chart-depth">
          <ReportCardGlow />
          <CardHeader><CardTitle>{labels.composition}</CardTitle></CardHeader>
          <CardContent className="grid items-center gap-4 sm:grid-cols-2">
            {hasComposition || hasShortfall ? (
              <div className="relative h-52 min-w-0" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie className="report-donut-depth" data={slices} dataKey="value" innerRadius="68%" outerRadius="90%" stroke="var(--card)" isAnimationActive={false}>
                      {slices.map(({ name, color }) => <Cell key={name} fill={color} style={{ filter: `drop-shadow(0 2px 4px ${color}59)` }} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-center text-sm font-semibold tabular-nums">
                  {formatKyat(hasShortfall ? totals.cost - totals.revenue : totals.revenue)}
                </span>
              </div>
            ) : <p className="text-sm text-muted-foreground">ဒီကာလအတွက် အချိုးပြ Chart မရှိပါ။</p>}
            <ul className="space-y-4">
              {hasShortfall && <li className="text-sm text-muted-foreground">ဝယ်ဖိုးက ရောင်းရငွေထက် များနေပါတယ်။ Chart မှာ ဝယ်ဖိုးထဲက ကာမိသည့်ငွေနဲ့ လိုငွေကို ပြထားပါတယ်။</li>}
              {slices.map(({ name, value, color }) => (
                <li key={name} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: color }} />
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-muted-foreground tabular-nums">
                      {formatKyat(value)}{(hasComposition || hasShortfall) && ` (${percent(value / (hasShortfall ? totals.cost : totals.revenue))})`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card className="min-w-0 rounded-2xl border-border/60 relative isolate bg-gradient-to-b from-background to-muted/20 report-chart-depth">
        <ReportCardGlow />
        <CardHeader>
          <CardTitle><h2>{labels.trend}</h2></CardTitle>
        </CardHeader>
        <CardContent>
          {hasRecords ? (
            <div className="h-72 min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart className="report-chart-glow" data={visible} margin={{ top: 12, right: 12, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} minTickGap={28} />
                  <YAxis tickFormatter={(value: number) => compact.format(value)} width={56} />
                  <Tooltip formatter={(value) => formatKyat(Number(value))}
                    contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", borderColor: "var(--border)", borderRadius: 12 }} />
                  <Legend />
                  <Line dataKey="revenue" name={labels.income} stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="cost" name={labels.expense} stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="profit" name={labels.profit} stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="py-12 text-center text-sm text-muted-foreground">ဒီရက်အပိုင်းအခြားမှာ ပြရန် စာရင်း မရှိသေးပါ။</p>}
        </CardContent>
      </Card>
    </div>
  );
}
