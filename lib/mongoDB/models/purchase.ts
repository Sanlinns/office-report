import { Schema, model, models, type Model, type Types } from "mongoose";

interface PurchaseLine {
  productId: Types.ObjectId;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
  amount: number;
}

interface Purchase {
  ownerId: string;
  date: string;
  supplier: string;
  items: PurchaseLine[];
  total: number;
}

const lineSchema = new Schema<PurchaseLine>({
  productId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const schema = new Schema<Purchase>({
  ownerId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  supplier: { type: String, required: true },
  items: { type: [lineSchema], required: true },
  total: { type: Number, required: true },
}, { timestamps: true });

export default (models.Purchase as Model<Purchase> | undefined) ??
  model<Purchase>("Purchase", schema);