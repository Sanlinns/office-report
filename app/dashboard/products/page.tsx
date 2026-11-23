import CategoryUnitFields from "./category-unit-fields";
import { Types } from "mongoose";
import Category from "@/lib/mongoDB/models/category";
import Link from "next/link";
import { inventoryMovements } from "@/lib/mongoDB/inventory";
import ProductsTable from "@/components/dashboard/products/ProductsTable";
import { Package, Plus, RefreshCw } from "lucide-react";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Product from "@/lib/mongoDB/models/product";

const fields = [
  { name: "name", label: "ပစ္စည်းအမည်", maxLength: 120 },
  { name: "code", label: "ပစ္စည်းကုဒ်", maxLength: 40 },
  { name: "openingQuantity", label: "စတင်လက်ကျန် အရေအတွက်", inputMode: "decimal" },
  { name: "openingPurchaseTotal", label: "မူလ စုစုပေါင်းဝယ်ဖိုး (ကျပ်)", inputMode: "numeric" },
  { name: "sellingPrice", label: "ပုံမှန်ရောင်းဈေး (ကျပ်)", inputMode: "numeric" },
] as const;

const messages = {
  saved: "ပစ္စည်းသိမ်းပြီးပါပြီ။",
  invalid: "အချက်အလက်အားလုံးကို ဖြည့်ပြီး လက်ကျန်နဲ့ ဈေးနှုန်းကို ပြန်စစ်ပါ။",
  duplicate: "ဒီပစ္စည်းကုဒ်ကို သုံးထားပြီးပါပြီ။",
  failed: "ပစ္စည်းသိမ်းလို့မရသေးပါ။ ပြန်စမ်းကြည့်ပါ။",
};

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const path = "/dashboard/products";

async function getOwnerId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  return session.user.id;
}

function readNumber(form: FormData, field: string, fractionDigits = 0) {
  const raw = String(form.get(field) ?? "").trim()
    .replace(/[၀-၉]/g, (digit) => String(digit.charCodeAt(0) - 0x1040));
  const parts = raw.split(".");
  const whole = parts[0];
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(whole)) return NaN;
  if (parts.length > 2 || (parts.length === 2 &&
    (!/^\d+$/.test(parts[1]) || parts[1].length > fractionDigits))) return NaN;
  const value = Number(raw.replaceAll(",", ""));
  return Number.isSafeInteger(Math.round(value * 10 ** fractionDigits)) ? value : NaN;
}

async function addProduct(form: FormData) {
  "use server";

  const ownerId = await getOwnerId();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const name = String(form.get("name") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "");
  const unit = String(form.get("unit") ?? "").trim();
  const openingQuantity = readNumber(form, "openingQuantity", 3);
  const openingPurchaseTotal = readNumber(form, "openingPurchaseTotal");
  const sellingPrice = readNumber(form, "sellingPrice");

  if (!code || code.length > 40 || !name || name.length > 120 ||
      !unit || unit.length > 30 ||
      ![openingQuantity, openingPurchaseTotal, sellingPrice].every(Number.isFinite) ||
      (openingQuantity === 0 && openingPurchaseTotal !== 0)) {
    redirect(path + "?status=invalid");
  }

  const unitCost = openingQuantity > 0 ? openingPurchaseTotal / openingQuantity : 0;
  let status: keyof typeof messages = "saved";
  try {
    await connectToDB();
    if (categoryId && (!Types.ObjectId.isValid(categoryId) || !await Category.exists({ ownerId, _id: categoryId }))) {
      status = "invalid";
    } else {
      await Product.init();
      await Product.create({ ownerId, code, name, unit, categoryId: categoryId || null, openingQuantity, openingPurchaseTotal, unitCost, sellingPrice });
    }
  } catch (error) {
    status = typeof error === "object" && error !== null &&
      "code" in error && error.code === 11000 ? "duplicate" : "failed";
  }

  redirect(path + "?status=" + status);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const ownerId = await getOwnerId();
  const { status } = await searchParams;
  await connectToDB();
  const [products, movements, categories] = await Promise.all([
    Product.find({ ownerId, archivedAt: null }).sort({ name: 1, code: 1 }).lean(),
    inventoryMovements(ownerId),
    Category.find({ ownerId }).sort({ name: 1 }).lean(),
  ]);
  const categoryNames = new Map(categories.map(({ _id, name }) => [String(_id), name]));
  const message = status && Object.hasOwn(messages, status)
    ? messages[status as keyof typeof messages]
    : null;

  const blueButton = "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700";
  const cardStyle = "relative isolate overflow-hidden border-0 bg-gradient-to-br from-blue-50/70 via-background to-muted/20 shadow-lg ring-1 ring-black/5 dark:from-blue-950/40 dark:ring-white/10";

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className={cardStyle}>
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 -z-10 size-72 rounded-full bg-blue-400/25 blur-3xl" />
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <CardTitle className="text-base font-semibold">
              <h1>ကုန်ပစ္စည်း</h1>
            </CardTitle>
            <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <Package aria-hidden />
              ပစ္စည်းအမျိုးအစား {number.format(products.length)} မျိုး
            </Badge>
            {message && <p role="status" className="text-sm">{message}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/purchase/new">ဝယ်စာရင်းအသစ်</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/sales/new">ရောင်းစာရင်းအသစ်</Link>
            </Button>
            <Button variant="outline" asChild><Link href="/dashboard/categories">အမျိုးအစား</Link></Button>
            <Dialog key={status ?? "new"}>
              <DialogTrigger asChild>
                <Button className={blueButton}>
                  <Plus aria-hidden /> ပစ္စည်းအသစ်ထည့်ရန်
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>ပစ္စည်းအသစ်ထည့်ရန်</DialogTitle>
                  <DialogDescription>ဈေးနှုန်းများကို မြန်မာကျပ်ဖြင့် ထည့်ပါ။</DialogDescription>
                </DialogHeader>
                <form action={addProduct} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CategoryUnitFields categories={categories.map(({ _id, name, unit }) => ({
                      id: String(_id), name, unit: unit ?? "",
                    }))} />
                    {fields.map((field) => (
                      <label key={field.name} className="grid gap-2 text-sm">
                        <span>{field.label}</span>
                        <input
                          name={field.name}
                          required
                          maxLength={"maxLength" in field ? field.maxLength : 24}
                          inputMode={"inputMode" in field ? field.inputMode : undefined}
                          className="min-w-0 rounded-md border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                  <Button type="submit" className={blueButton}>
                    သိမ်းမည်
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="bg-background/60" asChild>
              <a href={path}><RefreshCw aria-hidden /> ပြန်ဖတ်ရန်</a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className={cardStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            <h2>ကုန်ပစ္စည်းစာရင်း</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable rows={products.map((product) => ({
            id: String(product._id),
            name: product.name,
            category: categoryNames.get(String(product.categoryId)) ?? "",
            code: product.code,
            unit: product.unit,
            openingQuantity: product.openingQuantity,
            stockQuantity: product.openingQuantity + (movements.get(String(product._id))?.quantity ?? 0),
            openingPurchaseTotal: product.openingPurchaseTotal ?? Math.round(product.openingQuantity * product.unitCost),
            unitCost: product.unitCost,
            sellingPrice: product.sellingPrice,
          }))} />
        </CardContent>
      </Card>
    </div>
  );
}
