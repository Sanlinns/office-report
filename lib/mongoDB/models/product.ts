import { deleteModel, Schema, model, models, type Model } from "mongoose";

interface Product {
  ownerId: string;
  code: string;
  name: string;
  unit: string;
  openingQuantity: number;
  openingPurchaseTotal?: number;
  inventoryVersion?: number;
  archivedAt?: Date | null;
  unitCost: number;
  sellingPrice: number;
}

const productSchema = new Schema<Product>(
  {
    ownerId: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    archivedAt: { type: Date, default: null },
    inventoryVersion: { type: Number, default: 0 },
    openingPurchaseTotal: { type: Number, min: 0 },
    openingQuantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

productSchema.index({ ownerId: 1, code: 1 }, { unique: true });

// Next.js development reloads can retain the model compiled before the opening purchase total was added.
if (models.Product && !models.Product.schema.path("openingPurchaseTotal")) {
  deleteModel("Product");
}

export default (models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
