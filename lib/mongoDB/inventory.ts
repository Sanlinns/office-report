import type { ClientSession } from "mongoose";
import Purchase from "./models/purchase";
import Sale from "./models/sale";

export async function inventoryMovements(ownerId: string, session?: ClientSession) {
  type Movement = { _id: string; quantity: number; value: number };
  const purchases = await Purchase.aggregate<Movement>([
    { $match: { ownerId } }, { $unwind: "$items" },
    { $match: { "items.productId": { $type: "objectId" } } },
    { $group: { _id: { $toString: "$items.productId" }, quantity: { $sum: "$items.quantity" }, value: { $sum: "$items.amount" } } },
  ]).session(session ?? null);
  const sales = await Sale.aggregate<Movement>([
    { $match: { ownerId } }, { $unwind: "$items" },
    { $group: { _id: { $toString: "$items.productId" }, quantity: { $sum: { $ifNull: ["$items.stockQuantity", "$items.quantity"] } }, value: { $sum: "$items.cost" } } },
  ]).session(session ?? null);

  const net = new Map(purchases.map((row) => [row._id, row]));
  for (const sale of sales) {
    const purchase = net.get(sale._id);
    net.set(sale._id, {
      _id: sale._id,
      quantity: (purchase?.quantity ?? 0) - sale.quantity,
      value: (purchase?.value ?? 0) - sale.value,
    });
  }
  return net;
}