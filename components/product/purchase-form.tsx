// "use client";

// import { useActionState, useRef, useState } from "react";
// import { Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { purchaseAmount, readNumber } from "./amount";

// type Option = { id: string; name: string; code: string; unit: string; unitCost: number | null };

// type CategoryOption = { id: string; name: string; unit: string; products: Option[] };

// const columns = ["ပစ္စည်း", "အရေအတွက်", "ယူနစ်", "တစ်ယူနစ်ဝယ်ဈေး", "စုစုပေါင်း", "လုပ်ဆောင်ချက်"];
// const money = (amount: number) =>
//   Number.isFinite(amount) ? amount.toLocaleString("en-US") + " ကျပ်" : "—";

// export default function PurchaseForm({ products, categories, requestId, date, save, mode = "purchase" }: {
//   products: Option[];
//   categories?: CategoryOption[];
//   mode?: "purchase" | "sale";
//   requestId: string;
//   date: string;
//   save: (form: FormData) => Promise<string>;
// }) {
//   const isSale = mode === "sale";
//   const priceLabel = isSale ? "တစ်ယူနစ်ရောင်းဈေး" : "တစ်ယူနစ်ဝယ်ဈေး";
//   const nextId = useRef(1);
//   const [rows, setRows] = useState([{ id: 0, categoryId: "", purchaseUnit: "", productId: "", quantity: "", unitCost: "", lineTotal: "", priceMode: "total" as "total" | "unit" }]);
//   const [purchaseDate, setDate] = useState(date);
//   const [supplier, setSupplier] = useState("");
//   const [error, action, pending] = useActionState(
//     (_previous: string, form: FormData) => save(form),
//     "",
//   );
//   const amounts = rows.map((row) => isSale ? purchaseAmount(row.quantity, row.unitCost)
//     : row.priceMode === "unit" ? purchaseAmount(row.quantity, row.lineTotal)
//     : readNumber(row.lineTotal, 0));
//   const total = amounts.reduce((sum, amount) => sum + (Number.isFinite(amount) ? amount : 0), 0);

//   function update(id: number, values: Partial<Omit<(typeof rows)[number], "id">>) {
//     setRows((previous) => previous.map((row) => row.id === id ? { ...row, ...values } : row));
//   }

//   const showCategories = !isSale && Boolean(categories?.length);

//   function chooseProduct(rowId: number, product?: Option) {
//     update(rowId, {
//       productId: product?.id ?? "",
//       unitCost: product?.unitCost != null ? String(product.unitCost) : "",
//     });
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
//             <tr>{columns.map((column) => <th key={column} scope="col" className="p-3 text-left">{column === "တစ်ယူနစ်ဝယ်ဈေး" ? priceLabel : column === "ပစ္စည်း" && showCategories ? "Category" : column}</th>)}</tr>
//           </thead>
//           <tbody>
//             {rows.map((row, index) => {
//               const category = categories?.find(({ id }) => id === row.categoryId);
//               const choices = showCategories ? (category?.products ?? []) : products;
//               const showProductSelect = !showCategories || choices.length > 1;
//               return (
//               <tr key={row.id} className="border-t hover:bg-blue-500/5">
//                 <td className="p-2">
//                   <div className="grid min-w-40 gap-2">
//                     {showCategories && (
//                       <select name="categoryId" aria-label={`Category ${index + 1}`} required
//                         className="h-9 w-full rounded-md border bg-background px-2"
//                         value={row.categoryId} onChange={(event) => {
//                           const category = categories?.find(({ id }) => id === event.target.value);
//                           update(row.id, { categoryId: event.target.value, purchaseUnit: "" });
//                           chooseProduct(row.id, category?.products.length === 1 ? category.products[0] : undefined);
//                         }}>
//                         <option value="">Category ရွေးရန်</option>
//                         {categories?.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
//                       </select>
//                     )}
//                     {showProductSelect ? (
//                       <select name="productId" aria-label={`ပစ္စည်း ${index + 1}`} required
//                         className="h-9 w-full rounded-md border bg-background px-2"
//                         value={row.productId} onChange={(event) =>
//                           chooseProduct(row.id, choices.find(({ id }) => id === event.target.value))}>
//                         <option value="">ပစ္စည်းရွေးရန်</option>
//                         {choices.map(({ id, name, code }) => <option key={id} value={id}>{name} · {code}</option>)}
//                       </select>
//                     ) : (
//                       <input type="hidden" name="productId" value={row.productId} />
//                     )}
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <Input name="quantity" aria-label={`အရေအတွက် ${index + 1}`} inputMode="decimal" required
//                     value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value })} />
//                 </td>
//                 <td className="p-2">
//                   {showCategories && category && choices.length === 0 && !category.unit ? (
//                     <Input name="purchaseUnit" aria-label={`ယူနစ် ${index + 1}`} maxLength={30} required
//                       value={row.purchaseUnit} onChange={(event) => update(row.id, { purchaseUnit: event.target.value })} />
//                   ) : (
//                     <>
//                       {products.find((item) => item.id === row.productId)?.unit || category?.unit || "—"}
//                       {showCategories && <input type="hidden" name="purchaseUnit" value="" />}
//                     </>
//                   )}
//                 </td>
//                 <td className="p-2">
//                   {isSale ? (
//                     <Input name="unitCost" aria-label={`${priceLabel} ${index + 1}`} inputMode="numeric" required
//                       value={row.unitCost} onChange={(event) => update(row.id, { unitCost: event.target.value })} />
//                   ) : row.priceMode === "unit" ? (
//                     <Input name="lineTotal" aria-label={`တစ်ယူနစ်ဝယ်ဈေး ${index + 1}`} inputMode="numeric" required
//                       value={row.lineTotal} onChange={(event) => update(row.id, { lineTotal: event.target.value })} />
//                   ) : (
//                     <span className="whitespace-nowrap tabular-nums">
//                       {readNumber(row.quantity, 3) > 0 ? money(amounts[index] / readNumber(row.quantity, 3)) : "—"}
//                     </span>
//                   )}
//                 </td>
//                 <td className="p-2 text-right tabular-nums">
//                   {isSale ? money(amounts[index]) : (
//                     <div className="grid min-w-40 gap-2">
//                       <select name="priceMode" aria-label={`ဈေးထည့်မည့်ပုံစံ ${index + 1}`}
//                         className="h-9 rounded-md border bg-background px-2"
//                         value={row.priceMode} onChange={(event) => update(row.id, {
//                           priceMode: event.target.value === "unit" ? "unit" : "total",
//                           lineTotal: "",
//                         })}>
//                         <option value="total">စုစုပေါင်းဖြင့် ထည့်ရန်</option>
//                         <option value="unit">တစ်ယူနစ်ဈေးဖြင့် ထည့်ရန်</option>
//                       </select>
//                       {row.priceMode === "unit" ? <span>{money(amounts[index])}</span> : (
//                         <Input name="lineTotal" aria-label={`စုစုပေါင်းဝယ်ဖိုး ${index + 1}`} inputMode="numeric" required
//                           value={row.lineTotal} onChange={(event) => update(row.id, { lineTotal: event.target.value })} />
//                       )}
//                     </div>
//                   )}
//                 </td>
//                 <td className="p-2 text-center">
//                   <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1 || pending}
//                     aria-label={`စာကြောင်း ${index + 1} ဖယ်ရန်`}
//                     onClick={() => setRows((previous) => previous.filter((item) => item.id !== row.id))}>
//                     <Trash2 />
//                   </Button>
//                 </td>
//               </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <Button type="button" variant="outline" disabled={rows.length >= 100 || pending}
//           onClick={() => {
//             const id = nextId.current++;
//             setRows((previous) => [...previous, { id, categoryId: "", purchaseUnit: "", productId: "", quantity: "", unitCost: "", lineTotal: "", priceMode: "total" as "total" | "unit" }]);
//           }}>
//           <Plus /> {showCategories ? "Category ထည့်ရန်" : "ပစ္စည်းထည့်ရန်"}
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
import { purchaseAmount, readNumber } from "./amount";
import { isVissUnit, readKyatthaSale } from "./sale-weight";

type Option = { id: string; name: string; code: string; unit: string; unitCost: number | null };

type CategoryOption = { id: string; name: string; unit: string; products: Option[] };

const columns = ["ပစ္စည်း", "အရေအတွက်", "ယူနစ်", "တစ်ယူနစ်ဝယ်ဈေး", "စုစုပေါင်း", "လုပ်ဆောင်ချက်"];
const money = (amount: number) =>
  Number.isFinite(amount) ? amount.toLocaleString("en-US") + " ကျပ်" : "—";

export default function PurchaseForm({ products, categories, requestId, date, save, mode = "purchase" }: {
  products: Option[];
  categories?: CategoryOption[];
  mode?: "purchase" | "sale";
  requestId: string;
  date: string;
  save: (form: FormData) => Promise<string>;
}) {
  const isSale = mode === "sale";
  const priceLabel = isSale ? "တစ်ယူနစ်ရောင်းဈေး" : "တစ်ယူနစ်ဝယ်ဈေး";
  const nextId = useRef(1);
  const [rows, setRows] = useState([{ id: 0, categoryId: "", purchaseUnit: "", saleUnit: "stock", productId: "", quantity: "", unitCost: "", lineTotal: "", priceMode: "total" as "total" | "unit" }]);
  const [purchaseDate, setDate] = useState(date);
  const [supplier, setSupplier] = useState("");
  const [error, action, pending] = useActionState(
    (_previous: string, form: FormData) => save(form),
    "",
  );
  const amounts = rows.map((row) => isSale ? (row.saleUnit === "kyattha"
    ? readKyatthaSale(row.quantity, row.unitCost)?.amount ?? NaN
    : purchaseAmount(row.quantity, row.unitCost))
    : row.priceMode === "unit" ? purchaseAmount(row.quantity, row.lineTotal)
    : readNumber(row.lineTotal, 0));
  const total = amounts.reduce((sum, amount) => sum + (Number.isFinite(amount) ? amount : 0), 0);

  function update(id: number, values: Partial<Omit<(typeof rows)[number], "id">>) {
    setRows((previous) => previous.map((row) => row.id === id ? { ...row, ...values } : row));
  }

  const showCategories = !isSale && Boolean(categories?.length);

  function chooseProduct(rowId: number, product?: Option) {
    update(rowId, {
      productId: product?.id ?? "",
      saleUnit: "stock",
      unitCost: product?.unitCost != null ? String(product.unitCost) : "",
    });
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
            <tr>{columns.map((column) => <th key={column} scope="col" className="p-3 text-left">{column === "တစ်ယူနစ်ဝယ်ဈေး" ? priceLabel : column === "ပစ္စည်း" && showCategories ? "Category" : column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const category = categories?.find(({ id }) => id === row.categoryId);
              const choices = showCategories ? (category?.products ?? []) : products;
              const product = choices.find(({ id }) => id === row.productId);
              const canSellByKyattha = isSale && product && isVissUnit(product.unit);
              const isKyatthaSale = canSellByKyattha && row.saleUnit === "kyattha";
              const showProductSelect = !showCategories || choices.length > 1;
              return (
              <tr key={row.id} className="border-t hover:bg-blue-500/5">
                <td className="p-2">
                  <div className="grid min-w-40 gap-2">
                    {showCategories && (
                      <select name="categoryId" aria-label={`Category ${index + 1}`} required
                        className="h-9 w-full rounded-md border bg-background px-2"
                        value={row.categoryId} onChange={(event) => {
                          const category = categories?.find(({ id }) => id === event.target.value);
                          update(row.id, { categoryId: event.target.value, purchaseUnit: "" });
                          chooseProduct(row.id, category?.products.length === 1 ? category.products[0] : undefined);
                        }}>
                        <option value="">Category ရွေးရန်</option>
                        {categories?.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                      </select>
                    )}
                    {showProductSelect ? (
                      <select name="productId" aria-label={`ပစ္စည်း ${index + 1}`} required
                        className="h-9 w-full rounded-md border bg-background px-2"
                        value={row.productId} onChange={(event) =>
                          chooseProduct(row.id, choices.find(({ id }) => id === event.target.value))}>
                        <option value="">ပစ္စည်းရွေးရန်</option>
                        {choices.map(({ id, name, code }) => <option key={id} value={id}>{name} · {code}</option>)}
                      </select>
                    ) : (
                      <input type="hidden" name="productId" value={row.productId} />
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <Input name="quantity" aria-label={`အရေအတွက် ${index + 1}`} inputMode="decimal" required
                    placeholder={isKyatthaSale ? "အနည်းဆုံး ၁၀" : undefined}
                    value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value })} />
                </td>
                <td className="p-2">
                  {canSellByKyattha ? (
                    <select name="saleUnit" aria-label={`ရောင်းချယူနစ် ${index + 1}`}
                      className="h-9 rounded-md border bg-background px-2"
                      value={row.saleUnit} onChange={(event) => update(row.id, {
                        saleUnit: event.target.value,
                        quantity: "",
                        unitCost: event.target.value === "kyattha" || product.unitCost == null ? "" : String(product.unitCost),
                      })}>
                      <option value="stock">{product.unit}</option>
                      <option value="kyattha">ကျပ်သား</option>
                    </select>
                  ) : showCategories && category && choices.length === 0 && !category.unit ? (
                    <Input name="purchaseUnit" aria-label={`ယူနစ် ${index + 1}`} maxLength={30} required
                      value={row.purchaseUnit} onChange={(event) => update(row.id, { purchaseUnit: event.target.value })} />
                  ) : (
                    <>
                      {products.find((item) => item.id === row.productId)?.unit || category?.unit || "—"}
                      {isSale && <input type="hidden" name="saleUnit" value="stock" />}
                      {showCategories && <input type="hidden" name="purchaseUnit" value="" />}
                    </>
                  )}
                </td>
                <td className="p-2">
                  {isSale ? (
                    <label className="grid gap-1">
                      {isKyatthaSale && <span className="text-xs text-muted-foreground">ဒီအလေးချိန်အတွက် စုစုပေါင်းရောင်းဈေး</span>}
                      <Input name="unitCost" aria-label={`${isKyatthaSale ? "စုစုပေါင်းရောင်းဈေး" : priceLabel} ${index + 1}`}
                        inputMode="numeric" required value={row.unitCost}
                        onChange={(event) => update(row.id, { unitCost: event.target.value })} />
                    </label>
                  ) : row.priceMode === "unit" ? (
                    <Input name="lineTotal" aria-label={`တစ်ယူနစ်ဝယ်ဈေး ${index + 1}`} inputMode="numeric" required
                      value={row.lineTotal} onChange={(event) => update(row.id, { lineTotal: event.target.value })} />
                  ) : (
                    <span className="whitespace-nowrap tabular-nums">
                      {readNumber(row.quantity, 3) > 0 ? money(amounts[index] / readNumber(row.quantity, 3)) : "—"}
                    </span>
                  )}
                </td>
                <td className="p-2 text-right tabular-nums">
                  {isSale ? money(amounts[index]) : (
                    <div className="grid min-w-40 gap-2">
                      <select name="priceMode" aria-label={`ဈေးထည့်မည့်ပုံစံ ${index + 1}`}
                        className="h-9 rounded-md border bg-background px-2"
                        value={row.priceMode} onChange={(event) => update(row.id, {
                          priceMode: event.target.value === "unit" ? "unit" : "total",
                          lineTotal: "",
                        })}>
                        <option value="total">စုစုပေါင်းဖြင့် ထည့်ရန်</option>
                        <option value="unit">တစ်ယူနစ်ဈေးဖြင့် ထည့်ရန်</option>
                      </select>
                      {row.priceMode === "unit" ? <span>{money(amounts[index])}</span> : (
                        <Input name="lineTotal" aria-label={`စုစုပေါင်းဝယ်ဖိုး ${index + 1}`} inputMode="numeric" required
                          value={row.lineTotal} onChange={(event) => update(row.id, { lineTotal: event.target.value })} />
                      )}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1 || pending}
                    aria-label={`စာကြောင်း ${index + 1} ဖယ်ရန်`}
                    onClick={() => setRows((previous) => previous.filter((item) => item.id !== row.id))}>
                    <Trash2 />
                  </Button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={rows.length >= 100 || pending}
          onClick={() => {
            const id = nextId.current++;
            setRows((previous) => [...previous, { id, categoryId: "", purchaseUnit: "", saleUnit: "stock", productId: "", quantity: "", unitCost: "", lineTotal: "", priceMode: "total" as "total" | "unit" }]);
          }}>
          <Plus /> {showCategories ? "Category ထည့်ရန်" : "ပစ္စည်းထည့်ရန်"}
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
