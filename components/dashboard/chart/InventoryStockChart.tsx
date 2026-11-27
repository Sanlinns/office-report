"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportCardGlow from "./ReportCardGlow";

type StockRow = { id: string; label: string; quantity: number; unit: string };

const quantityFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 6 });

export default function InventoryStockChart({ rows }: { rows: StockRow[] }) {
  const selectId = useId();
  const [unit, setUnit] = useState<string | null>(null);
  const units = Array.from(new Set(rows.map((row) => row.unit)));
  const selectedUnit = unit !== null && units.includes(unit) ? unit : null;
  const visible = selectedUnit === null ? rows : rows.filter((row) => row.unit === selectedUnit);
  const { min, max } = visible.reduce(({ min, max }, { quantity }) => ({
    min: Math.min(min, quantity),
    max: Math.max(max, quantity),
  }), { min: 0, max: 0 });
  const span = max - min || 1;
  const zero = (-min / span) * 100;

  return (
    <Card className="report-chart-depth relative isolate min-w-0 rounded-2xl border-border/60 bg-gradient-to-b from-background to-muted/20">
      <ReportCardGlow />
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>ကုန်ပစ္စည်းလက်ကျန်</CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor={selectId}>ယူနစ်</label>
          <select
            id={selectId}
            value={selectedUnit === null ? "" : selectedUnit}
            onChange={(event) => setUnit(event.target.value || null)}
            className="max-w-48 rounded-lg border border-input bg-card px-3 py-2 text-foreground"
          >
            <option value="">အားလုံး</option>
            {units.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <Link href="/dashboard/products" className="text-blue-600 underline dark:text-blue-400">စာရင်းကြည့်ရန်</Link>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? <p className="text-sm text-muted-foreground">စာရင်းမရှိသေးပါ။</p> : (
          <>
            {selectedUnit === null && <p className="mb-3 text-sm text-muted-foreground">Bar Chart ကြည့်ရန် ယူနစ်တစ်ခု ရွေးပါ။</p>}
            <ul className="max-h-96 space-y-3 overflow-y-auto pr-2">
              {visible.map(({ id, label, quantity, unit }) => (
                <li key={id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-sm">
                  <span className="break-words">{label}</span>
                  <span className={`tabular-nums ${quantity < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                    {quantityFormat.format(quantity)} {unit}
                  </span>
                  {selectedUnit !== null && (
                    <div aria-hidden="true" className="relative col-span-2 h-3 rounded-full bg-muted">
                      <span
                        className={`absolute inset-y-0 rounded-full ${quantity < 0 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{
                          left: `${((Math.min(quantity, 0) - min) / span) * 100}%`,
                          width: `${(Math.abs(quantity) / span) * 100}%`,
                        }}
                      />
                      {min < 0 && max > 0 && <span className="absolute inset-y-0 w-px bg-muted-foreground" style={{ left: `${zero}%` }} />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}






