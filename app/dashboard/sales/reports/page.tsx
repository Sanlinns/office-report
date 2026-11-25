import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SalesReportChart from "@/components/dashboard/sales/SalesReportChart";
import { BreadCrumbItem } from "@/components/dashboard/outcome/bread-crumb-item";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/mongoDB/mongoDB";
import Sale from "@/lib/mongoDB/models/sale";

type DailySalesTotal = {
  _id: string;
  revenue: number;
  cost: number;
  count: number;
};

const REPORT_DAYS = 90;

export default async function SalesReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  const ownerId = session?.user.id;
  if (!ownerId) redirect("/sign-in");

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Yangon",
  }).format(new Date());

  const reportDay = new Date(`${today}T00:00:00Z`);
  reportDay.setUTCDate(reportDay.getUTCDate() - (REPORT_DAYS - 1));
  const start = reportDay.toISOString().slice(0, 10);

  await connectToDB();

  const dailyTotals = await Sale.aggregate<DailySalesTotal>([
    {
      $match: {
        ownerId,
        date: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id: "$date",
        revenue: { $sum: "$total" },
        cost: { $sum: "$cost" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalsByDate = new Map(dailyTotals.map((row) => [row._id, row]));

  const points = Array.from({ length: REPORT_DAYS }, () => {
    const date = reportDay.toISOString().slice(0, 10);
    reportDay.setUTCDate(reportDay.getUTCDate() + 1);

    const dailyTotal = totalsByDate.get(date);
    const revenue = dailyTotal?.revenue ?? 0;
    const cost = dailyTotal?.cost ?? 0;

    return {
      date,
      revenue,
      cost,
      profit: revenue - cost,
      count: dailyTotal?.count ?? 0,
    };
  });

  return (
    <div className="space-y-4 md:px-4">
      <BreadCrumbItem />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">အရောင်းအစီရင်ခံစာ</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/sales">အရောင်းစာရင်းသို့</Link>
        </Button>
      </div>

      <SalesReportChart points={points} />
    </div>
  );
}