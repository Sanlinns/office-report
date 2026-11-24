import DeleteCategoryButton from "./delete-category-button";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Category from "@/lib/mongoDB/models/category";
import Product from "@/lib/mongoDB/models/product";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const path = "/dashboard/categories";
const messages = {
  removed: "အမျိုးအစား ဖယ်ရှားပြီးပါပြီ။",
  saved: "ပစ္စည်းအမျိုးအစား သိမ်းပြီးပါပြီ။",
  assigned: "ပစ္စည်းအမျိုးအစား သတ်မှတ်ပြီးပါပြီ။",
  duplicate: "ဒီအမျိုးအစားအမည် ရှိပြီးသားပါ။",
  invalid: "ဖြည့်ထားတဲ့ အချက်အလက်ကို ပြန်စစ်ပါ။",
  failed: "သိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။",
};

async function owner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  return session.user.id;
}

async function addCategory(form: FormData) {
  "use server";

  const ownerId = await owner();
  const name = String(form.get("name") ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
  const unit = String(form.get("unit") ?? "").trim();
  if (!name || name.length > 80 || unit.length > 30) redirect(path + "?status=invalid");

  try {
    await connectToDB();
    await Category.init();
    await Category.create({ ownerId, name, unit: unit || undefined, nameKey: name.toLowerCase() });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === 11000;
    redirect(path + "?status=" + (duplicate ? "duplicate" : "failed"));
  }

  revalidatePath("/dashboard/products");
  redirect(path + "?status=saved");
}

async function assignCategory(form: FormData) {
  "use server";

  const ownerId = await owner();
  const productId = String(form.get("productId") ?? "");
  const categoryId = String(form.get("categoryId") ?? "");
  if (!Types.ObjectId.isValid(productId) || (categoryId && !Types.ObjectId.isValid(categoryId))) {
    redirect(path + "?status=invalid");
  }

  await connectToDB();
  if (categoryId && !await Category.exists({ ownerId, _id: categoryId, archivedAt: null })) {
    redirect(path + "?status=invalid");
  }

  const result = await Product.updateOne(
    { ownerId, _id: productId, archivedAt: null },
    { $set: { categoryId: categoryId || null } },
  );
  if (!result.matchedCount) redirect(path + "?status=invalid");

  revalidatePath("/dashboard/products");
  redirect(path + "?status=assigned");
}

async function removeCategory(id: string) {
  "use server";

  const ownerId = await owner();
  if (!Types.ObjectId.isValid(id)) redirect(path + "?status=invalid");

  try {
    await connectToDB();
    const result = await Category.deleteOne({ ownerId, _id: id });
    if (!result.acknowledged || result.deletedCount !== 1) {
      throw new Error("Category was not deleted");
    }
  } catch (error) {
    console.error("Could not delete category", error);
    redirect(path + "?status=failed");
  }

  revalidatePath(path);
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/purchases/new");
  revalidatePath("/dashboard/purchases");
  redirect(path + "?status=removed");
}

export default async function CategoriesPage({ searchParams }: {
  searchParams: Promise<{ status?: string }>;
}) {
  const ownerId = await owner();
  const { status } = await searchParams;
  await connectToDB();
  const [categories, products] = await Promise.all([
    Category.find({ ownerId, archivedAt: null }).sort({ name: 1 }).lean(),
    Product.find({ ownerId, archivedAt: null }).sort({ name: 1 }).select("name code categoryId").lean(),
  ]);
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.categoryId) continue;
    const id = String(product.categoryId);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className="border-blue-500/20">
        <CardHeader className="rounded-t-xl bg-blue-50 dark:bg-blue-950/40">
          <CardTitle><h1>ပစ္စည်းအမျိုးအစား</h1></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && Object.hasOwn(messages, status) && (
            <p role="status" className="text-sm">{messages[status as keyof typeof messages]}</p>
          )}
          <form action={addCategory} className="flex flex-wrap items-end gap-3">
            <label className="grid gap-2 text-sm">
              အမျိုးအစားအမည်
              <Input name="name" maxLength={80} required placeholder="ဥပမာ · စားသောက်ကုန်" />
            </label>
            <label className="grid gap-2 text-sm">
              မူလယူနစ်
              <Input name="unit" maxLength={30} placeholder="ဥပမာ · ဘူး၊ ထုပ်၊ ပိဿာ" />
            </label>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">အမျိုးအစားထည့်ရန်</Button>
            <Button variant="outline" asChild><Link href="/dashboard/products">ကုန်ပစ္စည်းစာရင်းသို့</Link></Button>
          </form>
        </CardContent>
      </Card>

      {products.length > 0 && categories.length > 0 && (
        <Card>
          <CardHeader><CardTitle><h2>ရှိပြီးသားပစ္စည်းကို အမျိုးအစားသတ်မှတ်ရန်</h2></CardTitle></CardHeader>
          <CardContent>
            <form action={assignCategory} className="flex flex-wrap items-end gap-3">
              <label className="grid gap-2 text-sm">
                ပစ္စည်း
                <select name="productId" required className="h-9 rounded-md border bg-background px-2">
                  <option value="">ပစ္စည်းရွေးရန်</option>
                  {products.map((product) => <option key={String(product._id)} value={String(product._id)}>{product.name} · {product.code}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                အမျိုးအစား
                <select name="categoryId" className="h-9 rounded-md border bg-background px-2">
                  <option value="">အမျိုးအစားမသတ်မှတ်ပါ</option>
                  {categories.map((category) => <option key={String(category._id)} value={String(category._id)}>{category.name}</option>)}
                </select>
              </label>
              <Button>သိမ်းမည်</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle><h2>အမျိုးအစားစာရင်း</h2></CardTitle></CardHeader>
        <CardContent>
          {categories.length ? (
            <ul className="divide-y rounded-lg border">
              {categories.map((category) => (
                <li key={String(category._id)} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    {category.unit && <p className="text-muted-foreground">မူလယူနစ် · {category.unit}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">ပစ္စည်း {counts.get(String(category._id)) ?? 0} မျိုး</span>
                    <DeleteCategoryButton name={category.name} action={removeCategory.bind(null, String(category._id))} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">အမျိုးအစား မရှိသေးပါ။</p>}
        </CardContent>
      </Card>
    </div>
  );
}
