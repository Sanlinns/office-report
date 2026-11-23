// import { Types } from "mongoose";
// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { auth } from "@/lib/auth";
// import { connectToDB } from "@/lib/mongoDB/mongoDB";
// import Product from "@/lib/mongoDB/models/product";
// import Purchase from "@/lib/mongoDB/models/purchase";
// import { purchaseAmount, readNumber } from "@/components/product/amount";
// import PurchaseForm from "@/components/product/purchase-form";

// const path = "/dashboard/purchases/new";

// async function getOwnerId() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user.id) redirect("/sign-in");
//   return session.user.id;
// }

// async function savePurchase(form: FormData): Promise<string> {
//   "use server";

//   const ownerId = await getOwnerId();
//   const requestId = String(form.get("requestId") ?? "");
//   const date = String(form.get("date") ?? "");
//   const supplier = String(form.get("supplier") ?? "").trim();
//   const timestamp = Date.parse(date);
//   if (!Types.ObjectId.isValid(requestId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
//       !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date ||
//       !supplier || supplier.length > 120) return "ဝယ်ယူရက်နဲ့ ဆိုင်အမည်ကို စစ်ပါ။";

//   const ids = form.getAll("productId").map(String);
//   const quantities = form.getAll("quantity").map(String);
//   const costs = form.getAll("unitCost").map(String);
//   if (ids.length < 1 || ids.length > 100 || ids.length !== quantities.length ||
//       ids.length !== costs.length || ids.some((id) => !Types.ObjectId.isValid(id))) {
//     return "ပစ္စည်းစာရင်းကို စစ်ပါ။";
//   }

//   try {
//     await connectToDB();
//     const products = await Product.find({ ownerId, _id: { $in: ids } }).lean();
//     const byId = new Map(products.map((product) => [String(product._id), product]));
//     const items = ids.map((id, index) => {
//       const product = byId.get(id);
//       const amount = purchaseAmount(quantities[index], costs[index]);
//       if (!product || !Number.isFinite(amount)) return null;
//       return {
//         productId: product._id,
//         name: product.name,
//         unit: product.unit,
//         quantity: readNumber(quantities[index], 3),
//         unitCost: readNumber(costs[index], 0),
//         amount,
//       };
//     });
//     if (items.some((item) => item === null)) return "ပစ္စည်း၊ အရေအတွက်နဲ့ ဈေးနှုန်းကို စစ်ပါ။";
//     const total = items.reduce((sum, item) => sum + (item?.amount ?? 0), 0);
//     if (!Number.isSafeInteger(total)) return "စုစုပေါင်းငွေပမာဏ ကြီးလွန်းနေပါတယ်။";

//     await Purchase.updateOne(
//       { _id: requestId, ownerId },
//       { $setOnInsert: { ownerId, date, supplier, items, total } },
//       { upsert: true, runValidators: true },
//     );
//   } catch (error) {
//     console.error("Could not save purchase", error);
//     return "ဝယ်စာရင်းကို သိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။";
//   }

//   revalidatePath("/dashboard/products");
//   redirect(path + "?saved=" + requestId);
// }

// export default async function NewPurchasePage({
//   searchParams,
// }: {
//   searchParams: Promise<{ saved?: string }>;
// }) {
//   const ownerId = await getOwnerId();
//   const { saved } = await searchParams;
//   await connectToDB();
//   const products = await Product.find({ ownerId }).sort({ name: 1 }).lean();
//   const receipt = saved && Types.ObjectId.isValid(saved)
//     ? await Purchase.findOne({ ownerId, _id: saved }).lean()
//     : null;
//   const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());

//   return (
//     <div className="space-y-4">
//       <BreadCrumbItem />
//       <Card className="ring-1 ring-blue-500/15">
//         <CardHeader className="rounded-t-xl bg-blue-50 dark:bg-blue-950/40">
//           <CardTitle><h1>ဝယ်စာရင်းအသစ်</h1></CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {receipt && <p role="status" className="text-blue-700 dark:text-blue-300">
//             ဝယ်စာရင်းသိမ်းပြီးပါပြီ။ စုစုပေါင်း {receipt.total.toLocaleString("en-US")} ကျပ်
//           </p>}
//           {products.length ? (
//             <PurchaseForm
//               key={saved ?? "new"}
//               requestId={new Types.ObjectId().toHexString()}
//               date={date}
//               save={savePurchase}
//               products={products.map(({ _id, name, code, unit, unitCost }) => ({
//                 id: String(_id), name, code, unit, unitCost,
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







import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Product from "@/lib/mongoDB/models/product";
import Purchase from "@/lib/mongoDB/models/purchase";
import { purchaseAmount, readNumber } from "@/components/product/amount";
import PurchaseForm from "@/components/product/purchase-form";

const path = "/dashboard/purchases/new";

async function getOwnerId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  return session.user.id;
}

async function savePurchase(form: FormData): Promise<string> {
  "use server";

  const ownerId = await getOwnerId();
  const requestId = String(form.get("requestId") ?? "");
  const date = String(form.get("date") ?? "");
  const supplier = String(form.get("supplier") ?? "").trim();
  const timestamp = Date.parse(date);
  if (!Types.ObjectId.isValid(requestId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date ||
      !supplier || supplier.length > 120) return "ဝယ်ယူရက်နဲ့ ဆိုင်အမည်ကို စစ်ပါ။";

  const ids = form.getAll("productId").map(String);
  const quantities = form.getAll("quantity").map(String);
  const costs = form.getAll("unitCost").map(String);
  if (ids.length < 1 || ids.length > 100 || ids.length !== quantities.length ||
      ids.length !== costs.length || ids.some((id) => !Types.ObjectId.isValid(id))) {
    return "ပစ္စည်းစာရင်းကို စစ်ပါ။";
  }

  try {
    await connectToDB();
    const products = await Product.find({ ownerId, archivedAt: null, _id: { $in: ids } }).lean();
    const byId = new Map(products.map((product) => [String(product._id), product]));
    const items = ids.map((id, index) => {
      const product = byId.get(id);
      const amount = purchaseAmount(quantities[index], costs[index]);
      if (!product || !Number.isFinite(amount)) return null;
      return {
        productId: product._id,
        name: product.name,
        unit: product.unit,
        quantity: readNumber(quantities[index], 3),
        unitCost: readNumber(costs[index], 0),
        amount,
      };
    });
    if (items.some((item) => item === null)) return "ပစ္စည်း၊ အရေအတွက်နဲ့ ဈေးနှုန်းကို စစ်ပါ။";
    const total = items.reduce((sum, item) => sum + (item?.amount ?? 0), 0);
    if (!Number.isSafeInteger(total)) return "စုစုပေါင်းငွေပမာဏ ကြီးလွန်းနေပါတယ်။";

    await Purchase.updateOne(
      { _id: requestId, ownerId },
      { $setOnInsert: { ownerId, date, supplier, items, total } },
      { upsert: true, runValidators: true },
    );
  } catch (error) {
    console.error("Could not save purchase", error);
    return "ဝယ်စာရင်းကို သိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။";
  }

  revalidatePath("/dashboard/products");
  redirect(path + "?saved=" + requestId);
}

export default async function NewPurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const ownerId = await getOwnerId();
  const { saved } = await searchParams;
  await connectToDB();
  const products = await Product.find({ ownerId, archivedAt: null }).sort({ name: 1 }).lean();
  const receipt = saved && Types.ObjectId.isValid(saved)
    ? await Purchase.findOne({ ownerId, _id: saved }).lean()
    : null;
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className="ring-1 ring-blue-500/15">
        <CardHeader className="rounded-t-xl bg-blue-50 dark:bg-blue-950/40">
          <CardTitle><h1>ဝယ်စာရင်းအသစ်</h1></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {receipt && <p role="status" className="text-blue-700 dark:text-blue-300">
            ဝယ်စာရင်းသိမ်းပြီးပါပြီ။ စုစုပေါင်း {receipt.total.toLocaleString("en-US")} ကျပ်
          </p>}
          {products.length ? (
            <PurchaseForm
              key={saved ?? "new"}
              requestId={new Types.ObjectId().toHexString()}
              date={date}
              save={savePurchase}
              products={products.map(({ _id, name, code, unit, unitCost }) => ({
                id: String(_id), name, code, unit, unitCost: Number.isSafeInteger(unitCost) ? unitCost : null,
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
