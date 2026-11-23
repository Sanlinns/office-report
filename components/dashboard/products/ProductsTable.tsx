"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/outcome/outcom_data_table";

type ProductRow = {
  name: string;
  code: string;
  unit: string;
  openingQuantity: number;
  stockQuantity: number;
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
    accessorKey: "unitCost",
    header: () => <div className="text-right">တစ်ယူနစ်ကုန်ကျစရိတ်</div>,
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
];

export default function ProductsTable({ rows }: { rows: ProductRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKey="name"
      searchPlaceholder="ပစ္စည်းအမည် သို့မဟုတ် ကုဒ်ဖြင့် ရှာရန်"
      theme="products"
    />
  );
}