"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

type InventoryItem = {
  id: string | number;
  name: string;
  quantity: number;
  unit?: string;
  minimumStock?: number;
  category?: string;
};

type InventorySpectrumChartProps = {
  items: InventoryItem[];
  title?: string;
};

type SortMode =
  | "qty-desc"
  | "qty-asc"
  | "name-asc";

function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getItemStatus(
  item: InventoryItem,
  maxQuantity: number
) {
  const quantity = safeNumber(item.quantity);

  if (quantity <= 0) {
    return "out";
  }

  if (
    typeof item.minimumStock === "number" &&
    quantity <= item.minimumStock
  ) {
    return "low";
  }

  const fallbackLowLine = Math.max(
    5,
    Math.round(maxQuantity * 0.12)
  );

  if (quantity <= fallbackLowLine) {
    return "low";
  }

  return "normal";
}

function getStatusLabel(
  status: "normal" | "low" | "out"
) {
  if (status === "out") return "ကုန်သွားပြီ";
  if (status === "low") return "လက်ကျန်နည်း";
  return "ပုံမှန်";
}

function formatQuantity(
  value: number,
  unit?: string
) {
  return `${value.toLocaleString()} ${unit ?? ""}`.trim();
}

function getAuroraGradient(
  index: number,
  total: number,
  status: "normal" | "low" | "out"
) {
  if (status === "out") {
    return `
      linear-gradient(
        180deg,
        #fecdd3 0%,
        #fb7185 28%,
        #e11d48 68%,
        #881337 100%
      )
    `;
  }

  if (status === "low") {
    return `
      linear-gradient(
        180deg,
        #fef3c7 0%,
        #fde68a 25%,
        #f59e0b 62%,
        #92400e 100%
      )
    `;
  }

  const t =
    total <= 1 ? 0 : index / (total - 1);

  const hue1 = 270 - t * 70;
  const hue2 = 220 - t * 40;
  const hue3 = 185 + t * 35;

  return `
    linear-gradient(
      180deg,
      hsl(${hue1} 90% 84%) 0%,
      hsl(${hue2} 92% 66%) 32%,
      hsl(${hue3} 82% 52%) 68%,
      hsl(${hue3} 88% 30%) 100%
    )
  `;
}

export default function InventorySpectrumChart({
  items,
  title = "ကုန်ပစ္စည်းလက်ကျန်",
}: InventorySpectrumChartProps) {
  const [unitFilter, setUnitFilter] =
    useState<string>("all");

  const [sortMode, setSortMode] =
    useState<SortMode>("qty-desc");

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const units = useMemo(() => {
    const unitSet = new Set<string>();

    items.forEach((item) => {
      if (item.unit?.trim()) {
        unitSet.add(item.unit.trim());
      }
    });

    return ["all", ...Array.from(unitSet)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalized = items.map((item) => ({
      ...item,
      quantity: safeNumber(item.quantity),
      unit: item.unit?.trim() || "ခု",
    }));

    const byUnit =
      unitFilter === "all"
        ? normalized
        : normalized.filter(
            (item) => item.unit === unitFilter
          );

    const sorted = [...byUnit];

    sorted.sort((a, b) => {
      if (sortMode === "qty-desc") {
        return b.quantity - a.quantity;
      }

      if (sortMode === "qty-asc") {
        return a.quantity - b.quantity;
      }

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [items, sortMode, unitFilter]);

  const maxQuantity = useMemo(() => {
    if (filteredItems.length === 0) return 0;

    return Math.max(
      ...filteredItems.map((item) =>
        safeNumber(item.quantity)
      ),
      1
    );
  }, [filteredItems]);

  const stats = useMemo(() => {
    let low = 0;
    let out = 0;

    filteredItems.forEach((item) => {
      const status = getItemStatus(
        item,
        maxQuantity
      );

      if (status === "out") out += 1;
      if (status === "low") low += 1;
    });

    return {
      total: filteredItems.length,
      low,
      out,
      normal:
        filteredItems.length - low - out,
    };
  }, [filteredItems, maxQuantity]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [sortMode, unitFilter]);

  useEffect(() => {
    if (
      selectedIndex >
      Math.max(filteredItems.length - 1, 0)
    ) {
      setSelectedIndex(0);
    }
  }, [filteredItems.length, selectedIndex]);

  const selectedItem =
    filteredItems[selectedIndex] ?? null;

  const selectedStatus = selectedItem
    ? getItemStatus(selectedItem, maxQuantity)
    : null;

  return (
    <Card
      className="
        relative min-w-0 overflow-hidden rounded-2xl
        border border-border/60
        bg-gradient-to-b from-background to-muted/20
      "
    >
      <CardHeader className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold tracking-wide">
              {title}
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              Aurora Multi-Color Liquid Spectrum
              · ပစ္စည်း {filteredItems.length} မျိုး
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={unitFilter}
              onChange={(e) =>
                setUnitFilter(e.target.value)
              }
              className="
                rounded-lg border border-border bg-background
                px-3 py-2 text-xs
              "
            >
              {units.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                >
                  {unit === "all"
                    ? "ယူနစ်အားလုံး"
                    : unit}
                </option>
              ))}
            </select>

            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(
                  e.target.value as SortMode
                )
              }
              className="
                rounded-lg border border-border bg-background
                px-3 py-2 text-xs
              "
            >
              <option value="qty-desc">
                အများဆုံးမှ အနည်းဆုံး
              </option>
              <option value="qty-asc">
                အနည်းဆုံးမှ အများဆုံး
              </option>
              <option value="name-asc">
                အမည် A-Z
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="text-[11px] text-muted-foreground">
              စုစုပေါင်းပစ္စည်း
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {stats.total}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="text-[11px] text-muted-foreground">
              ပုံမှန်
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {stats.normal}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="text-[11px] text-muted-foreground">
              လက်ကျန်နည်း
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {stats.low}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="text-[11px] text-muted-foreground">
              ကုန်သွားပြီ
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              {stats.out}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 min-w-0 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="grid min-h-[280px] place-items-center text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                ပြရန် ပစ္စည်းစာရင်းမရှိသေးပါ။
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="inventory-spectrum-shell">
              <div className="inventory-spectrum-stage">
                <div className="inventory-spectrum-bars">
                  {filteredItems.map((item, index) => {
                    const quantity = safeNumber(
                      item.quantity
                    );

                    const percent =
                      maxQuantity > 0
                        ? quantity / maxQuantity
                        : 0;

                    const status =
                      getItemStatus(
                        item,
                        maxQuantity
                      );

                    const isActive =
                      index === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={`${item.name} — ${formatQuantity(
                          quantity,
                          item.unit
                        )}`}
                        className={`inventory-spectrum-column ${
                          isActive
                            ? "is-active"
                            : ""
                        }`}
                        onMouseEnter={() =>
                          setSelectedIndex(index)
                        }
                        onFocus={() =>
                          setSelectedIndex(index)
                        }
                        onClick={() =>
                          setSelectedIndex(index)
                        }
                      >
                        <div
                          className="inventory-spectrum-bar"
                          style={{
                            height: `${Math.max(
                              8,
                              percent * 100
                            )}%`,
                            backgroundImage:
                              getAuroraGradient(
                                index,
                                filteredItems.length,
                                status
                              ),
                            opacity:
                              selectedIndex ===
                              index
                                ? 1
                                : selectedIndex ===
                                    0 &&
                                  !selectedItem
                                  ? 0.95
                                  : selectedItem
                                    ? 0.42
                                    : 0.95,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="inventory-spectrum-axis">
                <span>1</span>
                <span>
                  {Math.max(
                    1,
                    Math.round(
                      filteredItems.length / 2
                    )
                  )}
                </span>
                <span>
                  {filteredItems.length}
                </span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    ရွေးထားသော ပစ္စည်း
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {selectedIndex + 1} /{" "}
                    {filteredItems.length}
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(
                      0,
                      filteredItems.length - 1
                    )}
                    step={1}
                    value={selectedIndex}
                    onChange={(e) =>
                      setSelectedIndex(
                        Number(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>

                {selectedItem && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <div className="text-[11px] text-muted-foreground">
                        ကုန်ပစ္စည်းအမည်
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {selectedItem.name}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <div className="text-[11px] text-muted-foreground">
                        လက်ကျန်
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatQuantity(
                          safeNumber(
                            selectedItem.quantity
                          ),
                          selectedItem.unit
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <div className="text-[11px] text-muted-foreground">
                        အခြေအနေ
                      </div>
                      <div className="mt-1">
                        <span
                          className={`
                            inline-flex rounded-full px-2.5 py-1 text-xs font-medium
                            ${
                              selectedStatus ===
                              "normal"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : selectedStatus ===
                                    "low"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }
                          `}
                        >
                          {getStatusLabel(
                            selectedStatus!
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-background/70 p-3">
                      <div className="text-[11px] text-muted-foreground">
                        အမြင့်ဆုံးနှိုင်းယှဉ်
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {(
                          (safeNumber(
                            selectedItem.quantity
                          ) /
                            maxQuantity) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        Math.max(0, prev - 1)
                      )
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        Math.min(
                          filteredItems.length - 1,
                          prev + 1
                        )
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="text-sm font-medium">
                  Color Guide
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-muted-foreground">
                      ပုံမှန်လက်ကျန်
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-muted-foreground">
                      လက်ကျန်နည်း
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-muted-foreground">
                      ကုန်သွားပြီ
                    </span>
                  </div>

                  <div className="pt-2 text-xs leading-6 text-muted-foreground">
                    Aurora bar တွေက
                    ပစ္စည်းတစ်ခုချင်းစီရဲ့
                    လက်ကျန်အမြင့်ကို
                    ပြသပြီး၊ animation က
                    data မပြောင်းဘဲ
                    အလင်းရောင်ကိုသာ
                    မသိမသာရွေ့စေပါတယ်။
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}