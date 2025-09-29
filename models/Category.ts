import mongoose, { InferSchemaType } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export type CategoryType = Omit<InferSchemaType<typeof categorySchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  description: string;
  image: string;
  category: mongoose.Types.ObjectId | string;
};

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
