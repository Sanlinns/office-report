"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import { inventoryMovements } from "@/lib/mongoDB/inventory";
import Product from "@/lib/mongoDB/models/product";
import Purchase from "@/lib/mongoDB/models/purchase";

export async function deletePurchase(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await auth.api.getSession({ query: { disableCookieCache: true }, headers: await headers() });
  if (!session?.user.id) return { ok: false, message: "အကောင့်ပြန်ဝင်ပြီး စမ်းကြည့်ပါ။" };
  if (typeof id !== "string" || !/^[0-9a-f]{24}$/i.test(id)) {
    return { ok: false, message: "ဝယ်စာရင်းနံပါတ်ကို ပြန်စစ်ပါ။" };
  }

  const ownerId = session.user.id;
  try {
    await connectToDB();
    const problem = await mongoose.connection.transaction(async (dbSession) => {
      const filter = { ownerId, _id: id };
      const purchase = await Purchase.findOne(filter).session(dbSession).lean();
      if (!purchase) return null;

      const removed = new Map<string, { quantity: number; value: number }>();
      for (const item of purchase.items) {
        if (!item.productId) continue;
        const key = String(item.productId);
        const entry = removed.get(key) ?? { quantity: 0, value: 0 };
        entry.quantity += item.quantity;
        entry.value += item.amount;
        removed.set(key, entry);
      }

      if (removed.size) {
        // Use the same product write lock as sale creation.
        const products = await Product.find({ ownerId, _id: { $in: [...removed.keys()] } })
          .session(dbSession).lean();
        await Product.updateMany(
          { ownerId, _id: { $in: products.map(({ _id }) => _id) } },
          { $inc: { inventoryVersion: 1 } },
          { session: dbSession },
        );
        const movements = await inventoryMovements(ownerId, dbSession);
        for (const product of products) {
          const key = String(product._id);
          const entry = removed.get(key)!;
          const movement = movements.get(key);
          const quantity = Math.round((product.openingQuantity + (movement?.quantity ?? 0) - entry.quantity) * 1000);
          const openingValue = product.openingPurchaseTotal ?? Math.round(product.openingQuantity * product.unitCost);
          const value = openingValue + (movement?.value ?? 0) - entry.value;
          if (quantity < 0 || value < 0 || (quantity === 0 && value !== 0)) {
            return product.name + " ရဲ့ ကုန်လက်ကျန် သို့မဟုတ် လက်ကျန်တန်ဖိုး မကိုက်ညီတော့လို့ ဖျက်လို့မရပါ။";
          }
        }
      }

      await Purchase.deleteOne(filter).session(dbSession);
      return null;
    });
    if (problem) return { ok: false, message: problem };
  } catch (error) {
    console.error("Could not delete purchase", error);
    return { ok: false, message: "ဝယ်စာရင်း ဖျက်လို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။" };
  }

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/purchases/new");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/sales/new");
  return { ok: true };
}