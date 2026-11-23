import { Plus, RefreshCw } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import PurchasesTable from "@/components/dashboard/purchases/PurchasesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatKyat } from "@/lib/format-kyat";
import Category from "@/lib/mongoDB/models/category";
import Purchase from "@/lib/mongoDB/models/purchase";
import { connectToDB } from "@/lib/mongoDB/mongoDB";

const cardStyle = "relative isolate overflow-hidden border-0 bg-gradient-to-br from-blue-50/70 via-background to-muted/20 shadow-lg ring-1 ring-black/5 dark:from-blue-950/40 dark:ring-white/10";

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");

  await connectToDB();
  const ownerId = session.user.id;
  const [purchases, categories] = await Promise.all([
    Purchase.find({ ownerId }).sort({ date: -1, _id: -1 }).lean(),
    Category.find({ ownerId }).select("name").lean(),
  ]);
  const categoryNames = new Map(categories.map(({ _id, name }) => [String(_id), name]));
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());
  const month = today.slice(0, 7);

  const rows = purchases.map(({ date, supplier, items, total }) => ({
    date,
    supplier,
    names: [...new Set(items.map(({ name }) => name))].join(", "),
    categories: items.map(({ categoryId }) => categoryNames.get(String(categoryId)) ?? "").join(", "),
    items: items.map(({ name, unit, quantity, unitCost, amount }) => ({
      name, unit, quantity, unitCost, amount,
    })),
    total,
  }));

  const totals = rows.reduce((summary, row) => {
    summary.all += row.total;
    if (row.date === today) summary.today += row.total;
    if (row.date.slice(0, 7) === month) summary.month += row.total;
    return summary;
  }, { all: 0, today: 0, month: 0 });

  const badges = [
    { label: "စုစုပေါင်းဝယ်ဖိုး", value: formatKyat(totals.all) },
    { label: "ဒီလ", value: formatKyat(totals.month) },
    { label: "ဒီနေ့", value: formatKyat(totals.today) },
    { label: "ဝယ်စာရင်း", value: rows.length.toLocaleString("en-US") + " စောင်" },
  ];

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className={cardStyle}>
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 -z-10 size-72 rounded-full bg-blue-400/25 blur-3xl" />
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <CardTitle className="text-base font-semibold"><h1>အဝယ်</h1></CardTitle>
            <div className="flex flex-wrap gap-2">
              {badges.map(({ label, value }) => (
                <Badge key={label} variant="secondary" className="rounded-full bg-background/60">
                  {label} <span className="ml-1 font-semibold tabular-nums">{value}</span>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/dashboard/purchases/new"><Plus aria-hidden /> ဝယ်စာရင်းအသစ်</Link>
            </Button>
            <Button asChild variant="outline" className="bg-background/60">
              <a href="/dashboard/purchases"><RefreshCw aria-hidden /> ပြန်ဖတ်ရန်</a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className={cardStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold"><h2>ဝယ်စာရင်း</h2></CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length ? <PurchasesTable rows={rows} today={today} /> : (
            <p className="py-6 text-center text-sm text-muted-foreground">ဝယ်စာရင်း မရှိသေးပါ။</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
