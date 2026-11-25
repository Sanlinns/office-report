import { Schema, model, models, type Model, type Types } from "mongoose";

interface PurchaseBudget {
  ownerId: string;
  openingAmount: number;
  openingDate: string;
  purchaseIds: Types.ObjectId[];
  deposits: { key: string; date: string; amount: number; note: string }[];
}

const depositSchema = new Schema({
  key: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  note: String,
}, { _id: false });

const schema = new Schema<PurchaseBudget>({
  ownerId: { type: String, required: true, unique: true },
  openingAmount: { type: Number, required: true },
  openingDate: { type: String, required: true },
  purchaseIds: [{ type: Schema.Types.ObjectId }],
  deposits: [depositSchema],
});

export default (models.PurchaseBudget as Model<PurchaseBudget> | undefined) ??
  model<PurchaseBudget>("PurchaseBudget", schema);