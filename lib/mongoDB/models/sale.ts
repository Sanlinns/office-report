import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const lineSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
  cost: { type: Number, required: true },
}, { _id: false });

const schema = new Schema({
  ownerId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  customer: { type: String, default: "" },
  items: { type: [lineSchema], required: true },
  total: { type: Number, required: true },
  cost: { type: Number, required: true },
}, { timestamps: true });

type Sale = InferSchemaType<typeof schema>;
export default (models.Sale as Model<Sale> | undefined) ?? model<Sale>("Sale", schema);
