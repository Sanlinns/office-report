import Sale from "@/lib/mongoDB/models/sale";

type DailySalesTotal = {
  _id: string;
  revenue: number;
  cost: number;
  count: number;
};

const REPORT_DAYS = 90;

export async function loadSalesReport(ownerId: string) {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Yangon",
  }).format(new Date());

  const day = new Date(`${today}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (REPORT_DAYS - 1));
  const start = day.toISOString().slice(0, 10);

  const totals = await Sale.aggregate<DailySalesTotal>([
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

  const totalsByDate = new Map(totals.map((row) => [row._id, row]));

  return Array.from({ length: REPORT_DAYS }, () => {
    const date = day.toISOString().slice(0, 10);
    day.setUTCDate(day.getUTCDate() + 1);

    const row = totalsByDate.get(date);
    const revenue = row?.revenue ?? 0;
    const cost = row?.cost ?? 0;

    return {
      date,
      revenue,
      cost,
      profit: revenue - cost,
      count: row?.count ?? 0,
    };
  });
}