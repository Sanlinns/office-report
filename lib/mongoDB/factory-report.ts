import Purchase from "@/lib/mongoDB/models/purchase";
import Sale from "@/lib/mongoDB/models/sale";

const timezone = "Asia/Yangon";
const dayCount = 90;
const dayMs = 86_400_000;

export async function loadFactoryReport(ownerId: string) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: timezone }).format(new Date());
  const todayUtc = Date.parse(`${today}T00:00:00Z`);
  const firstDay = todayUtc - (dayCount - 1) * dayMs;
  const dateFrom = (days: number) => new Date(todayUtc - (days - 1) * dayMs).toISOString().slice(0, 10);

  const dailyTotals = [
    { $match: { ownerId, date: { $gte: dateFrom(dayCount), $lte: today } } },
    { $group: { _id: "$date", total: { $sum: "$total" }, count: { $sum: 1 } } },
  ];
  type DailyTotal = { _id: string; total: number; count: number };
  type ProductSales = { _id: { product: string; unit: string }; name: string; quantity: number; revenue: number; revenue7: number; revenue15: number };
  const [income, expenses, sales] = await Promise.all([
    Sale.aggregate<DailyTotal>(dailyTotals),
    Purchase.aggregate<DailyTotal>(dailyTotals),
    Sale.aggregate<ProductSales>([
      { $match: { ownerId, date: { $gte: dateFrom(30), $lte: today } } },
      { $sort: { date: -1, _id: -1 } },
      { $unwind: "$items" },
      { $group: {
        _id: { product: { $toString: "$items.productId" }, unit: "$items.unit" },
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.amount" },
        revenue7: { $sum: { $cond: [{ $gte: ["$date", dateFrom(7)] }, "$items.amount", 0] } },
        revenue15: { $sum: { $cond: [{ $gte: ["$date", dateFrom(15)] }, "$items.amount", 0] } },
      } },
      { $sort: { revenue: -1, "_id.product": 1, "_id.unit": 1 } },
    ]),
  ]);

  const incomeByDate = new Map(income.map((row) => [row._id, row]));
  const expenseByDate = new Map(expenses.map((row) => [row._id, row]));
  const points = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(firstDay + index * dayMs).toISOString().slice(0, 10);
    const incoming = incomeByDate.get(date);
    const outgoing = expenseByDate.get(date);
    const revenue = incoming?.total ?? 0;
    const cost = outgoing?.total ?? 0;
    return { date, revenue, cost, profit: revenue - cost, count: (incoming?.count ?? 0) + (outgoing?.count ?? 0) };
  });

  return { points, sales };
}
