import { deleteModel, Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  archivedAt: { type: Date, default: null },
  unit: { type: String, trim: true, maxlength: 30 },
  nameKey: { type: String, required: true },
}, { timestamps: true });

schema.index({ ownerId: 1, nameKey: 1 }, { unique: true });

type Category = InferSchemaType<typeof schema>;
if (models.Category && !models.Category.schema.path("archivedAt")) {
  deleteModel("Category");
}

export default (models.Category as Model<Category> | undefined) ?? model<Category>("Category", schema);
