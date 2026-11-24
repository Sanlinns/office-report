"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Product from "@/lib/mongoDB/models/product";
import Sale from "@/lib/mongoDB/models/sale";

export async function deleteSales(ids: string[]): Promise<
  { ok: true; count: number } | { ok: false; message: string }
> {
  const session = await auth.api.getSession({ query: { disableCookieCache: true }, headers: await headers() });
  if (!session?.user.id) return { ok: false, message: "အကောင့်ပြန်ဝင်ပြီး စမ်းကြည့်ပါ။" };

  if (!Array.isArray(ids) || !ids.length || ids.length > 500 ||
      ids.some((id) => typeof id !== "string" || !/^[0-9a-f]{24}$/i.test(id))) {
    return { ok: false, message: "ဖျက်ရန် စာရင်း ၁ စောင်မှ ၅၀၀ စောင်အထိ ရွေးပါ။" };
  }

  const ownerId = session.user.id;
  let count: number;
  try {
    await connectToDB();
    count = await mongoose.connection.transaction(async (dbSession) => {
      const filter = { ownerId, _id: { $in: ids } };
      const sales = await Sale.find(filter).select("items.productId").session(dbSession).lean();
      if (!sales.length) return 0;

      const productIds = [...new Set(sales.flatMap(({ items }) =>
        items.map(({ productId }) => String(productId)),
      ))];

      // Serialize stock changes with concurrent sale creation.
      await Product.updateMany(
        { ownerId, _id: { $in: productIds } },
        { $inc: { inventoryVersion: 1 } },
        { session: dbSession },
      );
      const result = await Sale.deleteMany(filter).session(dbSession);
      return result.deletedCount;
    });
  } catch (error) {
    console.error("Could not delete sales", error);
    return { ok: false, message: "အရောင်းစာရင်း ဖျက်လို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။" };
  }

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard/products");
  return { ok: true, count };
}
