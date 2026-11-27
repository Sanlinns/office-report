// "use client";

// import { useId } from "react";
// import Link from "next/link";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { formatKyat } from "@/lib/format-kyat";

// type Budget = {
//   funds: number;
//   spent: number;
// };

// type LiquidColors = {
//   light: string;
//   bright: string;
//   middle: string;
//   deep: string;
// };

// const SOLAR_GOLD: LiquidColors = {
//   light: "#fef3c7",
//   bright: "#fbbf24",
//   middle: "#b45309",
//   deep: "#451a03",
// };

// const MIDNIGHT_GALAXY: LiquidColors = {
//   light: "#c4b5fd",
//   bright: "#818cf8",
//   middle: "#4338ca",
//   deep: "#172554",
// };

// type LiquidTankProps = {
//   label: string;
//   amount: number;
//   percentage: number | null;
//   colors: LiquidColors;
// };

// function LiquidTank({
//   label,
//   amount,
//   percentage,
//   colors,
// }: LiquidTankProps) {
//   const id = useId();

//   const level = Math.min(
//     100,
//     Math.max(0, percentage ?? 0)
//   );

//   const waterY = 160 - level * 1.55;

//   const isFull = level >= 100;

//   const amplitude = Math.min(
//     2.5,
//     level * 0.2,
//     (100 - level) * 0.2
//   );

//   // Soft capsule glass shape
//   const capsule = {
//     x: 8,
//     y: 5,
//     width: 94,
//     height: 155,
//     rx: 47,
//   };

//   // Small and subtle liquid surface
//   const wave = (y: number, curve: number) =>
//     `M -60 ${y}
//      Q -2.5 ${y - curve} 55 ${y}
//      T 170 ${y}
//      V 220
//      H -60
//      Z`;

//   return (
//     <div className="budget-liquid-item">

//       <div className="budget-liquid-tank">

//         <svg
//           viewBox="0 0 110 165"
//           className="budget-liquid-svg"
//           aria-hidden="true"
//         >
//           <defs>
//             {/* Capsule clipping */}

//             <clipPath id={`${id}-clip`}>
//               <rect {...capsule} />
//             </clipPath>

//             {/* Galaxy liquid gradient */}

//             <linearGradient
//               id={`${id}-liquid`}
//               x1="10%"
//               y1="0%"
//               x2="85%"
//               y2="100%"
//             >
//               <stop
//                 offset="0%"
//                 stopColor={colors.light}
//               />

//               <stop
//                 offset="22%"
//                 stopColor={colors.bright}
//               />

//               <stop
//                 offset="65%"
//                 stopColor={colors.middle}
//               />

//               <stop
//                 offset="100%"
//                 stopColor={colors.deep}
//               />
//             </linearGradient>

//             {/* Glass reflection */}

//             <linearGradient
//               id={`${id}-glass`}
//               x1="0%"
//               y1="0%"
//               x2="100%"
//               y2="0%"
//             >
//               <stop
//                 offset="0%"
//                 stopColor="white"
//                 stopOpacity={0.22}
//               />

//               <stop
//                 offset="20%"
//                 stopColor="white"
//                 stopOpacity={0.06}
//               />

//               <stop
//                 offset="50%"
//                 stopColor="white"
//                 stopOpacity={0}
//               />

//               <stop
//                 offset="85%"
//                 stopColor={colors.middle}
//                 stopOpacity={0.05}
//               />

//               <stop
//                 offset="100%"
//                 stopColor={colors.deep}
//                 stopOpacity={0.18}
//               />
//             </linearGradient>

//             {/* Internal soft lighting */}

//             <radialGradient
//               id={`${id}-glow`}
//               cx="30%"
//               cy="25%"
//               r="80%"
//             >
//               <stop
//                 offset="0%"
//                 stopColor={colors.light}
//                 stopOpacity={0.25}
//               />

//               <stop
//                 offset="100%"
//                 stopColor={colors.bright}
//                 stopOpacity={0}
//               />
//             </radialGradient>
//           </defs>

//           {/* Empty glass */}

//           <rect
//             {...capsule}
//             className="budget-liquid-glass-bg"
//           />

//           <rect
//             {...capsule}
//             fill={colors.bright}
//             opacity={0.045}
//           />

//           <g clipPath={`url(#${id}-clip)`}>

//             {level > 0 && (
//               <g
//                 className="budget-liquid-level"
//                 style={{
//                   transform: `translateY(${waterY}px)`,
//                 }}
//               >

//                 {/* Back liquid surface */}

//                 <g
//                   className={
//                     isFull
//                       ? undefined
//                       : "budget-liquid-wave-back"
//                   }
//                 >
//                   <path
//                     d={wave(
//                       isFull ? -12 : -2,
//                       amplitude
//                     )}
//                     fill={colors.light}
//                     opacity={0.7}
//                   />
//                 </g>

//                 {/* Main liquid */}

//                 <g
//                   className={
//                     isFull
//                       ? undefined
//                       : "budget-liquid-wave-front"
//                   }
//                 >
//                   <path
//                     d={wave(
//                       isFull ? -12 : 0,
//                       -amplitude
//                     )}
//                     fill={`url(#${id}-liquid)`}
//                   />

//                   {/* Liquid inner lighting */}

//                   <path
//                     d={wave(
//                       isFull ? -12 : 0,
//                       -amplitude
//                     )}
//                     fill={`url(#${id}-glow)`}
//                   />

//                   {/* Thin liquid surface reflection */}

//                   {!isFull && (
//                     <path
//                       d={`
//                         M -60 0
//                         Q -2.5 ${amplitude} 55 0
//                         T 170 0
//                       `}
//                       fill="none"
//                       stroke={colors.light}
//                       strokeWidth="0.8"
//                       opacity="0.65"
//                     />
//                   )}
//                 </g>

//               </g>
//             )}

//             {/* Glass depth */}

//             <rect
//               {...capsule}
//               fill={`url(#${id}-glass)`}
//             />

//             {/* Upper curved glass reflection */}

//             <path
//               d="M 20 50 Q 20 23 42 17"
//               stroke="white"
//               strokeWidth="3.5"
//               strokeLinecap="round"
//               fill="none"
//               opacity={0.55}
//             />

//             {/* Side reflection */}

//             <rect
//               x="19"
//               y="60"
//               width="2.5"
//               height="58"
//               rx="1.25"
//               fill="white"
//               opacity={0.22}
//             />

//             {/* Bottom glass reflection */}

//             <path
//               d="M 34 148 Q 55 157 76 148"
//               fill="none"
//               stroke={colors.light}
//               strokeWidth="1.4"
//               strokeLinecap="round"
//               opacity={0.35}
//             />

//           </g>

//           {/* Glass outline */}

//           <rect
//             {...capsule}
//             fill="none"
//             stroke={colors.bright}
//             strokeWidth="1"
//             strokeOpacity={0.45}
//           />

//         </svg>

//         {/* Percentage */}

//         <div className="budget-liquid-percentage">
//           <span className="budget-liquid-percentage-badge">
//             {percentage === null
//               ? "—"
//               : `${percentage.toFixed(1)}%`}
//           </span>
//         </div>

//       </div>

//       {/* Liquid label */}

//       <div className="budget-liquid-label">

//         <span
//           className="budget-liquid-dot"
//           style={{
//             background: `linear-gradient(
//               135deg,
//               ${colors.light},
//               ${colors.bright},
//               ${colors.middle}
//             )`,
//           }}
//         />

//         <span>{label}</span>

//       </div>

//       {/* Actual amount */}

//       <div
//         className={`w-full break-words text-sm font-semibold tabular-nums ${
//           amount < 0
//             ? "text-red-600 dark:text-red-400"
//             : ""
//         }`}
//       >
//         {formatKyat(amount)}
//       </div>

//     </div>
//   );
// }

// export default function BudgetLiquidChart({
//   budget,
// }: {
//   budget: Budget | null;
// }) {
//   const funds = budget?.funds ?? 0;

//   const spent = budget?.spent ?? 0;

//   const remaining = funds - spent;

//   const spentPercentage =
//     funds > 0
//       ? (spent / funds) * 100
//       : null;

//   const remainingPercentage =
//     funds > 0
//       ? (remaining / funds) * 100
//       : null;

//   return (
//     <Card
//       className="
//         report-chart-depth
//         relative h-full min-w-0
//         gap-3
//         rounded-2xl border-border/60
//         bg-gradient-to-b
//         from-background to-muted/20
//       "
//     >
//       <CardHeader
//         className="
//           flex flex-wrap
//           items-start justify-between
//           gap-2 pb-2
//         "
//       >
//         <div className="min-w-0">
//           <CardTitle className="text-sm font-semibold">
//             ကုန်ဝယ်ရန်ပုံငွေ
//           </CardTitle>

//           <p className="mt-1 text-xs text-muted-foreground">
//             ရန်ပုံငွေထဲမှ သုံးပြီးငွေနှင့် လက်ကျန်အချိုး
//           </p>
//         </div>

//         <Link
//           href="/dashboard/purchase-budget"
//           className="
//             text-xs text-blue-600
//             underline dark:text-blue-400
//           "
//         >
//           စာရင်းကြည့်ရန်
//         </Link>
//       </CardHeader>

//       <CardContent className="space-y-3">

//         {!budget ? (
//           <p className="py-10 text-center text-sm text-muted-foreground">
//             ရန်ပုံငွေ မသတ်မှတ်ရသေးပါ။
//           </p>
//         ) : (
//           <>

//             {/* Total budget */}

//             <div className="space-y-1 text-center">

//               <p className="text-xs text-muted-foreground">
//                 စုစုပေါင်းရန်ပုံငွေ
//               </p>

//               <h2 className="break-words text-xl font-bold tabular-nums">
//                 {formatKyat(funds)}
//               </h2>

//             </div>

//             {/* Solar Gold & Midnight Galaxy */}

//             <div className="budget-liquid-grid">

//               <LiquidTank
//                 label="သုံးစွဲပြီးငွေ"
//                 amount={spent}
//                 percentage={spentPercentage}
//                 colors={SOLAR_GOLD}
//               />

//               <LiquidTank
//                 label="လက်ကျန်ငွေ"
//                 amount={remaining}
//                 percentage={remainingPercentage}
//                 colors={MIDNIGHT_GALAXY}
//               />

//             </div>

//             {funds <= 0 && (
//               <p className="text-center text-xs text-muted-foreground">
//                 ရန်ပုံငွေ အပေါင်းတန်ဖိုးမရှိသဖြင့်
//                 ရာခိုင်နှုန်း မတွက်နိုင်ပါ။
//               </p>
//             )}

//             {remaining < 0 && (
//               <div
//                 className="
//                   rounded-xl
//                   border border-red-500/20
//                   bg-red-500/10 p-3
//                 "
//               >
//                 <p className="text-xs font-medium text-red-600 dark:text-red-400">
//                   ရန်ပုံငွေထက် ပိုမိုသုံးစွဲထားပါသည်။
//                 </p>

//                 <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
//                   လိုငွေ — {formatKyat(Math.abs(remaining))}
//                 </p>
//               </div>
//             )}

//           </>
//         )}

//       </CardContent>
//     </Card>
//   );
// }





"use client";

import { useId } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatKyat } from "@/lib/format-kyat";

type Budget = {
  funds: number;
  spent: number;
};

type LiquidColors = {
  light: string;
  bright: string;
  middle: string;
  deep: string;
};

const SOLAR_GOLD: LiquidColors = {
  light: "#fef3c7",
  bright: "#fbbf24",
  middle: "#b45309",
  deep: "#451a03",
};

const MIDNIGHT_GALAXY: LiquidColors = {
  light: "#c4b5fd",
  bright: "#818cf8",
  middle: "#4338ca",
  deep: "#172554",
};

type LiquidTankProps = {
  label: string;
  amount: number;
  percentage: number | null;
  colors: LiquidColors;
};

function LiquidTank({
  label,
  amount,
  percentage,
  colors,
}: LiquidTankProps) {
  const id = useId();

  const level = Math.min(
    100,
    Math.max(0, percentage ?? 0)
  );

  const waterY = 160 - level * 1.55;

  const isFull = level >= 100;

  const amplitude = Math.min(
    2.5,
    level * 0.2,
    (100 - level) * 0.2
  );

  // Soft capsule glass shape
  const capsule = {
    x: 8,
    y: 5,
    width: 94,
    height: 155,
    rx: 47,
  };

  // Small and subtle liquid surface
  const wave = (y: number, curve: number) =>
    `M -60 ${y}
     Q -2.5 ${y - curve} 55 ${y}
     T 170 ${y}
     V 220
     H -60
     Z`;

  return (
    <div className="budget-liquid-item">

      <div className="budget-liquid-tank">

        <svg
          viewBox="0 0 110 165"
          className="budget-liquid-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Capsule clipping */}

            <clipPath id={`${id}-clip`}>
              <rect {...capsule} />
            </clipPath>

            {/* Galaxy liquid gradient */}

            <linearGradient
              id={`${id}-liquid`}
              x1="10%"
              y1="0%"
              x2="85%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={colors.light}
              />

              <stop
                offset="22%"
                stopColor={colors.bright}
              />

              <stop
                offset="65%"
                stopColor={colors.middle}
              />

              <stop
                offset="100%"
                stopColor={colors.deep}
              />
            </linearGradient>

            {/* Glass reflection */}

            <linearGradient
              id={`${id}-glass`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor="white"
                stopOpacity={0.22}
              />

              <stop
                offset="20%"
                stopColor="white"
                stopOpacity={0.06}
              />

              <stop
                offset="50%"
                stopColor="white"
                stopOpacity={0}
              />

              <stop
                offset="85%"
                stopColor={colors.middle}
                stopOpacity={0.05}
              />

              <stop
                offset="100%"
                stopColor={colors.deep}
                stopOpacity={0.18}
              />
            </linearGradient>

            {/* Internal soft lighting */}

            <radialGradient
              id={`${id}-glow`}
              cx="30%"
              cy="25%"
              r="80%"
            >
              <stop
                offset="0%"
                stopColor={colors.light}
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor={colors.bright}
                stopOpacity={0}
              />
            </radialGradient>
          </defs>

          {/* Empty glass */}

          <rect
            {...capsule}
            className="budget-liquid-glass-bg"
          />

          <rect
            {...capsule}
            fill={colors.bright}
            opacity={0.045}
          />

          <g clipPath={`url(#${id}-clip)`}>

            {level > 0 && (
              <g
                className="budget-liquid-level"
                style={{
                  transform: `translateY(${waterY}px)`,
                }}
              >

                {/* Back liquid surface */}

                <g
                  className={
                    isFull
                      ? undefined
                      : "budget-liquid-wave-back"
                  }
                >
                  <path
                    d={wave(
                      isFull ? -12 : -2,
                      amplitude
                    )}
                    fill={colors.light}
                    opacity={0.7}
                  />
                </g>

                {/* Main liquid */}

                <g
                  className={
                    isFull
                      ? undefined
                      : "budget-liquid-wave-front"
                  }
                >
                  <path
                    d={wave(
                      isFull ? -12 : 0,
                      -amplitude
                    )}
                    fill={`url(#${id}-liquid)`}
                  />

                  {/* Liquid inner lighting */}

                  <path
                    d={wave(
                      isFull ? -12 : 0,
                      -amplitude
                    )}
                    fill={`url(#${id}-glow)`}
                  />

                  {/* Thin liquid surface reflection */}

                  {!isFull && (
                    <path
                      d={`
                        M -60 0
                        Q -2.5 ${amplitude} 55 0
                        T 170 0
                      `}
                      fill="none"
                      stroke={colors.light}
                      strokeWidth="0.8"
                      opacity="0.65"
                    />
                  )}
                </g>

              </g>
            )}

            {/* Glass depth */}

            <rect
              {...capsule}
              fill={`url(#${id}-glass)`}
            />

            {/* Upper curved glass reflection */}

            <path
              d="M 20 50 Q 20 23 42 17"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity={0.55}
            />

            {/* Side reflection */}

            <rect
              x="19"
              y="60"
              width="2.5"
              height="58"
              rx="1.25"
              fill="white"
              opacity={0.22}
            />

            {/* Bottom glass reflection */}

            <path
              d="M 34 148 Q 55 157 76 148"
              fill="none"
              stroke={colors.light}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={0.35}
            />

          </g>

          {/* Glass outline */}

          <rect
            {...capsule}
            fill="none"
            stroke={colors.bright}
            strokeWidth="1"
            strokeOpacity={0.45}
          />

        </svg>

        {/* Percentage */}

        <div className="budget-liquid-percentage">
          <span className="budget-liquid-percentage-badge">
            {percentage === null
              ? "—"
              : `${percentage.toFixed(1)}%`}
          </span>
        </div>

      </div>

      {/* Liquid label */}

      <div className="budget-liquid-label">

        <span
          className="budget-liquid-dot"
          style={{
            background: `linear-gradient(
              135deg,
              ${colors.light},
              ${colors.bright},
              ${colors.middle}
            )`,
          }}
        />

        <span>{label}</span>

      </div>

      {/* Actual amount */}

      <div
        className={`w-full break-words text-sm font-semibold tabular-nums ${
          amount < 0
            ? "text-red-600 dark:text-red-400"
            : ""
        }`}
      >
        {formatKyat(amount)}
      </div>

    </div>
  );
}

export default function BudgetLiquidChart({
  budget,
  detailsHref = "/dashboard/purchase-budget",
}: {
  budget: Budget | null;
  detailsHref?: string;
}) {
  const funds = budget?.funds ?? 0;

  const spent = budget?.spent ?? 0;

  const remaining = funds - spent;

  const spentPercentage =
    funds > 0
      ? (spent / funds) * 100
      : null;

  const remainingPercentage =
    funds > 0
      ? (remaining / funds) * 100
      : null;

  return (
    <Card
      className="
        report-chart-depth
        relative h-full min-w-0
        gap-3
        rounded-2xl border-border/60
        bg-gradient-to-b
        from-background to-muted/20
      "
    >
      <CardHeader
        className="
          flex flex-wrap
          items-start justify-between
          gap-2 pb-2
        "
      >
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold">
            ကုန်ဝယ်ရန်ပုံငွေ
          </CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            ရန်ပုံငွေထဲမှ သုံးပြီးငွေနှင့် လက်ကျန်အချိုး
          </p>
        </div>

        <Link
          href={detailsHref}
          prefetch={false}
          className="
            text-xs text-blue-600
            underline dark:text-blue-400
          "
        >
          စာရင်းကြည့်ရန်
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">

        {!budget ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            ရန်ပုံငွေ မသတ်မှတ်ရသေးပါ။
          </p>
        ) : (
          <>

            {/* Total budget */}

            <div className="space-y-1 text-center">

              <p className="text-xs text-muted-foreground">
                စုစုပေါင်းရန်ပုံငွေ
              </p>

              <h2 className="break-words text-xl font-bold tabular-nums">
                {formatKyat(funds)}
              </h2>

            </div>

            {/* Solar Gold & Midnight Galaxy */}

            <div className="budget-liquid-grid">

              <LiquidTank
                label="သုံးစွဲပြီးငွေ"
                amount={spent}
                percentage={spentPercentage}
                colors={SOLAR_GOLD}
              />

              <LiquidTank
                label="လက်ကျန်ငွေ"
                amount={remaining}
                percentage={remainingPercentage}
                colors={MIDNIGHT_GALAXY}
              />

            </div>

            {funds <= 0 && (
              <p className="text-center text-xs text-muted-foreground">
                ရန်ပုံငွေ အပေါင်းတန်ဖိုးမရှိသဖြင့်
                ရာခိုင်နှုန်း မတွက်နိုင်ပါ။
              </p>
            )}

            {remaining < 0 && (
              <div
                className="
                  rounded-xl
                  border border-red-500/20
                  bg-red-500/10 p-3
                "
              >
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  ရန်ပုံငွေထက် ပိုမိုသုံးစွဲထားပါသည်။
                </p>

                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  လိုငွေ — {formatKyat(Math.abs(remaining))}
                </p>
              </div>
            )}

          </>
        )}

      </CardContent>
    </Card>
  );
}