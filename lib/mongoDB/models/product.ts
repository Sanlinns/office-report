import { Schema, model, models, type Model } from "mongoose";

interface Product {
  ownerId: string;
  code: string;
  name: string;
  unit: string;
  openingQuantity: number;
  unitCost: number;
  sellingPrice: number;
}

const productSchema = new Schema<Product>(
  {
    ownerId: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    openingQuantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

productSchema.index({ ownerId: 1, code: 1 }, { unique: true });

export default (models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
