import { Plus, RefreshCw } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import SalesTable from "@/components/dashboard/sales/SalesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatKyat } from "@/lib/format-kyat";
import Sale from "@/lib/mongoDB/models/sale";
import { connectToDB } from "@/lib/mongoDB/mongoDB";

const quantityFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

const cardStyle = "relative isolate overflow-hidden border-0 bg-gradient-to-br from-blue-50/70 via-background to-muted/20 shadow-lg ring-1 ring-black/5 dark:from-blue-950/40 dark:ring-white/10";

export default async function SalesPage() {
  const session = await auth.api.getSession({ query: { disableCookieCache: true }, headers: await headers() });
  if (!session?.user.id) redirect("/sign-in");

  await connectToDB();
  const sales = await Sale.find({ ownerId: session.user.id }).sort({ date: -1, _id: -1 }).lean();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Yangon" }).format(new Date());
  const month = today.slice(0, 7);

  const rows = sales.map(({ _id, date, customer, items, total, cost }) => ({
    id: _id.toString(),
    date,
    customer: customer ?? "",
    products: items.map(({ name }) => name).join(", "),
    items: items.map(({ name, quantity, unit, amount }) => ({
      name,
      quantity: `${quantityFormat.format(quantity)} ${unit}`,
      amount,
    })),
    total,
    profit: total - cost,
  }));

  const totals = rows.reduce((summary, row) => {
    summary.revenue += row.total;
    summary.profit += row.profit;
    if (row.date === today) summary.today += row.total;
    if (row.date.slice(0, 7) === month) summary.month += row.total;
    return summary;
  }, { revenue: 0, profit: 0, today: 0, month: 0 });

  const badges = [
    { label: "စုစုပေါင်းရောင်းရငွေ", value: formatKyat(totals.revenue) },
    { label: "ဒီလ", value: formatKyat(totals.month) },
    { label: "ဒီနေ့", value: formatKyat(totals.today) },
    { label: "အရောင်းအမြတ်", value: formatKyat(totals.profit) },
    { label: "အရောင်းစာရင်း", value: rows.length.toLocaleString("en-US") + " စောင်" },
  ];

  return (
    <div className="space-y-4">
      <BreadCrumbItem />
      <Card className={cardStyle}>
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 -z-10 size-72 rounded-full bg-blue-400/25 blur-3xl" />
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <CardTitle className="text-base font-semibold"><h1>အရောင်း</h1></CardTitle>
            <div className="flex flex-wrap gap-2">
              {badges.map(({ label, value }) => (
                <Badge key={label} variant="secondary" className="rounded-full bg-background/60">
                  {label} <span className="ml-1 font-semibold tabular-nums">{value}</span>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/sales/reports">အရောင်းအစီရင်ခံစာ</Link>
            </Button>
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/dashboard/sales/new"><Plus aria-hidden /> ရောင်းစာရင်းအသစ်</Link>
            </Button>
            <Button asChild variant="outline" className="bg-background/60">
              <a href="/dashboard/sales"><RefreshCw aria-hidden /> ပြန်ဖတ်ရန်</a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className={cardStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold"><h2>ရောင်းစာရင်း</h2></CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length ? <SalesTable rows={rows} today={today} /> : (
            <p className="py-6 text-center text-sm text-muted-foreground">ရောင်းစာရင်း မရှိသေးပါ။</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
