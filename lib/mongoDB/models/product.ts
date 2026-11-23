import { deleteModel, Schema, model, models, type Model, type Types } from "mongoose";

interface Product {
  ownerId: string;
  categoryId?: Types.ObjectId | null;
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
    categoryId: { type: Schema.Types.ObjectId },
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

// Next.js development reloads can retain the model compiled before categories were added.
if (models.Product && !models.Product.schema.path("categoryId")) {
  deleteModel("Product");
}

export default (models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
