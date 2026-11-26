// import mongoose, { Types } from "mongoose";
// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { auth } from "@/lib/auth";
// import { inventoryMovements } from "@/lib/mongoDB/inventory";
// import { connectToDB } from "@/lib/mongoDB/mongoDB";
// import Product from "@/lib/mongoDB/models/product";
// import Sale from "@/lib/mongoDB/models/sale";
// import { purchaseAmount, readNumber } from "@/components/product/amount";
// import PurchaseForm from "@/components/product/purchase-form";

// const path = "/dashboard/sales/new";

// async function getOwnerId() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user.id) redirect("/sign-in");
//   return session.user.id;
// }

// async function saveSale(form: FormData): Promise<string> {
//   "use server";

//   const ownerId = await getOwnerId();
//   const requestId = String(form.get("requestId") ?? "");
//   const date = String(form.get("date") ?? "");
//   const customer = String(form.get("supplier") ?? "").trim();
//   const timestamp = Date.parse(date);
//   if (!Types.ObjectId.isValid(requestId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
//       !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date ||
//       customer.length > 120) return "ရောင်းချရက်နဲ့ ဝယ်သူအမည်ကို စစ်ပါ။";

//   const ids = form.getAll("productId").map(String);
//   const quantities = form.getAll("quantity").map(String);
//   const prices = form.getAll("unitCost").map(String);
//   if (!ids.length || ids.length > 100 || ids.length !== quantities.length ||
//       ids.length !== prices.length || ids.some((id) => !Types.ObjectId.isValid(id))) {
//     return "ပစ္စည်းစာရင်းကို စစ်ပါ။";
//   }

//   const inputs = ids.map((id, index) => ({
//     id,
//     quantity: readNumber(quantities[index], 3),
//     unitPrice: readNumber(prices[index], 0),
//     amount: purchaseAmount(quantities[index], prices[index]),
//   }));
//   const total = inputs.reduce((sum, item) => sum + item.amount, 0);
//   if (!Number.isSafeInteger(total)) return "အရေအတွက်နဲ့ ရောင်းဈေးကို စစ်ပါ။";

//   try {
//     await connectToDB();
//     const error = await mongoose.connection.transaction(async (session) => {
//       if (await Sale.exists({ ownerId, _id: requestId }).session(session)) return null;

//       // Lock the same product documents in a consistent order for concurrent sales.
//       const products = new Map<string, NonNullable<Awaited<ReturnType<typeof loadProduct>>>>();
//       for (const id of [...new Set(ids)].sort()) {
//         const product = await loadProduct(id);
//         if (!product) return "ရွေးထားတဲ့ ပစ္စည်းကို ရှာမတွေ့ပါ။";
//         products.set(id, product);
//       }

//       function loadProduct(id: string) {
//         return Product.findOneAndUpdate(
//           { ownerId, _id: id },
//           { $inc: { inventoryVersion: 1 } },
//           { session },
//         ).lean();
//       }

//       const movements = await inventoryMovements(ownerId, session);
//       const balances = new Map([...products].map(([id, product]) => {
//         const movement = movements.get(id);
//         return [id, {
//           quantity: Math.round((product.openingQuantity + (movement?.quantity ?? 0)) * 1000),
//           value: Math.round(product.openingQuantity * product.unitCost) + (movement?.value ?? 0),
//         }];
//       }));

//       const items = [];
//       let cost = 0;
//       for (const { id, quantity, unitPrice, amount } of inputs) {
//         const product = products.get(id)!;
//         const balance = balances.get(id)!;
//         const quantityMillis = Math.round(quantity * 1000);
//         if (quantityMillis > balance.quantity) return product.name + " လက်ကျန် မလုံလောက်ပါ။";
//         const lineCost = Math.round(balance.value * (quantityMillis / balance.quantity));
//         balance.quantity -= quantityMillis;
//         balance.value -= lineCost;
//         cost += lineCost;
//         items.push({ productId: product._id, name: product.name, unit: product.unit, quantity, unitPrice, amount, cost: lineCost });
//       }
//       if (!Number.isSafeInteger(cost)) return "စုစုပေါင်းကုန်ကျစရိတ် ကြီးလွန်းနေပါတယ်။";

      
//       await Sale.create([{ _id: requestId, ownerId, date, customer, items, total, cost }], { session });
//       return null;
//     });
//     if (error) return error;
//   } catch (error) {
//     console.error("Could not save sale", error);
//     return "ရောင်းစာရင်းကို သိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။";
//   }

//   revalidatePath("/dashboard/products");
//   redirect(path + "?saved=" + requestId);
// }

// export default async function NewSalePage({ searchParams }: {
//   searchParams: Promise<{ saved?: string }>;
// }) {
//   const ownerId = await getOwnerId();
//   const { saved } = await searchParams;
//   await connectToDB();

//   const [products, receipt] = await Promise.all([
//     Product.find({ ownerId }).sort({ name: 1 }).lean(),
//     saved && Types.ObjectId.isValid(saved) ? Sale.findOne({ ownerId, _id: saved }).lean() : null,
//   ]);
//   const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());

//   return (
//     <div className="space-y-4">
//       <BreadCrumbItem />
//       <Card className="ring-1 ring-blue-500/15">
//         <CardHeader className="rounded-t-xl bg-blue-50 dark:bg-blue-950/40">
//           <CardTitle><h1>ရောင်းစာရင်းအသစ်</h1></CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {receipt && (
//             <p role="status" className="text-blue-700 dark:text-blue-300">
//               သိမ်းပြီးပါပြီ။ ရောင်းရငွေ {receipt.total.toLocaleString("en-US")} ကျပ်၊
//               အရောင်းအမြတ် {(receipt.total - receipt.cost).toLocaleString("en-US")} ကျပ်။
//             </p>
//           )}
//           {products.length ? (
//             <PurchaseForm
//               key={receipt ? String(receipt._id) : "new"}
//               mode="sale"
//               requestId={new Types.ObjectId().toHexString()}
//               date={date}
//               save={saveSale}
//               products={products.map(({ _id, name, code, unit, sellingPrice }) => ({
//                 id: String(_id), name, code, unit, unitCost: sellingPrice,
//               }))}
//             />
//           ) : (
//             <Link className="text-blue-600 underline" href="/dashboard/products">
//               ကုန်ပစ္စည်းစာရင်းမှာ ပစ္စည်းအရင်ထည့်ပါ
//             </Link>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }









import mongoose, { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { inventoryMovements } from "@/lib/mongoDB/inventory";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Product from "@/lib/mongoDB/models/product";
import Sale from "@/lib/mongoDB/models/sale";
import { purchaseAmount, readNumber } from "@/components/product/amount";
import { isVissUnit, readKyatthaSale } from "@/components/product/sale-weight";
import PurchaseForm from "@/components/product/purchase-form";



const path = "/dashboard/sales/new";

async function getOwnerId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  return session.user.id;
}

async function saveSale(form: FormData): Promise<string> {
  "use server";

  const ownerId = await getOwnerId();
  const requestId = String(form.get("requestId") ?? "");
  const date = String(form.get("date") ?? "");
  const customer = String(form.get("supplier") ?? "").trim();
  const timestamp = Date.parse(date);
  if (!Types.ObjectId.isValid(requestId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date ||
      customer.length > 120) return "ရောင်းချရက်နဲ့ ဝယ်သူအမည်ကို စစ်ပါ။";

  const ids = form.getAll("productId").map(String);
  const quantities = form.getAll("quantity").map(String);
  const prices = form.getAll("unitCost").map(String);
  const units = form.getAll("saleUnit").map(String);
  if ((units.length > 0 && units.length !== ids.length) ||
      units.some((unit) => unit !== "stock" && unit !== "kyattha")) return "ရောင်းချယူနစ်ကို စစ်ပါ။";
  if (!ids.length || ids.length > 100 || ids.length !== quantities.length ||
      ids.length !== prices.length || ids.some((id) => !Types.ObjectId.isValid(id))) {
    return "ပစ္စည်းစာရင်းကို စစ်ပါ။";
  }

  const inputs: Array<{ id: string; kyattha: boolean; quantity: number; amount: number; unitPrice: number; stockMillis: number }> = [];
  for (const [index, id] of ids.entries()) {
    const kyattha = units[index] === "kyattha";
    if (kyattha) {
      const line = readKyatthaSale(quantities[index], prices[index]);
      if (!line) return "ကျပ်သားဖြင့်ရောင်းလျှင် အနည်းဆုံး ၁၀ ကျပ်သားနဲ့ စုစုပေါင်းရောင်းဈေးကို ထည့်ပါ။";
      inputs.push({ id, kyattha, ...line });
    } else {
      const quantity = readNumber(quantities[index], 3);
      const amount = purchaseAmount(quantities[index], prices[index]);
      if (!Number.isSafeInteger(amount)) return "အရေအတွက်နဲ့ ရောင်းဈေးကို စစ်ပါ။";
      inputs.push({ id, kyattha, quantity, amount, unitPrice: readNumber(prices[index], 0), stockMillis: Math.round(quantity * 1000) });
    }
  }
  const total = inputs.reduce((sum, item) => sum + item.amount, 0);
  if (!Number.isSafeInteger(total)) return "စုစုပေါင်းရောင်းဈေးကို စစ်ပါ။";

  try {
    await connectToDB();
    const error = await mongoose.connection.transaction(async (session) => {
      if (await Sale.exists({ ownerId, _id: requestId }).session(session)) return null;

      // Lock the same product documents in a consistent order for concurrent sales.
      const products = new Map<string, NonNullable<Awaited<ReturnType<typeof loadProduct>>>>();
      for (const id of [...new Set(ids)].sort()) {
        const product = await loadProduct(id);
        if (!product) return "ရွေးထားတဲ့ ပစ္စည်းကို ရှာမတွေ့ပါ။";
        products.set(id, product);
      }

      function loadProduct(id: string) {
        return Product.findOneAndUpdate(
          { ownerId, _id: id, archivedAt: null },
          { $inc: { inventoryVersion: 1 } },
          { session },
        ).lean();
      }

      const movements = await inventoryMovements(ownerId, session);
      const balances = new Map([...products].map(([id, product]) => {
        const movement = movements.get(id);
        return [id, {
          quantity: Math.round((product.openingQuantity + (movement?.quantity ?? 0)) * 1000),
          value: (product.openingPurchaseTotal ?? Math.round(product.openingQuantity * product.unitCost)) + (movement?.value ?? 0),
        }];
      }));

      const items = [];
      let cost = 0;
      for (const { id, kyattha, quantity, unitPrice, amount, stockMillis } of inputs) {
        const product = products.get(id)!;
        const balance = balances.get(id)!;
        if (kyattha && !isVissUnit(product.unit)) return "ပိဿာဖြင့် သိမ်းထားသော ပစ္စည်းကိုသာ ကျပ်သားဖြင့် ရောင်းနိုင်ပါသည်။";
        if (stockMillis > balance.quantity) return product.name + " လက်ကျန် မလုံလောက်ပါ။";
        const lineCost = Math.round(balance.value * (stockMillis / balance.quantity));
        balance.quantity -= stockMillis;
        balance.value -= lineCost;
        cost += lineCost;
        items.push({ productId: product._id, name: product.name, unit: kyattha ? "ကျပ်သား" : product.unit, quantity, stockQuantity: kyattha ? stockMillis / 1000 : undefined, unitPrice, amount, cost: lineCost });
      }
      if (!Number.isSafeInteger(cost)) return "စုစုပေါင်းကုန်ကျစရိတ် ကြီးလွန်းနေပါတယ်။";

      await Sale.create([{ _id: requestId, ownerId, date, customer, items, total, cost }], { session });
      return null;
    });
    if (error) return error;
  } catch (error) {
    console.error("Could not save sale", error);
    if (error instanceof mongoose.mongo.MongoServerError &&
        error.code === 20 && error.message.includes("Transaction numbers are only allowed")) {
      return "ရောင်းစာရင်းသိမ်းရန် MongoDB ကို Replica Set ဖြင့် ချိတ်ဆက်ပါ။";
    }
    return "ရောင်းစာရင်းကို သိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။";
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/sales");
  redirect(path + "?saved=" + requestId);
}

export default async function NewSalePage({ searchParams }: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const ownerId = await getOwnerId();
  const { saved } = await searchParams;
  await connectToDB();

  const [products, receipt] = await Promise.all([
    Product.find({ ownerId, archivedAt: null }).sort({ name: 1 }).lean(),
    saved && Types.ObjectId.isValid(saved) ? Sale.findOne({ ownerId, _id: saved }).lean() : null,
  ]);
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className="ring-1 ring-blue-500/15">
        <CardHeader className="flex flex-wrap items-center justify-between rounded-t-xl bg-blue-50 dark:bg-blue-950/40">
          <CardTitle><h1>ရောင်းစာရင်းအသစ်</h1></CardTitle>
          <Link href="/dashboard/sales" className="text-sm text-blue-700 underline dark:text-blue-300">
            ရောင်းစာရင်းသို့
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {receipt && (
            <p role="status" className="text-blue-700 dark:text-blue-300">
              သိမ်းပြီးပါပြီ။ ရောင်းရငွေ {receipt.total.toLocaleString("en-US")} ကျပ်၊
              အရောင်းအမြတ် {(receipt.total - receipt.cost).toLocaleString("en-US")} ကျပ်။
            </p>
          )}
          {products.length ? (
            <PurchaseForm
              key={receipt ? String(receipt._id) : "new"}
              mode="sale"
              requestId={new Types.ObjectId().toHexString()}
              date={date}
              save={saveSale}
              products={products.map(({ _id, name, code, unit, sellingPrice }) => ({
                id: String(_id), name, code, unit, unitCost: sellingPrice,
              }))}
            />
          ) : (
            <Link className="text-blue-600 underline" href="/dashboard/products">
              ကုန်ပစ္စည်းစာရင်းမှာ ပစ္စည်းအရင်ထည့်ပါ
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
