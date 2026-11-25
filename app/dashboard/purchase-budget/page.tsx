import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatKyat } from "@/lib/format-kyat";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Purchase from "@/lib/mongoDB/models/purchase";
import PurchaseBudget from "@/lib/mongoDB/models/purchase-budget";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const path = "/dashboard/purchase-budget";
const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" });

function readAmount(input: unknown) {
  const text = String(input ?? "").trim().replace(/[၀-၉]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x1040),
  );
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return NaN;
  const value = Number(text.replaceAll(",", ""));
  return Number.isSafeInteger(value) ? value : NaN;
}

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");
  await connectToDB();
  return session.user.id;
}

async function openBudget(form: FormData) {
  "use server";
  const ownerId = await requireOwner();
  const amount = readAmount(form.get("amount"));
  const date = String(form.get("date") ?? "");
  if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    redirect(path + "?status=invalid");
  }

  await PurchaseBudget.init();
  await PurchaseBudget.updateOne({ ownerId }, {
    $setOnInsert: { ownerId, openingAmount: amount, openingDate: date },
  }, { upsert: true });
  revalidatePath(path);
  redirect(path + "?status=saved");
}

async function deposit(key: string, form: FormData) {
  "use server";
  const ownerId = await requireOwner();
  const amount = readAmount(form.get("amount"));
  const note = String(form.get("note") ?? "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || note.length > 120) redirect(path + "?status=invalid");

  await PurchaseBudget.updateOne({ ownerId, "deposits.key": { $ne: key } }, {
    $push: { deposits: { key, amount, note, date: dateFormat.format(new Date()) } },
  });
  revalidatePath(path);
  redirect(path + "?status=saved");
}

async function linkPurchase(linked: boolean, form: FormData) {
  "use server";
  const ownerId = await requireOwner();
  const id = String(form.get("purchaseId") ?? "");
  if (!Types.ObjectId.isValid(id) || !await Purchase.exists({ ownerId, _id: id })) {
    redirect(path + "?status=invalid");
  }
  await PurchaseBudget.updateOne({ ownerId }, linked
    ? { $addToSet: { purchaseIds: new Types.ObjectId(id) } }
    : { $pull: { purchaseIds: new Types.ObjectId(id) } });
  revalidatePath(path);
  redirect(path + "?status=saved");
}

export default async function PurchaseBudgetPage({ searchParams }: {
  searchParams: Promise<{ status?: string; planned?: string }>;
}) {
  const ownerId = await requireOwner();
  const { status, planned } = await searchParams;
  const [budget, purchases] = await Promise.all([
    PurchaseBudget.findOne({ ownerId }).lean(),
    Purchase.find({ ownerId }).select("date supplier total").sort({ date: -1, _id: -1 }).lean(),
  ]);

  const ids = new Set(budget?.purchaseIds.map(String));
  const paid = purchases.filter(({ _id }) => ids.has(String(_id)));
  const availablePurchases = purchases.filter(({ _id }) => !ids.has(String(_id)));
  const opening = budget?.openingAmount ?? 0;
  const deposits = budget?.deposits ?? [];
  const replenished = deposits.reduce((sum, entry) => sum + entry.amount, 0);
  const spent = paid.reduce((sum, purchase) => sum + purchase.total, 0);
  const funds = opening + replenished;
  const balance = funds - spent;
  const usage = funds ? Math.round(100 * spent / funds) : 0;
  const plannedAmount = readAmount(planned);

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">ကုန်ဝယ်ရန်ပုံငွေ</h1>
        <Button asChild variant="outline"><Link href="/dashboard/purchases">ဝယ်စာရင်းကြည့်ရန်</Link></Button>
      </div>
      {status === "invalid" && <p role="alert" className="text-sm text-destructive">ဖြည့်ထားတဲ့ ရက်စွဲ၊ ငွေပမာဏ သို့မဟုတ် ဝယ်စာရင်းကို ပြန်စစ်ပါ။</p>}
      {status === "saved" && <p role="status" className="text-sm text-green-700 dark:text-green-300">သိမ်းပြီးပါပြီ။</p>}

      {budget ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "အဖွင့်ရန်ပုံငွေ", value: opening, color: "border-l-blue-500" },
              { label: "ပြန်ထည့်ငွေ", value: replenished, color: "border-l-cyan-500" },
              { label: "သုံးပြီးဝယ်ဖိုး", value: spent, color: "border-l-amber-500" },
              { label: "လက်ရှိလက်ကျန်", value: balance, color: balance < 0 ? "border-l-red-500" : "border-l-green-500" },
            ].map(({ label, value, color }) => (
              <Card key={label} className={`border-l-4 ${color}`}>
                <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
                <CardContent className="text-xl font-semibold tabular-nums">{formatKyat(value)}</CardContent>
              </Card>
            ))}
          </div>
          <label className="grid gap-1 text-sm">
            ရန်ပုံငွေသုံးစွဲမှု {usage}%
            <progress className="h-3 w-full accent-blue-600" max={100} value={Math.min(usage, 100)} />
          </label>
          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>ပေးချေပြီး ဝယ်စာရင်း ချိတ်ရန်</CardTitle></CardHeader>
              <CardContent>
                {availablePurchases.length ? (
                  <form action={linkPurchase.bind(null, true)} className="grid gap-3">
                    <label className="grid gap-2 text-sm">
                      ဝယ်စာရင်း
                      <select name="purchaseId" required className="h-9 min-w-0 rounded-md border bg-background px-2">
                        <option value="">ဝယ်စာရင်းရွေးရန်</option>
                        {availablePurchases.map(({ _id, date, supplier, total }) => (
                          <option key={String(_id)} value={String(_id)}>{date} · {supplier} · {formatKyat(total)}</option>
                        ))}
                      </select>
                    </label>
                    <Button type="submit" className="justify-self-start">ရန်ပုံငွေနဲ့ ချိတ်မည်</Button>
                  </form>
                ) : <p className="text-sm text-muted-foreground">ချိတ်ရန် ဝယ်စာရင်း မရှိသေးပါ။</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>ရန်ပုံငွေ ပြန်ထည့်ရန်</CardTitle></CardHeader>
              <CardContent>
                <form action={deposit.bind(null, new Types.ObjectId().toHexString())} className="grid gap-3">
                  <label className="grid gap-2 text-sm">ပြန်ထည့်ငွေ (ကျပ်)<Input name="amount" inputMode="numeric" required /></label>
                  <label className="grid gap-2 text-sm">မှတ်ချက်<Input name="note" maxLength={120} /></label>
                  <Button type="submit" className="justify-self-start">ပြန်ထည့်ငွေ သိမ်းမည်</Button>
                </form>
              </CardContent>
            </Card>
          </section>
          <Card>
            <CardHeader><CardTitle>နောက်အပတ် ကုန်ဝယ်ရန် ခန့်မှန်းချက်</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <form action={path} method="get" className="flex flex-wrap items-end gap-3">
                <label className="grid gap-2 text-sm">စီစဉ်ထားသောဝယ်ဖိုး (ကျပ်)<Input name="planned" inputMode="numeric" defaultValue={planned} required /></label>
                <Button type="submit" variant="outline">လက်ကျန်တွက်ရန်</Button>
              </form>
              {Number.isFinite(plannedAmount) ? (
                <p>ဝယ်ပြီးနောက် ကျန်မည့်ငွေ <strong>{formatKyat(balance - plannedAmount)}</strong></p>
              ) : planned !== undefined && <p role="alert">ခန့်မှန်းဝယ်ဖိုးကို ပြန်စစ်ပါ။</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>ရန်ပုံငွေမှတ်တမ်း</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="bg-muted">
                  <tr>{["ရက်စွဲ", "စာရင်း", "ငွေဝင်", "ငွေထွက်", "လုပ်ဆောင်ချက်"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-3">{budget.openingDate}</td><td className="p-3">အဖွင့်ရန်ပုံငွေ</td><td className="p-3">{formatKyat(opening)}</td><td /><td /></tr>
                  {deposits.map(({ key, date, amount, note }) => (
                    <tr key={key} className="border-b"><td className="p-3">{date}</td><td className="p-3">ပြန်ထည့်ငွေ {note}</td><td className="p-3">{formatKyat(amount)}</td><td /><td /></tr>
                  ))}
                  {paid.map(({ _id, date, supplier, total }) => (
                    <tr key={String(_id)} className="border-b">
                      <td className="p-3">{date}</td><td className="p-3">{supplier}</td><td /><td className="p-3">{formatKyat(total)}</td>
                      <td className="p-3">
                        <form action={linkPurchase.bind(null, false)}>
                          <input type="hidden" name="purchaseId" value={String(_id)} />
                          <Button type="submit" size="sm" variant="outline">ရန်ပုံငွေမှ ဖြုတ်ရန်</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader><CardTitle>အဖွင့်ရန်ပုံငွေ သတ်မှတ်ရန်</CardTitle></CardHeader>
          <CardContent>
            <form action={openBudget} className="flex flex-wrap items-end gap-3">
              <label className="grid gap-2 text-sm">စတင်ရက်<Input type="date" name="date" defaultValue={dateFormat.format(new Date())} required /></label>
              <label className="grid gap-2 text-sm">အဖွင့်ရန်ပုံငွေ (ကျပ်)<Input name="amount" inputMode="numeric" placeholder="2,000,000" required /></label>
              <Button type="submit">ရန်ပုံငွေ စတင်မည်</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
