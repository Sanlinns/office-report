
// "use client";

// import Link from "next/link";

// import {
//   useEffect,
//   useId,
//   useMemo,
//   useState,
// } from "react";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Button } from "@/components/ui/button";
// import { formatKyat } from "@/lib/format-kyat";

// import { RefreshCcw } from "lucide-react";

// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
// } from "recharts";

// /* =========================================
//    Types
// ========================================= */

// type OutcomeRow = {
//   id?: number;
//   amount?: number | string;
//   date?: string;
//   createdAt?: string;

//   shop?: string;
//   shop_name?: string;
//   shopName?: string;
//   supplier?: string;
//   vendor?: string;
// };

// const salesRanges = [7, 15, 30] as const;

// type SalesRange = (typeof salesRanges)[number];

// type SalesPoint = {
//   id: string;
//   name: string;
//   values: Record<SalesRange, number>;
// };

// type PiePoint = {
//   name: string;
//   value: number;
//   id?: string;
// };

// type PieChartBoxProps = {
//   sales?: SalesPoint[];
//   budget?: {
//     funds: number;
//     spent: number;
//   } | null;
// };

// /* =========================================
//    Original Pie Colors
// ========================================= */

// const PIE_COLORS = [
//   "oklch(0.646 0.222 41.116)",
//   "oklch(0.6 0.118 184.704)",
//   "oklch(0.398 0.07 227.392)",
//   "oklch(0.828 0.189 84.429)",
//   "oklch(0.769 0.188 70.08)",
// ];

// /* =========================================
//    Helper Functions
// ========================================= */

// function getShopName(row: OutcomeRow) {
//   return (
//     row.shop ??
//     row.shop_name ??
//     row.shopName ??
//     row.supplier ??
//     row.vendor ??
//     "Unknown"
//   );
// }

// function toNumber(value: unknown) {
//   const number = Number(value ?? 0);

//   return Number.isFinite(number)
//     ? number
//     : 0;
// }

// function sumOutcomeByShop(
//   rows: OutcomeRow[]
// ): PiePoint[] {
//   const map = new Map<string, number>();

//   for (const row of rows) {
//     const shop =
//       String(getShopName(row)).trim() ||
//       "Unknown";

//     map.set(
//       shop,
//       (map.get(shop) ?? 0) +
//         toNumber(row.amount)
//     );
//   }

//   return Array.from(map.entries())
//     .map(([name, value]) => ({
//       name,
//       value,
//     }))
//     .sort((a, b) => b.value - a.value);
// }

// function niceCompact(number: number) {
//   const abs = Math.abs(number);

//   if (abs >= 1_000_000_000) {
//     return (
//       (number / 1_000_000_000)
//         .toFixed(1)
//         .replace(/\.0$/, "") + "B"
//     );
//   }

//   if (abs >= 1_000_000) {
//     return (
//       (number / 1_000_000)
//         .toFixed(1)
//         .replace(/\.0$/, "") + "M"
//     );
//   }

//   if (abs >= 1_000) {
//     return (
//       (number / 1_000)
//         .toFixed(1)
//         .replace(/\.0$/, "") + "K"
//     );
//   }

//   return number.toLocaleString();
// }

// /* =========================================
//    Custom Tooltip
// ========================================= */

// type CustomTooltipProps = {
//   active?: boolean;

//   payload?: readonly {
//     name?: string;
//     value?: unknown;
//   }[];

//   salesMode: boolean;
//   budgetMode: boolean;
//   total: number;
// };

// function CustomTooltip({
//   active,
//   payload,
//   salesMode,
//   budgetMode,
//   total,
// }: CustomTooltipProps) {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const point = payload[0];

//   const name = point?.name ?? "";

//   const value = toNumber(point?.value);

//   const percentage =
//     total > 0
//       ? (value / total) * 100
//       : 0;

//   return (
//     <div
//       className="
//         z-[9999]
//         rounded-2xl
//         border border-border/60
//         bg-background/95
//         px-3 py-2
//         shadow-xl backdrop-blur
//       "
//     >
//       <div className="text-[11px] text-muted-foreground">
//         {budgetMode
//           ? "ရန်ပုံငွေ"
//           : salesMode
//             ? "ကုန်ပစ္စည်း"
//             : "Shop"}
//       </div>

//       <div className="text-sm font-semibold">
//         {name}
//       </div>

//       <div className="mt-2 text-[11px] text-muted-foreground">
//         {budgetMode
//           ? "ငွေပမာဏ"
//           : salesMode
//             ? "ရောင်းရငွေ"
//             : "Outcome"}
//       </div>

//       <div className="text-sm font-semibold tabular-nums">
//         {salesMode || budgetMode
//           ? formatKyat(value)
//           : value.toLocaleString()}
//       </div>

//       <div className="mt-1 text-xs text-muted-foreground">
//         {percentage.toFixed(1)}%
//       </div>
//     </div>
//   );
// }

// /* =========================================
//    Liquid Gradient Definitions
// ========================================= */

// function LiquidGradients({
//   id,
//   animated,
// }: {
//   id: string;
//   animated: boolean;
// }) {
//   return (
//     <defs>
//       {PIE_COLORS.map((color, index) => {
//         const direction =
//           index % 2 === 0 ? 1 : -1;

//         return (
//           <linearGradient
//             key={index}
//             id={`${id}-liquid-${index}`}
//             x1="0%"
//             y1="0%"
//             x2="100%"
//             y2="100%"
//           >
//             {/* Deep Color */}

//             <stop
//               offset="0%"
//               stopColor={`color-mix(
//                 in srgb,
//                 ${color} 65%,
//                 #000000
//               )`}
//             />

//             {/* Original Color */}

//             <stop
//               offset="30%"
//               stopColor={color}
//             />

//             {/* Soft Highlight */}

//             <stop
//               offset="58%"
//               stopColor={`color-mix(
//                 in srgb,
//                 ${color} 65%,
//                 #ffffff
//               )`}
//             />

//             {/* Liquid Reflection */}

//             <stop
//               offset="75%"
//               stopColor={`color-mix(
//                 in srgb,
//                 ${color} 80%,
//                 #ffffff
//               )`}
//             />

//             {/* Original Color */}

//             <stop
//               offset="100%"
//               stopColor={color}
//             />

//             {/* Liquid Flow Animation */}

//             {animated && (
//               <animateTransform
//                 attributeName="gradientTransform"
//                 type="rotate"
//                 values={`
//                   0 0.5 0.5;
//                   ${25 * direction} 0.5 0.5;
//                   ${-10 * direction} 0.5 0.5;
//                   ${3 * direction} 0.5 0.5;
//                   0 0.5 0.5;
//                   0 0.5 0.5
//                 `}
//                 keyTimes="
//                   0;
//                   0.12;
//                   0.22;
//                   0.32;
//                   0.4;
//                   1
//                 "
//                 calcMode="spline"
//                 keySplines="
//                   0.42 0 0.58 1;
//                   0.42 0 0.58 1;
//                   0.42 0 0.58 1;
//                   0.42 0 0.58 1;
//                   0.42 0 0.58 1
//                 "
//                 dur="5s"
//                 repeatCount="indefinite"
//               />
//             )}
//           </linearGradient>
//         );
//       })}
//     </defs>
//   );
// }

// /* =========================================
//    Pie Chart Box
// ========================================= */

// export default function PieChartBox({
//   sales,
//   budget,
// }: PieChartBoxProps) {
//   const reactId = useId();

//   const gradientId = `pie-${reactId.replace(
//     /[^a-zA-Z0-9_-]/g,
//     ""
//   )}`;

//   const [range, setRange] =
//     useState<SalesRange>(30);

//   const [loading, setLoading] =
//     useState(false);

//   const [outcomes, setOutcomes] =
//     useState<OutcomeRow[]>([]);

//   const [activeIndex, setActiveIndex] =
//     useState<number | null>(null);

//   const [reduceMotion, setReduceMotion] =
//     useState(true);

//   /* =======================================
//      Chart Modes
//   ======================================= */

//   const salesMode = sales !== undefined;

//   const budgetMode = budget !== undefined;

//   const liquidMode =
//     salesMode && !budgetMode;

//   const totalLabel = budgetMode
//     ? "စုစုပေါင်းရန်ပုံငွေ"
//     : salesMode
//       ? "စုစုပေါင်း ရောင်းရငွေ"
//       : "Total Outcome";

//   const displayValue = (value: number) =>
//     salesMode || budgetMode
//       ? formatKyat(value)
//       : niceCompact(value);

//   /* =======================================
//      Reduced Motion / Print Preference
//   ======================================= */

//   useEffect(() => {
//     const media = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     );

//     const printMedia =
//       window.matchMedia("print");

//     const update = () => {
//       setReduceMotion(
//         media.matches ||
//         printMedia.matches
//       );
//     };

//     update();

//     media.addEventListener(
//       "change",
//       update
//     );

//     printMedia.addEventListener(
//       "change",
//       update
//     );

//     return () => {
//       media.removeEventListener(
//         "change",
//         update
//       );

//       printMedia.removeEventListener(
//         "change",
//         update
//       );
//     };
//   }, []);

//   /* =======================================
//      Fetch Outcome Data
//   ======================================= */

//   const fetchOutcome = async () => {
//     setLoading(true);

//     try {
//       const response = await fetch(
//         "/api/outcome",
//         {
//           cache: "no-store",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(
//           `Request failed: ${response.status}`
//         );
//       }

//       const json = await response.json();

//       setOutcomes(
//         Array.isArray(json)
//           ? json
//           : []
//       );

//       setActiveIndex(null);
//     } catch (error) {
//       console.error(
//         "Could not load outcomes",
//         error
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!salesMode && !budgetMode) {
//       void fetchOutcome();
//     }
//   }, [salesMode, budgetMode]);

//   /* =======================================
//      Chart Data
//   ======================================= */

//   const data = useMemo<PiePoint[]>(() => {
//     if (budgetMode) {
//       return [
//         {
//           name: "သုံးစွဲပြီးငွေ",
//           value: Math.min(
//             budget?.spent ?? 0,
//             budget?.funds ?? 0
//           ),
//         },
//         {
//           name: "လက်ကျန်ငွေ",
//           value:
//             (budget?.funds ?? 0) -
//             (budget?.spent ?? 0),
//         },
//       ].filter(({ value }) => value > 0);
//     }

//     if (sales) {
//       return sales
//         .map(({ id, name, values }) => ({
//           id,
//           name,
//           value: toNumber(values[range]),
//         }))
//         .filter(({ value }) => value > 0)
//         .sort(
//           (a, b) => b.value - a.value
//         );
//     }

//     return sumOutcomeByShop(outcomes);
//   }, [
//     budget,
//     budgetMode,
//     outcomes,
//     range,
//     sales,
//   ]);

//   const total = useMemo(
//     () =>
//       data.reduce(
//         (sum, point) =>
//           sum + point.value,
//         0
//       ),
//     [data]
//   );

//   const top = useMemo(
//     () => data.slice(0, 4),
//     [data]
//   );

//   const active =
//     activeIndex !== null
//       ? data[activeIndex] ?? null
//       : null;

//   const activePercentage =
//     active && total > 0
//       ? (active.value / total) * 100
//       : null;

//   /* =======================================
//      Render
//   ======================================= */

//   return (
//     <Card
//       className="
//         group relative
//         h-full min-w-0
//         overflow-visible
//         rounded-2xl
//         border border-border/60
//         bg-gradient-to-b
//         from-background to-muted/20
//         report-chart-depth
//         transition-all duration-300
//         hover:shadow-lg
//         hover:border-border
//       "
//     >
//       <div className="relative rounded-2xl">

//         {/* Background Effects */}

//         <div
//           className="
//             pointer-events-none
//             absolute inset-0
//             overflow-hidden rounded-2xl
//           "
//         >
//           <div
//             className="
//               absolute -top-24 -right-24
//               h-56 w-56 rounded-full
//               bg-primary/10 blur-3xl
//               opacity-60
//             "
//           />

//           <div
//             className="
//               absolute -bottom-24 -left-24
//               h-56 w-56 rounded-full
//               bg-primary/10 blur-3xl
//               opacity-40
//             "
//           />
//         </div>

//         {/* ===============================
//             Card Header
//         =============================== */}

//         <CardHeader
//           className="
//             relative flex flex-wrap
//             items-start justify-between
//             gap-3 pb-2
//           "
//         >
//           <div className="min-w-0">

//             <CardTitle className="text-sm font-semibold tracking-wide">
//               {budgetMode
//                 ? "ကုန်ဝယ်ရန်ပုံငွေ"
//                 : salesMode
//                   ? "ကုန်ပစ္စည်းအလိုက် ရောင်းရငွေအချိုး"
//                   : "Outcome by Shop"}
//             </CardTitle>

//             <p className="mt-1 text-xs text-muted-foreground">
//               {budgetMode
//                 ? "ရန်ပုံငွေထဲမှ သုံးပြီးငွေနှင့် လက်ကျန်အချိုး"
//                 : salesMode
//                   ? "ရွေးထားတဲ့ကာလအတွင်း ရောင်းရငွေအလိုက်"
//                   : "Hover slice to see details"}
//             </p>

//           </div>

//           {/* Budget Link */}

//           {budgetMode ? (

//             <Link
//               href="/dashboard/purchase-budget"
//               className="
//                 text-sm text-blue-600
//                 underline dark:text-blue-400
//               "
//             >
//               စာရင်းကြည့်ရန်
//             </Link>

//           ) : salesMode ? (

//             /* Date Range Filter */

//             <div
//               role="group"
//               aria-label="ရက်အပိုင်းအခြား"
//               className="flex flex-wrap gap-1.5"
//             >
//               {salesRanges.map((days) => (
//                 <Button
//                   key={days}
//                   type="button"
//                   size="sm"
//                   variant={
//                     range === days
//                       ? "default"
//                       : "outline"
//                   }
//                   aria-pressed={range === days}
//                   onClick={() => {
//                     setRange(days);
//                     setActiveIndex(null);
//                   }}
//                 >
//                   {days} ရက်
//                 </Button>
//               ))}
//             </div>

//           ) : (

//             /* Refresh Button */

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={fetchOutcome}
//               disabled={loading}
//               className="gap-2 rounded-full"
//             >
//               <RefreshCcw
//                 className={`h-4 w-4 ${
//                   loading
//                     ? "animate-spin"
//                     : ""
//                 }`}
//               />

//               Refresh
//             </Button>

//           )}
//         </CardHeader>

//         {/* ===============================
//             Card Content
//         =============================== */}

//         <CardContent className="relative min-w-0 pt-2">

//           <div
//             className="
//               grid min-w-0 gap-3
//               2xl:grid-cols-[minmax(0,1fr)_190px]
//             "
//           >

//             {/* ===========================
//                 LEFT — Liquid Pie Chart
//             =========================== */}

//             <div className="min-w-0">

//               <div
//                 className="
//                   product-liquid-pie
//                   relative
//                   h-[280px]
//                   w-full min-w-0
//                 "
//                 style={{
//                   width: "100%",
//                   height: 280,
//                   minWidth: 0,
//                 }}
//               >

//                 {data.length > 0 &&
//                 total > 0 ? (

//                   <>

//                     {/* Center Label */}

//                     <div
//                       className="
//                         pointer-events-none
//                         absolute inset-0
//                         z-10 grid
//                         place-items-center
//                       "
//                     >

//                       <div
//                         className="
//                           max-w-[48%]
//                           rounded-xl
//                           border border-border/60
//                           bg-background/70
//                           px-3 py-2
//                           text-center
//                           shadow-sm
//                           backdrop-blur
//                         "
//                       >

//                         <div className="truncate text-[11px] text-muted-foreground">
//                           {active
//                             ? active.name
//                             : totalLabel}
//                         </div>

//                         <div
//                           className="
//                             break-words
//                             text-sm
//                             font-semibold
//                             tabular-nums
//                           "
//                         >
//                           {displayValue(
//                             active
//                               ? active.value
//                               : total
//                           )}
//                         </div>

//                         {activePercentage !==
//                           null && (
//                           <div className="mt-1 text-xs text-muted-foreground">
//                             {activePercentage.toFixed(
//                               1
//                             )}
//                             %
//                           </div>
//                         )}

//                       </div>

//                     </div>

//                     {/* Recharts Pie */}

//                     <ResponsiveContainer
//                       width="100%"
//                       height={280}
//                       minWidth={0}
//                     >

//                       <PieChart>

//                         {/* Animated Gradients */}

//                         {liquidMode && (
//                           <LiquidGradients
//                             id={gradientId}
//                             animated={
//                               !reduceMotion
//                             }
//                           />
//                         )}

//                         {/* Tooltip */}

//                         <Tooltip
//                           content={
//                             <CustomTooltip
//                               salesMode={
//                                 salesMode
//                               }
//                               budgetMode={
//                                 budgetMode
//                               }
//                               total={total}
//                             />
//                           }
//                           wrapperStyle={{
//                             zIndex: 9999,
//                           }}
//                           allowEscapeViewBox={{
//                             x: true,
//                             y: true,
//                           }}
//                         />

//                         {/* Pie Slices */}

//                         <Pie
//                           className={
//                             liquidMode
//                               ? "product-liquid-pie-ring"
//                               : "report-donut-depth"
//                           }
//                           data={data}
//                           dataKey="value"
//                           nameKey="name"
//                           cx="50%"
//                           cy="50%"
//                           innerRadius="56%"
//                           outerRadius="82%"
//                           paddingAngle={2}
//                           stroke="var(--background)"
//                           strokeWidth={2}
//                           isAnimationActive={false}
//                           onMouseLeave={() =>
//                             setActiveIndex(null)
//                           }
//                           onMouseEnter={(
//                             _,
//                             index
//                           ) =>
//                             setActiveIndex(index)
//                           }
//                           onClick={(_, index) =>
//                             setActiveIndex(
//                               (previous) =>
//                                 previous === index
//                                   ? null
//                                   : index
//                             )
//                           }
//                         >

//                           {data.map(
//                             (point, index) => {
//                               const colorIndex =
//                                 index %
//                                 PIE_COLORS.length;

//                               const color =
//                                 PIE_COLORS[
//                                   colorIndex
//                                 ];

//                               return (
//                                 <Cell
//                                   key={
//                                     point.id ??
//                                     `${point.name}-${index}`
//                                   }
//                                   fill={
//                                     liquidMode
//                                       ? `url(#${gradientId}-liquid-${colorIndex})`
//                                       : color
//                                   }
//                                   opacity={
//                                     activeIndex ===
//                                     null
//                                       ? 0.98
//                                       : activeIndex ===
//                                           index
//                                         ? 1
//                                         : 0.4
//                                   }
//                                   style={{
//                                     filter: `drop-shadow(
//                                       0 2px
//                                       ${
//                                         activeIndex ===
//                                         index
//                                           ? 5
//                                           : 2
//                                       }px
//                                       ${color}
//                                     )`,
//                                     transition:
//                                       "opacity 200ms ease",
//                                   }}
//                                 />
//                               );
//                             }
//                           )}

//                         </Pie>

//                       </PieChart>

//                     </ResponsiveContainer>

//                   </>

//                 ) : (

//                   /* Empty State */

//                   <div className="grid h-full place-items-center text-center">
//                     <p className="text-sm text-muted-foreground">
//                       {salesMode
//                         ? "ဒီကာလမှာ ရောင်းရငွေ မရှိသေးပါ။"
//                         : "ပြရန် စာရင်းမရှိသေးပါ။"}
//                     </p>
//                   </div>

//                 )}

//               </div>

//               {/* =========================
//                   Custom Color Legend
//               ========================= */}

//               <div
//                 className="
//                   flex flex-wrap
//                   items-center
//                   justify-center
//                   gap-x-3 gap-y-2
//                 "
//               >
//                 {data.map((point, index) => (
//                   <button
//                     key={
//                       point.id ??
//                       `${point.name}-${index}`
//                     }
//                     type="button"
//                     aria-pressed={
//                       activeIndex === index
//                     }
//                     onMouseEnter={() =>
//                       setActiveIndex(index)
//                     }
//                     onMouseLeave={() =>
//                       setActiveIndex(null)
//                     }
//                     onFocus={() =>
//                       setActiveIndex(index)
//                     }
//                     onBlur={() =>
//                       setActiveIndex(null)
//                     }
//                     onClick={() =>
//                       setActiveIndex(
//                         (previous) =>
//                           previous === index
//                             ? null
//                             : index
//                       )
//                     }
//                     className="
//                       flex items-center
//                       gap-1.5 rounded-md
//                       px-1 py-0.5
//                       text-xs
//                       text-muted-foreground
//                       transition-colors
//                       hover:text-foreground
//                     "
//                   >
//                     <span
//                       className="
//                         size-2.5
//                         shrink-0
//                         rounded-full
//                       "
//                       style={{
//                         background:
//                           PIE_COLORS[
//                             index %
//                               PIE_COLORS.length
//                           ],
//                       }}
//                     />

//                     {point.name}

//                   </button>
//                 ))}
//               </div>

//             </div>

//             {/* ===========================
//                 RIGHT — Budget Summary
//             =========================== */}

//             {budgetMode ? (

//               <dl
//                 className="
//                   space-y-3 rounded-2xl
//                   border border-border/60
//                   p-3 text-sm
//                 "
//               >

//                 {budget ? (

//                   [
//                     {
//                       label: "သုံးစွဲပြီးငွေ",
//                       value: budget.spent,
//                     },
//                     {
//                       label: "လက်ကျန်ငွေ",
//                       value:
//                         budget.funds -
//                         budget.spent,
//                     },
//                   ].map(
//                     ({ label, value }) => (
//                       <div
//                         key={label}
//                         className="
//                           flex flex-wrap
//                           justify-between gap-2
//                         "
//                       >
//                         <dt>{label}</dt>

//                         <dd
//                           className={
//                             value < 0
//                               ? "font-semibold text-red-600 dark:text-red-400"
//                               : "font-semibold"
//                           }
//                         >
//                           {formatKyat(value)}
//                         </dd>
//                       </div>
//                     )
//                   )

//                 ) : (

//                   <div className="text-muted-foreground">
//                     ရန်ပုံငွေ မသတ်မှတ်ရသေးပါ။
//                   </div>

//                 )}

//               </dl>

//             ) : (

//               /* =========================
//                  Top Products
//               ========================= */

//               <div
//                 className="
//                   min-w-0
//                   rounded-2xl
//                   border border-border/60
//                   bg-background/70
//                   p-3 backdrop-blur-sm
//                 "
//               >

//                 <div className="flex flex-wrap items-center justify-between gap-2">

//                   <div className="text-xs font-medium text-muted-foreground">
//                     {salesMode
//                       ? "ရောင်းရငွေအများဆုံး ပစ္စည်းများ"
//                       : "Top Shops"}
//                   </div>

//                   <div className="text-xs tabular-nums text-muted-foreground">
//                     {displayValue(total)}
//                   </div>

//                 </div>

//                 <div
//                   className="
//                     mt-3 max-h-[240px]
//                     space-y-2
//                     overflow-auto pr-1
//                   "
//                 >

//                   {top.length === 0 ? (

//                     <div className="text-sm text-muted-foreground">
//                       {salesMode
//                         ? "ဒီကာလမှာ ရောင်းရငွေ မရှိသေးပါ။"
//                         : "No data"}
//                     </div>

//                   ) : (

//                     top.map((point, index) => {
//                       const percentage =
//                         total > 0
//                           ? (point.value /
//                               total) *
//                             100
//                           : 0;

//                       const color =
//                         PIE_COLORS[
//                           index %
//                             PIE_COLORS.length
//                         ];

//                       return (
//                         <div
//                           key={
//                             point.id ??
//                             point.name
//                           }
//                           className="
//                             rounded-xl
//                             border border-border/50
//                             bg-background/60
//                             p-2 transition
//                             hover:bg-background/80
//                           "
//                           onMouseEnter={() =>
//                             setActiveIndex(index)
//                           }
//                           onMouseLeave={() =>
//                             setActiveIndex(null)
//                           }
//                         >

//                           <div className="flex items-center justify-between gap-2">

//                             <div className="min-w-0">

//                               <div className="truncate text-sm font-medium">
//                                 {point.name}
//                               </div>

//                               <div className="text-[11px] tabular-nums text-muted-foreground">
//                                 {percentage.toFixed(
//                                   1
//                                 )}
//                                 %
//                               </div>

//                             </div>

//                             <div className="text-sm font-semibold tabular-nums">
//                               {displayValue(
//                                 point.value
//                               )}
//                             </div>

//                           </div>

//                           {/* Progress Bar */}

//                           <div
//                             className="
//                               mt-2 h-1.5
//                               w-full overflow-hidden
//                               rounded-full bg-muted
//                             "
//                           >

//                             <div
//                               className="
//                                 h-full rounded-full
//                                 transition-[width]
//                                 duration-500
//                               "
//                               style={{
//                                 width: `${Math.min(
//                                   100,
//                                   Math.max(
//                                     0,
//                                     percentage
//                                   )
//                                 )}%`,
//                                 background: color,
//                               }}
//                             />

//                           </div>

//                         </div>
//                       );
//                     })

//                   )}

//                 </div>

//                 {/* Total Revenue */}

//                 <div
//                   className="
//                     mt-3 flex flex-wrap
//                     items-center justify-between
//                     gap-2 text-xs
//                     text-muted-foreground
//                   "
//                 >
//                   <span>{totalLabel}</span>

//                   <span className="font-medium tabular-nums text-foreground">
//                     {salesMode
//                       ? formatKyat(total)
//                       : total.toLocaleString()}
//                   </span>
//                 </div>

//               </div>

//             )}

//           </div>

//         </CardContent>

//       </div>

//     </Card>
//   );
// }












"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { formatKyat } from "@/lib/format-kyat";

import { RefreshCcw } from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

/* =========================================
   Types
========================================= */

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

type SalesPoint = {
  id: string;
  name: string;
  values: Record<SalesRange, number>;
};

type PiePoint = {
  id?: string;
  name: string;
  value: number;
};

type PieChartBoxProps = {
  sales?: SalesPoint[];
  budget?: {
    funds: number;
    spent: number;
  } | null;
};

/* =========================================
   Original Pie Chart Colors
   မူလအရောင်များ မပြောင်းပါ
========================================= */

const PIE_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

/* =========================================
   Helper Functions
========================================= */

function getShopName(row: OutcomeRow) {
  return (
    row.shop ??
    row.shop_name ??
    row.shopName ??
    row.supplier ??
    row.vendor ??
    "Unknown"
  );
}

function toNumber(value: unknown) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function sumOutcomeByShop(
  rows: OutcomeRow[]
): PiePoint[] {
  const map = new Map<string, number>();

  for (const row of rows) {
    const shop =
      String(getShopName(row)).trim() ||
      "Unknown";

    map.set(
      shop,
      (map.get(shop) ?? 0) +
        toNumber(row.amount)
    );
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
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
   Custom Tooltip
========================================= */

type CustomTooltipProps = {
  active?: boolean;

  payload?: readonly {
    name?: string;
    value?: unknown;
  }[];

  salesMode: boolean;
  budgetMode: boolean;
  total: number;
};

function CustomTooltip({
  active,
  payload,
  salesMode,
  budgetMode,
  total,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0];

  const name = point?.name ?? "";

  const value = toNumber(point?.value);

  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div
      className="
        z-[9999]
        rounded-2xl
        border border-border/60
        bg-background/95
        px-3 py-2
        shadow-xl backdrop-blur
      "
    >
      <div className="text-[11px] text-muted-foreground">
        {budgetMode
          ? "ရန်ပုံငွေ"
          : salesMode
            ? "ကုန်ပစ္စည်း"
            : "Shop"}
      </div>

      <div className="text-sm font-semibold text-foreground">
        {name}
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        {budgetMode
          ? "ငွေပမာဏ"
          : salesMode
            ? "ရောင်းရငွေ"
            : "Outcome"}
      </div>

      <div className="text-sm font-semibold tabular-nums text-foreground">
        {salesMode || budgetMode
          ? formatKyat(value)
          : value.toLocaleString()}
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
}

/* =========================================
   Main Pie Chart Component
========================================= */

export default function PieChartBox({
  sales,
  budget,
}: PieChartBoxProps) {
  const reactId = useId();

  const gradientId = `pie-${reactId.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  )}`;

  /* =======================================
     States
  ======================================= */

  const [range, setRange] =
    useState<SalesRange>(30);

  const [loading, setLoading] =
    useState(false);

  const [outcomes, setOutcomes] =
    useState<OutcomeRow[]>([]);

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [reduceMotion, setReduceMotion] =
    useState(true);

  /* =======================================
     Chart Modes
  ======================================= */

  const salesMode = sales !== undefined;

  const budgetMode = budget !== undefined;

  const liquidMode =
    salesMode && !budgetMode;

  const totalLabel = budgetMode
    ? "စုစုပေါင်းရန်ပုံငွေ"
    : salesMode
      ? "စုစုပေါင်း ရောင်းရငွေ"
      : "Total Outcome";

  const displayValue = (value: number) =>
    salesMode || budgetMode
      ? formatKyat(value)
      : niceCompact(value);

  /* =======================================
     Accessibility & Reduced Motion
  ======================================= */

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const printMedia =
      window.matchMedia("print");

    const update = () => {
      setReduceMotion(
        media.matches ||
        printMedia.matches
      );
    };

    update();

    media.addEventListener(
      "change",
      update
    );

    printMedia.addEventListener(
      "change",
      update
    );

    return () => {
      media.removeEventListener(
        "change",
        update
      );

      printMedia.removeEventListener(
        "change",
        update
      );
    };
  }, []);

  /* =======================================
     Fetch Outcome Data
  ======================================= */

  const fetchOutcome = useCallback(
    async () => {
      setLoading(true);

      try {
        const response = await fetch(
          "/api/outcome",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Request failed: ${response.status}`
          );
        }

        const json = await response.json();

        setOutcomes(
          Array.isArray(json)
            ? json
            : []
        );

        setActiveIndex(null);
        setSelectedIndex(null);

      } catch (error) {
        console.error(
          "Could not load outcomes",
          error
        );

      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!salesMode && !budgetMode) {
      void fetchOutcome();
    }
  }, [
    salesMode,
    budgetMode,
    fetchOutcome,
  ]);

  /* =======================================
     Real Chart Data
  ======================================= */

  const data = useMemo<PiePoint[]>(() => {
    if (budgetMode) {
      return [
        {
          name: "သုံးစွဲပြီးငွေ",

          value: Math.min(
            budget?.spent ?? 0,
            budget?.funds ?? 0
          ),
        },

        {
          name: "လက်ကျန်ငွေ",

          value:
            (budget?.funds ?? 0) -
            (budget?.spent ?? 0),
        },
      ].filter(({ value }) => value > 0);
    }

    if (sales) {
      return sales
        .map(({ id, name, values }) => ({
          id,
          name,
          value: toNumber(values[range]),
        }))
        .filter(({ value }) => value > 0)
        .sort(
          (a, b) => b.value - a.value
        );
    }

    return sumOutcomeByShop(outcomes);

  }, [
    budget,
    budgetMode,
    outcomes,
    range,
    sales,
  ]);

  /* =======================================
     Total & Top Products
  ======================================= */

  const total = useMemo(
    () =>
      data.reduce(
        (sum, point) =>
          sum + point.value,
        0
      ),
    [data]
  );

  const top = useMemo(
    () => data.slice(0, 4),
    [data]
  );

  /* =======================================
     Active Product

     Hover = temporary selection
     Click = persistent selection
  ======================================= */

  const currentIndex =
    activeIndex ?? selectedIndex;

  const active =
    currentIndex !== null
      ? data[currentIndex] ?? null
      : null;

  const activePercentage =
    active && total > 0
      ? (active.value / total) * 100
      : null;

  /* =======================================
     Center Card Animation

     Sales Chart only
     Stop when product is selected
  ======================================= */

  const animateCenterCard =
    liquidMode &&
    !active &&
    !reduceMotion;

  function toggleProduct(index: number) {
    setSelectedIndex((previous) =>
      previous === index
        ? null
        : index
    );
  }

  /* =======================================
     Render
  ======================================= */

  return (
    <Card
      className="
        group relative
        h-full min-w-0
        overflow-visible
        rounded-2xl
        border border-border/60
        bg-gradient-to-b
        from-background to-muted/20
        report-chart-depth
        transition-all duration-300
        hover:shadow-lg
        hover:border-border
      "
    >
      <div className="relative rounded-2xl">

        {/* =================================
            Background Glow
        ================================= */}

        <div
          className="
            pointer-events-none
            absolute inset-0
            overflow-hidden
            rounded-2xl
          "
        >
          <div
            className="
              absolute -top-24 -right-24
              h-56 w-56 rounded-full
              bg-primary/10 blur-3xl
              opacity-60
            "
          />

          <div
            className="
              absolute -bottom-24 -left-24
              h-56 w-56 rounded-full
              bg-primary/10 blur-3xl
              opacity-40
            "
          />
        </div>

        {/* =================================
            Card Header
        ================================= */}

        <CardHeader
          className="
            relative flex flex-wrap
            items-start justify-between
            gap-3 pb-2
          "
        >
          <div className="min-w-0">

            <CardTitle className="text-sm font-semibold tracking-wide">
              {budgetMode
                ? "ကုန်ဝယ်ရန်ပုံငွေ"
                : salesMode
                  ? "ကုန်ပစ္စည်းအလိုက် ရောင်းရငွေအချိုး"
                  : "Outcome by Shop"}
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              {budgetMode
                ? "ရန်ပုံငွေထဲမှ သုံးပြီးငွေနှင့် လက်ကျန်အချိုး"
                : salesMode
                  ? "ရွေးထားတဲ့ကာလအတွင်း ရောင်းရငွေအလိုက်"
                  : "Hover slice to see details"}
            </p>

          </div>

          {/* ===============================
              Header Actions
          =============================== */}

          {budgetMode ? (

            <Link
              href="/dashboard/purchase-budget"
              className="
                text-sm text-blue-600
                underline dark:text-blue-400
              "
            >
              စာရင်းကြည့်ရန်
            </Link>

          ) : salesMode ? (

            <div
              role="group"
              aria-label="ရက်အပိုင်းအခြား"
              className="flex flex-wrap gap-1.5"
            >
              {salesRanges.map((days) => (
                <Button
                  key={days}
                  type="button"
                  size="sm"
                  variant={
                    range === days
                      ? "default"
                      : "outline"
                  }
                  aria-pressed={
                    range === days
                  }
                  onClick={() => {
                    setRange(days);
                    setActiveIndex(null);
                    setSelectedIndex(null);
                  }}
                >
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
              <RefreshCcw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </Button>

          )}
        </CardHeader>

        {/* =================================
            Card Content
        ================================= */}

        <CardContent className="relative min-w-0 pt-2">

          <div
            className="
              grid min-w-0 gap-3
              2xl:grid-cols-[minmax(0,1fr)_190px]
            "
          >

            {/* =============================
                LEFT — Pie Chart
            ============================= */}

            <div className="min-w-0">

              <div
                className="
                  product-liquid-pie
                  relative
                  h-[280px]
                  w-full min-w-0
                "
                style={{
                  width: "100%",
                  height: 280,
                  minWidth: 0,
                }}
              >

                {data.length > 0 &&
                total > 0 ? (

                  <>

                    {/* =====================
                        Center Revenue Card

                        Card တစ်ခုလုံး
                        Fade Out / Fade In
                    ===================== */}

                    <div
                      className="
                        pointer-events-none
                        absolute inset-0
                        z-10 grid
                        place-items-center
                      "
                    >
                      <div
                        className={`
                          max-w-[48%]
                          rounded-xl
                          border border-border/60
                          bg-background/70
                          px-3 py-2
                          text-center
                          shadow-sm
                          backdrop-blur
                          ${
                            animateCenterCard
                              ? "liquid-pie-center-active"
                              : ""
                          }
                        `}
                      >

                        {/* Center Title */}

                        <div
                          className="
                            truncate
                            text-[11px]
                            text-muted-foreground
                          "
                        >
                          {active
                            ? active.name
                            : totalLabel}
                        </div>

                        {/* Revenue Amount */}

                        <div
                          className="
                            break-words
                            text-sm
                            font-semibold
                            tabular-nums
                          "
                        >
                          {displayValue(
                            active
                              ? active.value
                              : total
                          )}
                        </div>

                        {/* Percentage */}

                        {activePercentage !==
                          null && (

                          <div className="mt-1 text-xs text-muted-foreground">

                            {activePercentage.toFixed(
                              1
                            )}
                            %

                          </div>

                        )}

                      </div>
                    </div>

                    {/* =====================
                        Original Pie Chart
                    ===================== */}

                    <ResponsiveContainer
                      width="100%"
                      height={280}
                      minWidth={0}
                    >

                      <PieChart>

                        {/* =================
                            Original Liquid
                            Gradient Colors
                        ================= */}

                        {liquidMode && (

                          <defs>

                            {PIE_COLORS.map(
                              (color, index) => {
                                const direction =
                                  index % 2 === 0
                                    ? 1
                                    : -1;

                                return (
                                  <linearGradient
                                    key={index}
                                    id={`${gradientId}-liquid-${index}`}
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                  >

                                    <stop
                                      offset="0%"
                                      stopColor={`color-mix(
                                        in srgb,
                                        ${color} 65%,
                                        #000000
                                      )`}
                                    />

                                    <stop
                                      offset="30%"
                                      stopColor={color}
                                    />

                                    <stop
                                      offset="58%"
                                      stopColor={`color-mix(
                                        in srgb,
                                        ${color} 65%,
                                        #ffffff
                                      )`}
                                    />

                                    <stop
                                      offset="75%"
                                      stopColor={`color-mix(
                                        in srgb,
                                        ${color} 80%,
                                        #ffffff
                                      )`}
                                    />

                                    <stop
                                      offset="100%"
                                      stopColor={color}
                                    />

                                    {!reduceMotion && (

                                      <animateTransform
                                        attributeName="gradientTransform"
                                        type="rotate"
                                        values={`0 .5 .5;${25 * direction} .5 .5;${-10 * direction} .5 .5;${3 * direction} .5 .5;0 .5 .5;0 .5 .5`}
                                        keyTimes="0;0.12;0.22;0.32;0.4;1"
                                        calcMode="spline"
                                        keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                                        dur="5s"
                                        repeatCount="indefinite"
                                      />

                                    )}

                                  </linearGradient>
                                );
                              }
                            )}

                          </defs>

                        )}

                        {/* =================
                            Tooltip
                        ================= */}

                        <Tooltip
                          content={
                            <CustomTooltip
                              salesMode={
                                salesMode
                              }
                              budgetMode={
                                budgetMode
                              }
                              total={total}
                            />
                          }
                          wrapperStyle={{
                            zIndex: 9999,
                          }}
                          allowEscapeViewBox={{
                            x: true,
                            y: true,
                          }}
                        />

                        {/* =================
                            Pie Slices

                            မူလ Size နှင့်
                            Color မပြောင်းပါ
                        ================= */}

                        <Pie
                          className={
                            liquidMode
                              ? "product-liquid-pie-ring"
                              : "report-donut-depth"
                          }
                          data={data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="56%"
                          outerRadius="82%"
                          paddingAngle={2}
                          stroke="var(--background)"
                          strokeWidth={2}
                          isAnimationActive={false}
                          onMouseEnter={(
                            _,
                            index
                          ) =>
                            setActiveIndex(index)
                          }
                          onMouseLeave={() =>
                            setActiveIndex(null)
                          }
                          onClick={(_, index) =>
                            toggleProduct(index)
                          }
                        >

                          {data.map(
                            (point, index) => {
                              const colorIndex =
                                index %
                                PIE_COLORS.length;

                              const color =
                                PIE_COLORS[
                                  colorIndex
                                ];

                              return (
                                <Cell
                                  key={
                                    point.id ??
                                    `${point.name}-${index}`
                                  }
                                  fill={
                                    liquidMode
                                      ? `url(#${gradientId}-liquid-${colorIndex})`
                                      : color
                                  }
                                  opacity={
                                    currentIndex ===
                                    null
                                      ? 0.98
                                      : currentIndex ===
                                          index
                                        ? 1
                                        : 0.4
                                  }
                                  style={{
                                    filter: `drop-shadow(
                                      0 2px
                                      ${
                                        currentIndex ===
                                        index
                                          ? 5
                                          : 2
                                      }px
                                      ${color}
                                    )`,

                                    transition:
                                      "opacity 200ms ease",
                                  }}
                                />
                              );
                            }
                          )}

                        </Pie>

                      </PieChart>

                    </ResponsiveContainer>

                  </>

                ) : (

                  /* =======================
                     Empty State
                  ======================= */

                  <div className="grid h-full place-items-center text-center">

                    <p className="text-sm text-muted-foreground">

                      {salesMode
                        ? "ဒီကာလမှာ ရောင်းရငွေ မရှိသေးပါ။"
                        : "ပြရန် စာရင်းမရှိသေးပါ။"}

                    </p>

                  </div>

                )}

              </div>

              {/* ===========================
                  Original Color Legend
              =========================== */}

              <div
                className="
                  flex flex-wrap
                  items-center
                  justify-center
                  gap-x-3 gap-y-2
                "
              >
                {data.map((point, index) => (

                  <button
                    key={
                      point.id ??
                      `${point.name}-${index}`
                    }
                    type="button"
                    aria-pressed={
                      selectedIndex === index
                    }
                    onMouseEnter={() =>
                      setActiveIndex(index)
                    }
                    onMouseLeave={() =>
                      setActiveIndex(null)
                    }
                    onFocus={() =>
                      setActiveIndex(index)
                    }
                    onBlur={() =>
                      setActiveIndex(null)
                    }
                    onClick={() =>
                      toggleProduct(index)
                    }
                    className="
                      flex items-center
                      gap-1.5 rounded-md
                      px-1 py-0.5
                      text-xs
                      text-muted-foreground
                      transition-colors
                      hover:text-foreground
                    "
                  >

                    <span
                      className="
                        size-2.5
                        shrink-0
                        rounded-full
                      "
                      style={{
                        background:
                          PIE_COLORS[
                            index %
                              PIE_COLORS.length
                          ],
                      }}
                    />

                    {point.name}

                  </button>

                ))}
              </div>

              {/* Clear Product Selection */}

              {selectedIndex !== null && (
                <div className="mt-2 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      setSelectedIndex(null);
                      setActiveIndex(null);
                    }}
                  >
                    စုစုပေါင်း ပြန်ကြည့်ရန်
                  </Button>
                </div>
              )}

            </div>

            {/* =============================
                RIGHT — Budget Summary
            ============================= */}

            {budgetMode ? (

              <dl
                className="
                  space-y-3 rounded-2xl
                  border border-border/60
                  p-3 text-sm
                "
              >

                {budget ? (

                  [
                    {
                      label: "သုံးစွဲပြီးငွေ",
                      value: budget.spent,
                    },

                    {
                      label: "လက်ကျန်ငွေ",
                      value:
                        budget.funds -
                        budget.spent,
                    },

                  ].map(
                    ({ label, value }) => (

                      <div
                        key={label}
                        className="
                          flex flex-wrap
                          justify-between
                          gap-2
                        "
                      >

                        <dt>{label}</dt>

                        <dd
                          className={
                            value < 0
                              ? "font-semibold text-red-600 dark:text-red-400"
                              : "font-semibold"
                          }
                        >

                          {formatKyat(value)}

                        </dd>

                      </div>

                    )
                  )

                ) : (

                  <div className="text-muted-foreground">
                    ရန်ပုံငွေ မသတ်မှတ်ရသေးပါ။
                  </div>

                )}

              </dl>

            ) : (

              /* ===========================
                 Top Products List
              =========================== */

              <div
                className="
                  min-w-0
                  rounded-2xl
                  border border-border/60
                  bg-background/70
                  p-3 backdrop-blur-sm
                "
              >

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <div className="text-xs font-medium text-muted-foreground">

                    {salesMode
                      ? "ရောင်းရငွေအများဆုံး ပစ္စည်းများ"
                      : "Top Shops"}

                  </div>

                  <div className="text-xs tabular-nums text-muted-foreground">

                    {displayValue(total)}

                  </div>

                </div>

                {/* =========================
                    Top Product Rows
                ========================= */}

                <div
                  className="
                    mt-3 max-h-[240px]
                    space-y-2
                    overflow-auto pr-1
                  "
                >

                  {top.length === 0 ? (

                    <div className="text-sm text-muted-foreground">

                      {salesMode
                        ? "ဒီကာလမှာ ရောင်းရငွေ မရှိသေးပါ။"
                        : "No data"}

                    </div>

                  ) : (

                    top.map((point, index) => {

                      const percentage =
                        total > 0
                          ? (point.value /
                              total) * 100
                          : 0;

                      const color =
                        PIE_COLORS[
                          index %
                            PIE_COLORS.length
                        ];

                      return (
                        <button
                          key={
                            point.id ??
                            point.name
                          }
                          type="button"
                          aria-pressed={
                            selectedIndex === index
                          }
                          className="
                            block w-full
                            rounded-xl
                            border border-border/50
                            bg-background/60
                            p-2 text-left
                            transition
                            hover:bg-background/80
                          "
                          onMouseEnter={() =>
                            setActiveIndex(index)
                          }
                          onMouseLeave={() =>
                            setActiveIndex(null)
                          }
                          onFocus={() =>
                            setActiveIndex(index)
                          }
                          onBlur={() =>
                            setActiveIndex(null)
                          }
                          onClick={() =>
                            toggleProduct(index)
                          }
                        >

                          <div className="flex items-center justify-between gap-2">

                            <div className="min-w-0">

                              <div className="truncate text-sm font-medium">

                                {point.name}

                              </div>

                              <div className="text-[11px] tabular-nums text-muted-foreground">

                                {percentage.toFixed(
                                  1
                                )}
                                %

                              </div>

                            </div>

                            <div className="text-sm font-semibold tabular-nums">

                              {displayValue(
                                point.value
                              )}

                            </div>

                          </div>

                          {/* Progress Bar */}

                          <div
                            className="
                              mt-2 h-1.5
                              w-full
                              overflow-hidden
                              rounded-full
                              bg-muted
                            "
                          >

                            <div
                              className="
                                h-full
                                rounded-full
                                transition-[width]
                                duration-500
                              "
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    percentage
                                  )
                                )}%`,

                                background: color,
                              }}
                            />

                          </div>

                        </button>
                      );
                    })

                  )}

                </div>

                {/* =========================
                    Total Revenue
                ========================= */}

                <div
                  className="
                    mt-3 flex flex-wrap
                    items-center
                    justify-between
                    gap-2 text-xs
                    text-muted-foreground
                  "
                >

                  <span>{totalLabel}</span>

                  <span className="font-medium tabular-nums text-foreground">

                    {salesMode
                      ? formatKyat(total)
                      : total.toLocaleString()}

                  </span>

                </div>

              </div>

            )}

          </div>

        </CardContent>

      </div>

    </Card>
  );
}
