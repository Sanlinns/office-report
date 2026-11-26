"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSales } from "@/app/dashboard/sales/delete-sales";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/outcome/outcom_data_table";
import { Button } from "@/components/ui/button";
import { formatKyat } from "@/lib/format-kyat";

export type SalesRow = {
  id: string;
  date: string;
  customer: string;
  products: string;
  total: number;
  cost: number;
  profit: number;
};

const filters = [
  { value: "all", label: "အားလုံး" },
  { value: "today", label: "ဒီနေ့" },
  { value: "month", label: "ဒီလ" },
] as const;

const columns: ColumnDef<SalesRow>[] = [
  { accessorKey: "date", header: "ရောင်းချရက်" },
  {
    accessorKey: "customer",
    header: "ဝယ်သူ",
    cell: ({ row }) => row.original.customer || "—",
    filterFn: (row, _, value: string) => {
      const query = value.trim().toLowerCase();
      return [row.original.customer, row.original.products].some((text) =>
        text.toLowerCase().includes(query),
      );
    },
  },
  {
    accessorKey: "products",
    header: "ပစ္စည်းများ",
    cell: ({ row }) => <div className="w-60 whitespace-pre-line break-words">{row.original.products}</div>,
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">ရောင်းရငွေ</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{formatKyat(row.original.total)}</div>,
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">ကုန်ကျစရိတ်</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{formatKyat(row.original.cost)}</div>,
  },
  {
    accessorKey: "profit",
    header: () => <div className="text-right">အရောင်းအမြတ်</div>,
    cell: ({ row }) => (
      <div className={`text-right font-medium tabular-nums ${row.original.profit < 0 ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"}`}>
        {formatKyat(row.original.profit)}
      </div>
    ),
  },
];

export default function SalesTable({ rows, today }: { rows: SalesRow[]; today: string }) {
  const [period, setPeriod] = useState<(typeof filters)[number]["value"]>("all");
  const visibleRows = period === "all" ? rows : rows.filter(({ date }) =>
    period === "today" ? date === today : date.slice(0, 7) === today.slice(0, 7),
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const activeSelection = selected.filter((id) => visibleRows.some((row) => row.id === id));

  function select(ids: string[], checked: boolean) {
    setSelected((previous) => checked
      ? [...new Set([...previous, ...ids])]
      : previous.filter((id) => !ids.includes(id)));
  }

  function confirmDelete(ids: string[]) {
    setError("");
    setMessage("");
    setTargets(ids);
  }

  function remove() {
    startTransition(async () => {
      try {
        const result = await deleteSales(targets);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        select(targets, false);
        setTargets([]);
        setMessage(result.count ? `${result.count} စောင် ဖျက်ပြီးပါပြီ။` : "ရွေးထားတဲ့စာရင်း မရှိတော့ပါ။");
      } catch {
        setError("အရောင်းစာရင်း ဖျက်လို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။");
      }
    });
  }

  const selectableColumns: ColumnDef<SalesRow>[] = [
    {
      id: "ရွေးရန်",
      enableHiding: false,
      header: ({ table }) => {
        const pageIds = table.getRowModel().rows.map(({ original }) => original.id);
        return (
          <input type="checkbox" aria-label="ဒီစာမျက်နှာရှိ စာရင်းအားလုံး ရွေးရန်"
            disabled={pending || !pageIds.length}
            checked={pageIds.length > 0 && pageIds.every((id) => selected.includes(id))}
            onChange={(event) => select(pageIds, event.target.checked)} />
        );
      },
      cell: ({ row }) => (
        <input type="checkbox" aria-label={`${row.original.date} · ${row.original.products.replaceAll("\n", ", ")} ရွေးရန်`}
          disabled={pending} checked={selected.includes(row.original.id)}
          onChange={(event) => select([row.original.id], event.target.checked)} />
      ),
    },
    ...columns,
    {
      id: "လုပ်ဆောင်ချက်",
      header: "လုပ်ဆောင်ချက်",
      enableHiding: false,
      cell: ({ row }) => (
        <Button type="button" size="sm" variant="ghost" className="text-destructive"
          disabled={pending} onClick={() => confirmDelete([row.original.id])}>
          <Trash2 aria-hidden /> ဖျက်ရန်
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="ရက်အလိုက် စစ်ရန်">
        {filters.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            aria-pressed={period === value}
            className="rounded-full aria-pressed:border-blue-500/60 aria-pressed:bg-blue-500/10"
            onClick={() => { setPeriod(value); setSelected([]); }}
          >
            {label}
          </Button>
        ))}
      </div>
      {activeSelection.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="destructive" disabled={pending}
            onClick={() => confirmDelete(activeSelection)}>
            <Trash2 aria-hidden /> ရွေးထားသော {activeSelection.length} စောင် ဖျက်ရန်
          </Button>
          <Button type="button" variant="ghost" onClick={() => setSelected([])}>ရွေးထားတာ ရှင်းရန်</Button>
        </div>
      )}
      {message && <p role="status" className="text-sm">{message}</p>}
      <DataTable
        columns={selectableColumns}
        data={visibleRows}
        searchKey="customer"
        searchPlaceholder="ဝယ်သူ သို့မဟုတ် ပစ္စည်းအမည်ဖြင့် ရှာရန်"
        theme="products"
      />
      <AlertDialog open={targets.length > 0} onOpenChange={(open) => {
        if (!open && !pending) setTargets([]);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>အရောင်းစာရင်း {targets.length} စောင် ဖျက်မလား။</AlertDialogTitle>
            <AlertDialogDescription>
              စာရင်းကို အပြီးဖျက်ပြီး ရောင်းထားတဲ့ပစ္စည်းအရေအတွက်ကို လက်ကျန်ထဲ ပြန်ပေါင်းပါမယ်။
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>မဖျက်တော့ပါ</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={remove}>
              {pending ? "ဖျက်နေသည်…" : "အပြီးဖျက်မည်"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
