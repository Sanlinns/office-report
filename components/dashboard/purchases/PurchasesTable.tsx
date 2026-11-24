// "use client";

// import { useState } from "react";
// import type { ColumnDef } from "@tanstack/react-table";
// import { DataTable } from "@/components/dashboard/outcome/outcom_data_table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
// } from "@/components/ui/dialog";
// import { formatKyat } from "@/lib/format-kyat";

// type Item = { name: string; unit: string; quantity: number; unitCost: number; amount: number };

// export type PurchaseRow = {
//   date: string;
//   supplier: string;
//   names: string;
//   categories: string;
//   total: number;
//   items: Item[];
// };

// const periods = [
//   { id: "all", label: "အားလုံး" },
//   { id: "today", label: "ဒီနေ့" },
//   { id: "month", label: "ဒီလ" },
// ] as const;

// const columns: ColumnDef<PurchaseRow>[] = [
//   { accessorKey: "date", header: "ဝယ်ယူရက်" },
//   {
//     accessorKey: "supplier",
//     header: "ဝယ်ယူသည့်ဆိုင်",
//     filterFn: ({ original }, _, value: string) => {
//       const query = value.trim().toLowerCase();
//       return [original.supplier, original.names, original.categories].some((text) => text.toLowerCase().includes(query));
//     },
//   },
//   { accessorKey: "names", header: "ပစ္စည်း / Category" },
//   {
//     accessorKey: "total",
//     header: () => <div className="text-right">စုစုပေါင်းဝယ်ဖိုး</div>,
//     cell: ({ row }) => <div className="text-right tabular-nums">{formatKyat(row.original.total)}</div>,
//   },
//   {
//     id: "details",
//     header: "အသေးစိတ်",
//     enableHiding: false,
//     cell: ({ row: { original } }) => (
//       <Dialog>
//         <DialogTrigger asChild><Button type="button" variant="outline" size="sm">ကြည့်ရန်</Button></DialogTrigger>
//         <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>ဝယ်စာရင်းအသေးစိတ်</DialogTitle>
//             <DialogDescription>{original.date} · {original.supplier}</DialogDescription>
//           </DialogHeader>
//           <div className="overflow-x-auto rounded-md border">
//             <table className="w-full whitespace-nowrap text-sm">
//               <thead className="bg-blue-50 dark:bg-blue-950/40">
//                 <tr>{["ပစ္စည်း / Category", "အရေအတွက်", "တစ်ယူနစ်ဝယ်ဈေး", "ဝယ်ဖိုး"].map((label) => (
//                   <th key={label} scope="col" className="p-3 text-left">{label}</th>
//                 ))}</tr>
//               </thead>
//               <tbody>
//                 {original.items.map((item, index) => (
//                   <tr key={index} className="border-t">
//                     <td className="p-3">{item.name}</td>
//                     <td className="p-3">{item.quantity.toLocaleString("en-US")} {item.unit}</td>
//                     <td className="p-3">{formatKyat(item.unitCost)}</td>
//                     <td className="p-3">{formatKyat(item.amount)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className="text-right font-semibold">စုစုပေါင်း {formatKyat(original.total)}</p>
//         </DialogContent>
//       </Dialog>
//     ),
//   },
// ];

// export default function PurchasesTable({ rows, today }: { rows: PurchaseRow[]; today: string }) {
//   const [period, setPeriod] = useState<(typeof periods)[number]["id"]>("all");
//   const visibleRows = period === "all" ? rows : rows.filter(({ date }) =>
//     period === "today" ? date === today : date.slice(0, 7) === today.slice(0, 7),
//   );

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-wrap gap-2" role="group" aria-label="ရက်အလိုက် စစ်ရန်">
//         {periods.map(({ id, label }) => (
//           <Button key={id} type="button" variant="outline" aria-pressed={period === id}
//             className="rounded-full aria-pressed:border-blue-500/60 aria-pressed:bg-blue-500/10"
//             onClick={() => setPeriod(id)}>
//             {label}
//           </Button>
//         ))}
//       </div>
//       <DataTable columns={columns} data={visibleRows} searchKey="supplier"
//         searchPlaceholder="ဆိုင်အမည်၊ ပစ္စည်း သို့မဟုတ် Category ဖြင့် ရှာရန်" theme="products" />
//     </div>
//   );
// }






"use client";

import { useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/outcome/outcom_data_table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { deletePurchase } from "@/app/dashboard/purchases/delete-purchase";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatKyat } from "@/lib/format-kyat";

type Item = { name: string; unit: string; quantity: number; unitCost: number; amount: number };

export type PurchaseRow = {
  id: string;
  date: string;
  supplier: string;
  names: string;
  categories: string;
  total: number;
  items: Item[];
};

const periods = [
  { id: "all", label: "အားလုံး" },
  { id: "today", label: "ဒီနေ့" },
  { id: "month", label: "ဒီလ" },
] as const;

function DeletePurchaseButton({ purchase }: { purchase: PurchaseRow }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    setError("");
    startTransition(async () => {
      try {
        const result = await deletePurchase(purchase.id);
        if (result.ok) setOpen(false);
        else setError(result.message);
      } catch {
        setError("ဝယ်စာရင်း ဖျက်လို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => {
      if (!pending) {
        setOpen(next);
        setError("");
      }
    }}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="text-destructive">ဖျက်ရန်</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ဝယ်စာရင်းကို အပြီးဖျက်မလား။</AlertDialogTitle>
          <AlertDialogDescription>
            {purchase.date} · {purchase.supplier} · {formatKyat(purchase.total)}
            <br />ဒီဝယ်စာရင်းကို အပြီးဖျက်ပြီး ချိတ်ထားတဲ့ပစ္စည်းတွေရဲ့ ကုန်လက်ကျန်ကို ပြန်တွက်ပါမယ်။
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
  );
}

const columns: ColumnDef<PurchaseRow>[] = [
  { accessorKey: "date", header: "ဝယ်ယူရက်" },
  {
    accessorKey: "supplier",
    header: "ဝယ်ယူသည့်ဆိုင်",
    filterFn: ({ original }, _, value: string) => {
      const query = value.trim().toLowerCase();
      return [original.supplier, original.names, original.categories].some((text) => text.toLowerCase().includes(query));
    },
  },
  { accessorKey: "names", header: "ပစ္စည်း / Category" },
  {
    accessorKey: "total",
    header: () => <div className="text-right">စုစုပေါင်းဝယ်ဖိုး</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">{formatKyat(row.original.total)}</div>,
  },
  {
    id: "details",
    header: "အသေးစိတ်",
    enableHiding: false,
    cell: ({ row: { original } }) => (
      <Dialog>
        <DialogTrigger asChild><Button type="button" variant="outline" size="sm">ကြည့်ရန်</Button></DialogTrigger>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>ဝယ်စာရင်းအသေးစိတ်</DialogTitle>
            <DialogDescription>{original.date} · {original.supplier}</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-blue-50 dark:bg-blue-950/40">
                <tr>{["ပစ္စည်း / Category", "အရေအတွက်", "တစ်ယူနစ်ဝယ်ဈေး", "ဝယ်ဖိုး"].map((label) => (
                  <th key={label} scope="col" className="p-3 text-left">{label}</th>
                ))}</tr>
              </thead>
              <tbody>
                {original.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.quantity.toLocaleString("en-US")} {item.unit}</td>
                    <td className="p-3">{formatKyat(item.unitCost)}</td>
                    <td className="p-3">{formatKyat(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-right font-semibold">စုစုပေါင်း {formatKyat(original.total)}</p>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    id: "actions",
    header: "လုပ်ဆောင်ချက်",
    enableHiding: false,
    cell: ({ row }) => <DeletePurchaseButton key={row.original.id} purchase={row.original} />,
  },
];

export default function PurchasesTable({ rows, today }: { rows: PurchaseRow[]; today: string }) {
  const [period, setPeriod] = useState<(typeof periods)[number]["id"]>("all");
  const visibleRows = period === "all" ? rows : rows.filter(({ date }) =>
    period === "today" ? date === today : date.slice(0, 7) === today.slice(0, 7),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="ရက်အလိုက် စစ်ရန်">
        {periods.map(({ id, label }) => (
          <Button key={id} type="button" variant="outline" aria-pressed={period === id}
            className="rounded-full aria-pressed:border-blue-500/60 aria-pressed:bg-blue-500/10"
            onClick={() => setPeriod(id)}>
            {label}
          </Button>
        ))}
      </div>
      <DataTable columns={columns} data={visibleRows} searchKey="supplier"
        searchPlaceholder="ဆိုင်အမည်၊ ပစ္စည်း သို့မဟုတ် Category ဖြင့် ရှာရန်" theme="products" />
    </div>
  );
}
