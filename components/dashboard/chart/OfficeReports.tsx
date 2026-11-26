
// import InventoryStockChart from "./InventoryStockChart";
// import SalesReportChart from "@/components/dashboard/sales/SalesReportChart";
// import { inventoryMovements } from "@/lib/mongoDB/inventory";
// import PieChartBox from "./PieChartBox";

// import BudgetLiquidChart from "./BudgetLiquidChart";

// import Product from "@/lib/mongoDB/models/product";
// import Purchase from "@/lib/mongoDB/models/purchase";
// import PurchaseBudget from "@/lib/mongoDB/models/purchase-budget";
// import { loadFactoryReport } from "@/lib/mongoDB/factory-report";

// export default async function OfficeReports({
//   ownerId,
// }: {
//   ownerId: string;
// }) {
//   const [
//     { points, sales },
//     budget,
//     products,
//     movements,
//   ] = await Promise.all([
//     loadFactoryReport(ownerId),

//     PurchaseBudget.findOne({
//       ownerId,
//     }).lean(),

//     Product.find({
//       ownerId,
//       archivedAt: null,
//     })
//       .sort({ name: 1, code: 1 })
//       .lean(),

//     inventoryMovements(ownerId),
//   ]);

//   const linkedPurchases = budget?.purchaseIds.length
//     ? await Purchase.find({
//         ownerId,
//         _id: { $in: budget.purchaseIds },
//       })
//         .select("total")
//         .lean()
//     : [];

//   const funds =
//     (budget?.openingAmount ?? 0) +
//     (budget?.deposits ?? []).reduce(
//       (sum, entry) => sum + entry.amount,
//       0
//     );

//   const spent = linkedPurchases.reduce(
//     (sum, purchase) => sum + purchase.total,
//     0
//   );

//   const stockRows = products.map((product) => {
//     const id = String(product._id);

//     return {
//       id,
//       label: `${product.name} (${product.code})`,

//       quantity:
//         product.openingQuantity +
//         (movements.get(id)?.quantity ?? 0),

//       unit:
//         product.unit.trim() ||
//         "ယူနစ်မသတ်မှတ်ထား",
//     };
//   });

//   return (
//     <section className="space-y-4">

//       <SalesReportChart
//         points={points}
//         mode="factory"
//       />

//       <div className="grid gap-4 lg:grid-cols-2">

//         {/* New Liquid Wave Budget Chart */}

//         <BudgetLiquidChart
//           budget={
//             budget
//               ? { funds, spent }
//               : null
//           }
//         />

//         {/* Original Sales Pie Chart */}

//         <PieChartBox
//           sales={sales.map(
//             ({
//               _id,
//               name,
//               revenue7,
//               revenue15,
//               revenue,
//             }) => ({
//               id: JSON.stringify(_id),

//               name: `${name} · ${_id.unit}`,

//               values: {
//                 7: revenue7,
//                 15: revenue15,
//                 30: revenue,
//               },
//             })
//           )}
//         />

//       </div>

//       <InventoryStockChart rows={stockRows} />

//     </section>
//   );
// }






import InventorySpectrumChart from "./InventorySpectrumChart";

import SalesReportChart from "@/components/dashboard/sales/SalesReportChart";

import BudgetLiquidChart from "./BudgetLiquidChart";
import PieChartBox from "./PieChartBox";

import { inventoryMovements } from "@/lib/mongoDB/inventory";

import Product from "@/lib/mongoDB/models/product";
import Purchase from "@/lib/mongoDB/models/purchase";
import PurchaseBudget from "@/lib/mongoDB/models/purchase-budget";

import { loadFactoryReport } from "@/lib/mongoDB/factory-report";

/* =========================================
   Office Reports
========================================= */

export default async function OfficeReports({
  ownerId,
}: {
  ownerId: string;
}) {

  /* =======================================
     Load MongoDB Data
  ======================================= */

  const [
    { points, sales },
    budget,
    products,
    movements,
  ] = await Promise.all([

    loadFactoryReport(ownerId),

    PurchaseBudget
      .findOne({ ownerId })
      .lean(),

    Product
      .find({
        ownerId,
        archivedAt: null,
      })
      .sort({
        name: 1,
        code: 1,
      })
      .lean(),

    inventoryMovements(ownerId),

  ]);

  /* =======================================
     Purchase Budget
  ======================================= */

  const linkedPurchases =
    budget?.purchaseIds.length
      ? await Purchase.find({
          ownerId,
          _id: {
            $in: budget.purchaseIds,
          },
        })
          .select("total")
          .lean()
      : [];

  const funds =
    (budget?.openingAmount ?? 0) +
    (budget?.deposits ?? []).reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

  const spent = linkedPurchases.reduce(
    (sum, purchase) =>
      sum + purchase.total,
    0
  );

  /* =======================================
     Real Inventory Data
  ======================================= */

  const stockRows = products.map((product) => {

    const id = String(product._id);

    const openingQuantity =
      product.openingQuantity;

    const movementQuantity =
      movements.get(id)?.quantity ?? 0;

    const quantity =
      openingQuantity + movementQuantity;

    return {
      id,

      name: `${product.name} (${product.code})`,

      quantity,

      unit:
        product.unit.trim() ||
        "ယူနစ်မသတ်မှတ်ထား",
    };

  });

  /* =======================================
     Product Revenue Data
  ======================================= */

  const productSales = sales.map(
    ({
      _id,
      name,
      revenue7,
      revenue15,
      revenue,
    }) => ({

      id: JSON.stringify(_id),

      name: `${name} · ${_id.unit}`,

      values: {
        7: revenue7,
        15: revenue15,
        30: revenue,
      },

    })
  );

  /* =======================================
     Render Dashboard
  ======================================= */

  return (
    <section className="min-w-0 space-y-4">

      {/* ===================================
          Income / Expense / Profit
      =================================== */}

      <SalesReportChart
        points={points}
        mode="factory"
      />

      {/* ===================================
          Budget & Product Sales
      =================================== */}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">

        {/* Liquid Budget Chart */}

        <BudgetLiquidChart
          budget={
            budget
              ? {
                  funds,
                  spent,
                }
              : null
          }
        />

        {/* Liquid Gradient Pie Chart */}

        <PieChartBox
          sales={productSales}
        />

      </div>

      {/* ===================================
          Aurora Inventory Spectrum Chart
      =================================== */}

      <InventorySpectrumChart
        items={stockRows}
        title="ကုန်ပစ္စည်းလက်ကျန်"
      />

    </section>
  );
}