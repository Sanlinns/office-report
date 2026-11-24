"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Product from "@/lib/mongoDB/models/product";

export async function archiveProducts(ids: string[]): Promise<
  { ok: true; count: number; archivedIds: string[] } | { ok: false; message: string }
> {
  const session = await auth.api.getSession({ query: { disableCookieCache: true }, headers: await headers() });
  if (!session?.user.id) return { ok: false, message: "အကောင့်ပြန်ဝင်ပြီး စမ်းကြည့်ပါ။" };

  if (!Array.isArray(ids) || !ids.length ||
      ids.some((id) => typeof id !== "string" || !/^[0-9a-f]{24}$/i.test(id))) {
    return { ok: false, message: "ဖယ်ရှားမယ့် ပစ္စည်းစာရင်းကို ပြန်စစ်ပါ။" };
  }

  let count: number;
  let archivedIds: string[];
  try {
    await connectToDB();
    const selection = { ownerId: session.user.id, _id: { $in: ids } };
    const result = await Product.updateMany(
      { ...selection, archivedAt: null },
      { $set: { archivedAt: new Date() } },
      { strict: "throw" },
    );
    const archived = await Product.find({ ...selection, archivedAt: { $type: "date" } })
      .select("_id")
      .lean();
    archivedIds = archived.map(({ _id }) => String(_id));
    if (!archivedIds.length) {
      return { ok: false, message: "ရွေးထားတဲ့ ပစ္စည်းတွေကို ဖယ်ရှားပြီးကြောင်း အတည်မပြုနိုင်ပါ။" };
    }
    count = result.modifiedCount;
  } catch (error) {
    console.error("Could not archive products", error);
    return { ok: false, message: "ပစ္စည်း ဖယ်ရှားလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။" };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/purchases/new");
  revalidatePath("/dashboard/sales/new");
  return { ok: true, count, archivedIds };
}