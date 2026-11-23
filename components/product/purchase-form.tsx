// "use client";

// import { useActionState, useRef, useState } from "react";
// import { Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { purchaseAmount } from "./amount";

// type Option = { id: string; name: string; code: string; unit: string; unitCost: number };

// const columns = ["ပစ္စည်း", "အရေအတွက်", "ယူနစ်", "တစ်ယူနစ်ဝယ်ဈေး", "စုစုပေါင်း", "လုပ်ဆောင်ချက်"];
// const money = (amount: number) =>
//   Number.isFinite(amount) ? amount.toLocaleString("en-US") + " ကျပ်" : "—";

// export default function PurchaseForm({ products, requestId, date, save, mode = "purchase" }: {
//   products: Option[];
//   mode?: "purchase" | "sale";
//   requestId: string;
//   date: string;
//   save: (form: FormData) => Promise<string>;
// }) {
//   const isSale = mode === "sale";
//   const priceLabel = isSale ? "တစ်ယူနစ်ရောင်းဈေး" : "တစ်ယူနစ်ဝယ်ဈေး";
//   const nextId = useRef(1);
//   const [rows, setRows] = useState([{ id: 0, productId: "", quantity: "", unitCost: "" }]);
//   const [purchaseDate, setDate] = useState(date);
//   const [supplier, setSupplier] = useState("");
//   const [error, action, pending] = useActionState(
//     (_previous: string, form: FormData) => save(form),
//     "",
//   );
//   const amounts = rows.map((row) => purchaseAmount(row.quantity, row.unitCost));
//   const total = amounts.reduce((sum, amount) => sum + (Number.isFinite(amount) ? amount : 0), 0);

//   function update(id: number, values: Partial<Omit<(typeof rows)[number], "id">>) {
//     setRows((previous) => previous.map((row) => row.id === id ? { ...row, ...values } : row));
//   }

//   return (
//     <form action={action} className="space-y-4">
//       <input type="hidden" name="requestId" value={requestId} />
//       <div className="grid gap-3 sm:grid-cols-2">
//         <label className="grid gap-2 text-sm">{isSale ? "ရောင်းချရက်" : "ဝယ်ယူရက်"}
//           <Input name="date" type="date" value={purchaseDate} onChange={(event) => setDate(event.target.value)} required />
//         </label>
//         <label className="grid gap-2 text-sm">{isSale ? "ဝယ်သူအမည် (ထည့်လိုပါက)" : "ဝယ်ယူသည့်ဆိုင်"}
//           <Input name="supplier" value={supplier} onChange={(event) => setSupplier(event.target.value)} maxLength={120} required={!isSale} />
//         </label>
//       </div>
//       <div className="overflow-x-auto rounded-xl border border-blue-500/20">
//         <table className="w-full min-w-[760px] text-sm">
//           <thead className="bg-blue-50 text-blue-950 dark:bg-blue-950/50 dark:text-blue-100">
//             <tr>{columns.map((column) => <th key={column} scope="col" className="p-3 text-left">{column === "တစ်ယူနစ်ဝယ်ဈေး" ? priceLabel : column}</th>)}</tr>
//           </thead>
//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={row.id} className="border-t hover:bg-blue-500/5">
//                 <td className="p-2">
//                   <select name="productId" aria-label={`ပစ္စည်း ${index + 1}`} required
//                     className="h-9 w-full min-w-40 rounded-md border bg-background px-2"
//                     value={row.productId} onChange={(event) => {
//                       const product = products.find((item) => item.id === event.target.value);
//                       update(row.id, { productId: event.target.value, unitCost: product ? String(product.unitCost) : "" });
//                     }}>
//                     <option value="">ပစ္စည်းရွေးရန်</option>
//                     {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.code}</option>)}
//                   </select>
//                 </td>
//                 <td className="p-2">
//                   <Input name="quantity" aria-label={`အရေအတွက် ${index + 1}`} inputMode="decimal" required
//                     value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value })} />
//                 </td>
//                 <td className="p-2">{products.find((item) => item.id === row.productId)?.unit ?? "—"}</td>
//                 <td className="p-2">
//                   <Input name="unitCost" aria-label={`${priceLabel} ${index + 1}`} inputMode="numeric" required
//                     value={row.unitCost} onChange={(event) => update(row.id, { unitCost: event.target.value })} />
//                 </td>
//                 <td className="whitespace-nowrap p-2 text-right tabular-nums">{money(amounts[index])}</td>
//                 <td className="p-2 text-center">
//                   <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1 || pending}
//                     aria-label={`စာကြောင်း ${index + 1} ဖယ်ရန်`}
//                     onClick={() => setRows((previous) => previous.filter((item) => item.id !== row.id))}>
//                     <Trash2 />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <Button type="button" variant="outline" disabled={rows.length >= 100 || pending}
//           onClick={() => {
//             const id = nextId.current++;
//             setRows((previous) => [...previous, { id, productId: "", quantity: "", unitCost: "" }]);
//           }}>
//           <Plus /> ပစ္စည်းထည့်ရန်
//         </Button>
//         <p className="font-semibold tabular-nums text-blue-700 dark:text-blue-300">စုစုပေါင်း {money(total)}</p>
//       </div>
//       {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
//       <Button type="submit" disabled={pending} className="bg-blue-600 text-white hover:bg-blue-700">
//         {pending ? "သိမ်းနေသည်…" : isSale ? "ရောင်းစာရင်းသိမ်းမည်" : "ဝယ်စာရင်းသိမ်းမည်"}
//       </Button>
//     </form>
//   );
// }







"use client";

import { useActionState, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { purchaseAmount } from "./amount";

type Option = { id: string; name: string; code: string; unit: string; unitCost: number | null };

const columns = ["ပစ္စည်း", "အရေအတွက်", "ယူနစ်", "တစ်ယူနစ်ဝယ်ဈေး", "စုစုပေါင်း", "လုပ်ဆောင်ချက်"];
const money = (amount: number) =>
  Number.isFinite(amount) ? amount.toLocaleString("en-US") + " ကျပ်" : "—";

export default function PurchaseForm({ products, requestId, date, save, mode = "purchase" }: {
  products: Option[];
  mode?: "purchase" | "sale";
  requestId: string;
  date: string;
  save: (form: FormData) => Promise<string>;
}) {
  const isSale = mode === "sale";
  const priceLabel = isSale ? "တစ်ယူနစ်ရောင်းဈေး" : "တစ်ယူနစ်ဝယ်ဈေး";
  const nextId = useRef(1);
  const [rows, setRows] = useState([{ id: 0, productId: "", quantity: "", unitCost: "" }]);
  const [purchaseDate, setDate] = useState(date);
  const [supplier, setSupplier] = useState("");
  const [error, action, pending] = useActionState(
    (_previous: string, form: FormData) => save(form),
    "",
  );
  const amounts = rows.map((row) => purchaseAmount(row.quantity, row.unitCost));
  const total = amounts.reduce((sum, amount) => sum + (Number.isFinite(amount) ? amount : 0), 0);

  function update(id: number, values: Partial<Omit<(typeof rows)[number], "id">>) {
    setRows((previous) => previous.map((row) => row.id === id ? { ...row, ...values } : row));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">{isSale ? "ရောင်းချရက်" : "ဝယ်ယူရက်"}
          <Input name="date" type="date" value={purchaseDate} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm">{isSale ? "ဝယ်သူအမည် (ထည့်လိုပါက)" : "ဝယ်ယူသည့်ဆိုင်"}
          <Input name="supplier" value={supplier} onChange={(event) => setSupplier(event.target.value)} maxLength={120} required={!isSale} />
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-blue-500/20">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-blue-50 text-blue-950 dark:bg-blue-950/50 dark:text-blue-100">
            <tr>{columns.map((column) => <th key={column} scope="col" className="p-3 text-left">{column === "တစ်ယူနစ်ဝယ်ဈေး" ? priceLabel : column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t hover:bg-blue-500/5">
                <td className="p-2">
                  <select name="productId" aria-label={`ပစ္စည်း ${index + 1}`} required
                    className="h-9 w-full min-w-40 rounded-md border bg-background px-2"
                    value={row.productId} onChange={(event) => {
                      const product = products.find((item) => item.id === event.target.value);
                      update(row.id, { productId: event.target.value, unitCost: product?.unitCost != null ? String(product.unitCost) : "" });
                    }}>
                    <option value="">ပစ္စည်းရွေးရန်</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.code}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <Input name="quantity" aria-label={`အရေအတွက် ${index + 1}`} inputMode="decimal" required
                    value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value })} />
                </td>
                <td className="p-2">{products.find((item) => item.id === row.productId)?.unit ?? "—"}</td>
                <td className="p-2">
                  <Input name="unitCost" aria-label={`${priceLabel} ${index + 1}`} inputMode="numeric" required
                    value={row.unitCost} onChange={(event) => update(row.id, { unitCost: event.target.value })} />
                </td>
                <td className="whitespace-nowrap p-2 text-right tabular-nums">{money(amounts[index])}</td>
                <td className="p-2 text-center">
                  <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1 || pending}
                    aria-label={`စာကြောင်း ${index + 1} ဖယ်ရန်`}
                    onClick={() => setRows((previous) => previous.filter((item) => item.id !== row.id))}>
                    <Trash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={rows.length >= 100 || pending}
          onClick={() => {
            const id = nextId.current++;
            setRows((previous) => [...previous, { id, productId: "", quantity: "", unitCost: "" }]);
          }}>
          <Plus /> ပစ္စည်းထည့်ရန်
        </Button>
        <p className="font-semibold tabular-nums text-blue-700 dark:text-blue-300">စုစုပေါင်း {money(total)}</p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="bg-blue-600 text-white hover:bg-blue-700">
        {pending ? "သိမ်းနေသည်…" : isSale ? "ရောင်းစာရင်းသိမ်းမည်" : "ဝယ်စာရင်းသိမ်းမည်"}
      </Button>
    </form>
  );
}