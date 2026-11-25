import InventoryStockChart from "./InventoryStockChart";
import SalesReportChart from "@/components/dashboard/sales/SalesReportChart";
import { inventoryMovements } from "@/lib/mongoDB/inventory";
import PieChartBox from "./PieChartBox";
import Product from "@/lib/mongoDB/models/product";
import Purchase from "@/lib/mongoDB/models/purchase";
import PurchaseBudget from "@/lib/mongoDB/models/purchase-budget";
import { loadFactoryReport } from "@/lib/mongoDB/factory-report";

export default async function OfficeReports({ ownerId }: { ownerId: string }) {
  const [{ points, sales }, budget, products, movements] = await Promise.all([
    loadFactoryReport(ownerId),
    PurchaseBudget.findOne({ ownerId }).lean(),
    Product.find({ ownerId, archivedAt: null }).sort({ name: 1, code: 1 }).lean(),
    inventoryMovements(ownerId),
  ]);

  const linkedPurchases = budget?.purchaseIds.length
    ? await Purchase.find({ ownerId, _id: { $in: budget.purchaseIds } }).select("total").lean()
    : [];
  const funds = (budget?.openingAmount ?? 0) + (budget?.deposits ?? []).reduce((sum, entry) => sum + entry.amount, 0);
  const spent = linkedPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const stockRows = products.map((product) => {
    const id = String(product._id);
    return {
      id,
      label: `${product.name} (${product.code})`,
      quantity: product.openingQuantity + (movements.get(id)?.quantity ?? 0),
      unit: product.unit.trim() || "ယူနစ်မသတ်မှတ်ထား",
    };
  });

  return (
    <section className="space-y-4">
      <SalesReportChart points={points} mode="factory" />
      <div className="grid gap-4 lg:grid-cols-2">
        <PieChartBox budget={budget ? { funds, spent } : null} />
        <PieChartBox sales={sales.map(({ _id, name, revenue7, revenue15, revenue }) => ({
          id: JSON.stringify(_id),
          name: `${name} · ${_id.unit}`,
          values: { 7: revenue7, 15: revenue15, 30: revenue },
        }))} />
      </div>
      <InventoryStockChart rows={stockRows} />
    </section>
  );
}