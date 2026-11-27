import { inventoryMovements } from "@/lib/mongoDB/inventory";
import Product from "@/lib/mongoDB/models/product";
import Purchase from "@/lib/mongoDB/models/purchase";
import PurchaseBudget from "@/lib/mongoDB/models/purchase-budget";
import { loadFactoryReport } from "@/lib/mongoDB/factory-report";

export async function loadOfficeReport(ownerId: string) {
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

  return { points, sales, budget: budget ? { funds, spent } : null, stockRows };
}
