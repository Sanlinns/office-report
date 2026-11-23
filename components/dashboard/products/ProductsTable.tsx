"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { archiveProducts } from "@/app/dashboard/products/archive-products";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/outcome/outcom_data_table";

type ProductRow = {
  id: string;
  name: string;
  code: string;
  unit: string;
  openingQuantity: number;
  stockQuantity: number;
  openingPurchaseTotal: number;
  unitCost: number;
  sellingPrice: number;
};

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "ပစ္စည်းအမည်",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    filterFn: (row, _, value: string) => {
      const query = value.trim().toLowerCase();
      return [row.original.name, row.original.code].some((text) =>
        text.toLowerCase().includes(query),
      );
    },
  },
  {
    accessorKey: "code",
    header: "ကုဒ်",
    cell: ({ row }) => (
      <Badge variant="outline" className="border-blue-500/25 text-blue-700 dark:text-blue-300">
        {row.original.code}
      </Badge>
    ),
  },
  { accessorKey: "unit", header: "ယူနစ်" },
  {
    accessorKey: "openingQuantity",
    header: () => <div className="text-right">စတင်လက်ကျန်</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{number.format(row.original.openingQuantity)}</div>,
  },
  {
    accessorKey: "stockQuantity",
    header: () => <div className="text-right">လက်ရှိလက်ကျန်</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{number.format(row.original.stockQuantity)}</div>,
  },
  {
    accessorKey: "openingPurchaseTotal",
    header: () => <div className="text-right">မူလ စုစုပေါင်းဝယ်ဖိုး</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{number.format(row.original.openingPurchaseTotal)} ကျပ်</div>,
  },
  {
    accessorKey: "unitCost",
    header: () => <div className="text-right">မူလ တစ်ယူနစ်ဝယ်ဈေး</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{number.format(row.original.unitCost)} ကျပ်</div>,
  },
  {
    accessorKey: "sellingPrice",
    header: () => <div className="text-right">ပုံမှန်ရောင်းဈေး</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold tabular-nums text-blue-700 dark:text-blue-300">
        {number.format(row.original.sellingPrice)} ကျပ်
      </div>
    ),
  },
  {
    id: "unitProfit",
    accessorFn: ({ sellingPrice, unitCost, openingQuantity }) => openingQuantity > 0 || unitCost > 0 ? sellingPrice - unitCost : null,
    header: () => <div className="text-right">တစ်ယူနစ် ခန့်မှန်းအမြတ်</div>,
    cell: ({ getValue }) => {
      const profit = getValue<number | null>();
      if (profit === null) return <div className="text-right">—</div>;
      return (
        <div className={`text-right font-medium tabular-nums ${profit < 0 ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"}`}>
          {number.format(profit)} ကျပ်
        </div>
      );
    },
  },
];

export default function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const [archived, setArchived] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const activeRows = rows.filter(({ id }) => !archived.includes(id));
  const activeSelection = selected.filter((id) => activeRows.some((row) => row.id === id));

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
        const result = await archiveProducts(targets);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setArchived((previous) => [...new Set([...previous, ...result.archivedIds])]);
        select(result.archivedIds, false);
        setTargets([]);
        setMessage(result.count ? `${result.count} မျိုး ဖယ်ရှားပြီးပါပြီ။` : "ရွေးထားတဲ့ ပစ္စည်းတွေကို ဖယ်ရှားထားပြီးသားပါ။");
      } catch {
        setError("ပစ္စည်း ဖယ်ရှားလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။");
      }
    });
  }

  const selectableColumns: ColumnDef<ProductRow>[] = [
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
        <input type="checkbox" aria-label={`${row.original.name} · ${row.original.code} ရွေးရန်`}
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
      {activeSelection.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="destructive" disabled={pending}
            onClick={() => confirmDelete(activeSelection)}>
            <Trash2 aria-hidden /> ရွေးထားသော {activeSelection.length} မျိုး ဖျက်ရန်
          </Button>
          <Button type="button" variant="ghost" onClick={() => setSelected([])}>ရွေးထားတာ ရှင်းရန်</Button>
        </div>
      )}
      {message && <p role="status" className="text-sm">{message}</p>}
      <DataTable
        columns={selectableColumns}
        data={activeRows}
        searchKey="name"
        searchPlaceholder="ပစ္စည်းအမည် သို့မဟုတ် ကုဒ်ဖြင့် ရှာရန်"
        theme="products"
      />
      <AlertDialog open={targets.length > 0} onOpenChange={(open) => {
        if (!open && !pending) setTargets([]);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ပစ္စည်း {targets.length} မျိုး ဖယ်ရှားမလား။</AlertDialogTitle>
            <AlertDialogDescription>
              ပစ္စည်းတွေကို လက်ရှိစာရင်းနဲ့ အဝယ်၊ အရောင်း ရွေးချယ်စရာတွေကနေ ဖယ်ရှားပါမယ်။ မှတ်တမ်းဟောင်းတွေကို ပြန်ကြည့်နိုင်ပါတယ်။
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>မဖျက်တော့ပါ</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={remove}>
              {pending ? "ဖျက်နေသည်…" : "ဖယ်ရှားမည်"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
