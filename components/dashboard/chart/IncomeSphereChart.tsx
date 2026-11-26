"use client";

import { useId } from "react";
import { formatKyat } from "@/lib/format-kyat";

type SphereColors = {
  light: string;
  bright: string;
  middle: string;
  deep: string;
};

const SOLAR_GOLD: SphereColors = {
  light: "#fef3c7",
  bright: "#fbbf24",
  middle: "#b45309",
  deep: "#451a03",
};

const MIDNIGHT_GALAXY: SphereColors = {
  light: "#c4b5fd",
  bright: "#818cf8",
  middle: "#4338ca",
  deep: "#172554",
};

type LiquidSphereProps = {
  label: string;
  amount: number;
  percentage: number | null;
  colors: SphereColors;
};

type IncomeSphereChartProps = {
  income: number;
  expense: number;
};

const CENTER = 75;
const RADIUS = 63;

/**
 * Calculate the liquid height using
 * the actual filled area of the circle.
 */
function getLiquidSurface(percentage: number) {
  const ratio = Math.min(
    1,
    Math.max(0, percentage / 100)
  );

  if (ratio === 0) {
    return CENTER + RADIUS;
  }

  if (ratio === 1) {
    return CENTER - RADIUS;
  }

  let low = 0;
  let high = RADIUS * 2;

  const totalArea = Math.PI * RADIUS ** 2;

  for (let i = 0; i < 32; i++) {
    const height = (low + high) / 2;

    const distance = RADIUS - height;

    const area =
      RADIUS ** 2 *
        Math.acos(distance / RADIUS) -
      distance *
        Math.sqrt(
          Math.max(
            0,
            2 * RADIUS * height - height ** 2
          )
        );

    if (area / totalArea < ratio) {
      low = height;
    } else {
      high = height;
    }
  }

  const height = (low + high) / 2;

  return CENTER + RADIUS - height;
}

function LiquidSphere({
  label,
  amount,
  percentage,
  colors,
}: LiquidSphereProps) {
  const id = useId();

  const level = Math.min(
    100,
    Math.max(0, percentage ?? 0)
  );

  const waterY = getLiquidSurface(level);

  const isFull = level === 100;

  const isAnimated =
    level > 2 && level < 98;

  const surfaceY = isFull
    ? waterY - 8
    : waterY;

  return (
    <div className="income-sphere-item">

      {/* Cosmic Glass Sphere */}

      <div className="income-sphere-container">

        <svg
          viewBox="0 0 150 155"
          className="income-sphere-svg"
          aria-hidden="true"
        >
          <defs>

            {/* Sphere clipping area */}

            <clipPath id={`${id}-clip`}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
              />
            </clipPath>

            {/* Cosmic liquid gradient */}

            <radialGradient
              id={`${id}-liquid`}
              gradientUnits="userSpaceOnUse"
              cx="43"
              cy="10"
              r="145"
            >
              <stop
                offset="0%"
                stopColor={colors.light}
              />

              <stop
                offset="28%"
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
            </radialGradient>

            {/* Glass reflection */}

            <radialGradient
              id={`${id}-glass`}
              cx="28%"
              cy="20%"
              r="85%"
            >
              <stop
                offset="0%"
                stopColor="white"
                stopOpacity={0.28}
              />

              <stop
                offset="35%"
                stopColor="white"
                stopOpacity={0.06}
              />

              <stop
                offset="65%"
                stopColor="white"
                stopOpacity={0}
              />

              <stop
                offset="100%"
                stopColor={colors.deep}
                stopOpacity={0.28}
              />
            </radialGradient>

            {/* Liquid inner glow */}

            <radialGradient
              id={`${id}-glow`}
              gradientUnits="userSpaceOnUse"
              cx="42"
              cy="22"
              r="110"
            >
              <stop
                offset="0%"
                stopColor={colors.light}
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor={colors.bright}
                stopOpacity={0}
              />
            </radialGradient>

            {/* Sphere shadow */}

            <radialGradient id={`${id}-shadow`}>
              <stop
                offset="0%"
                stopColor={colors.deep}
                stopOpacity={0.3}
              />

              <stop
                offset="100%"
                stopColor={colors.deep}
                stopOpacity={0}
              />
            </radialGradient>

          </defs>

          {/* Soft bottom shadow */}

          <ellipse
            cx="75"
            cy="146"
            rx="45"
            ry="6"
            fill={`url(#${id}-shadow)`}
          />

          {/* Empty glass background */}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            className="income-sphere-glass-bg"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill={colors.bright}
            opacity={0.035}
          />

          {/* Liquid inside the sphere */}

          <g clipPath={`url(#${id}-clip)`}>

            {level > 0 && (
              <g
                className="income-sphere-level"
                style={{
                  transform: `translateY(${surfaceY}px)`,
                }}
              >

                {/* Back liquid surface */}

                <g
                  className={
                    isAnimated
                      ? "income-sphere-wave-back"
                      : undefined
                  }
                >
                  <path
                    d="
                      M -40 -1
                      Q 75 -2.5 190 -1
                      V 200
                      H -40
                      Z
                    "
                    fill={colors.light}
                    opacity={0.7}
                  />
                </g>

                {/* Front liquid surface */}

                <g
                  className={
                    isAnimated
                      ? "income-sphere-wave-front"
                      : undefined
                  }
                >
                  <path
                    d="
                      M -40 0
                      Q 75 1.5 190 0
                      V 200
                      H -40
                      Z
                    "
                    fill={`url(#${id}-liquid)`}
                  />

                  {/* Internal light */}

                  <path
                    d="
                      M -40 0
                      Q 75 1.5 190 0
                      V 200
                      H -40
                      Z
                    "
                    fill={`url(#${id}-glow)`}
                  />

                  {/* Thin reflection on liquid */}

                  {!isFull && (
                    <path
                      d="
                        M -40 0
                        Q 75 1.5 190 0
                      "
                      stroke={colors.light}
                      strokeWidth="0.9"
                      strokeOpacity={0.7}
                      fill="none"
                    />
                  )}

                </g>

              </g>
            )}

            {/* Glass depth and reflection */}

            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill={`url(#${id}-glass)`}
            />

            {/* Top curved reflection */}

            <ellipse
              cx="44"
              cy="35"
              rx="21"
              ry="7"
              transform="rotate(-38 44 35)"
              fill="white"
              opacity={0.62}
            />

            {/* Left glass reflection */}

            <path
              d="M 23 64 Q 18 92 38 111"
              stroke="white"
              strokeWidth="4"
              strokeOpacity={0.28}
              strokeLinecap="round"
              fill="none"
            />

            {/* Bottom right reflection */}

            <path
              d="M 94 130 Q 122 116 131 91"
              stroke={colors.light}
              strokeOpacity={0.35}
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

          </g>

          {/* Outer glass border */}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={colors.bright}
            strokeOpacity={0.45}
            strokeWidth="1.2"
          />

          {/* Inner glass border */}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - 2}
            fill="none"
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth="0.7"
          />

        </svg>

        {/* Percentage */}

        <div className="income-sphere-percentage">
          <span className="income-sphere-badge">
            {percentage === null
              ? "—"
              : `${percentage.toFixed(1)}%`}
          </span>
        </div>

      </div>

      {/* Label */}

      <div className="income-sphere-label">

        <span
          className="income-sphere-dot"
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

export default function IncomeSphereChart({
  income,
  expense,
}: IncomeSphereChartProps) {
  const netIncome = income - expense;

  const expensePercentage =
    income > 0
      ? (expense / income) * 100
      : null;

  const netPercentage =
    income > 0
      ? (netIncome / income) * 100
      : null;

  return (
    <div className="income-sphere-chart">

      {/* Total income */}

      <div className="space-y-1 text-center">

        <p className="text-xs text-muted-foreground">
          စုစုပေါင်းဝင်ငွေ
        </p>

        <h2 className="break-words text-xl font-bold tabular-nums">
          {formatKyat(income)}
        </h2>

      </div>

      {/* Cosmic Glass Spheres */}

      <div className="income-sphere-grid">

        <LiquidSphere
          label="ထွက်ငွေ"
          amount={expense}
          percentage={expensePercentage}
          colors={SOLAR_GOLD}
        />

        <LiquidSphere
          label="အသားတင်ငွေရလဒ်"
          amount={netIncome}
          percentage={netPercentage}
          colors={MIDNIGHT_GALAXY}
        />

      </div>

      {/* No income message */}

      {income <= 0 && (
        <p className="text-center text-xs text-muted-foreground">
          ဝင်ငွေ အပေါင်းတန်ဖိုးမရှိသဖြင့်
          ရာခိုင်နှုန်း မတွက်နိုင်ပါ။
        </p>
      )}

      {/* Negative income warning */}

      {netIncome < 0 && (
        <div
          className="
            rounded-xl
            border border-red-500/20
            bg-red-500/10
            p-3
          "
        >
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            ဝင်ငွေထက် ထွက်ငွေ ပိုများနေပါသည်။
          </p>

          <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
            လိုငွေ — {formatKyat(Math.abs(netIncome))}
          </p>
        </div>
      )}

    </div>
  );
}