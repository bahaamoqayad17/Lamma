import mongoose, { InferSchemaType } from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["purchase", "bonus"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export type TransactionType = Omit<
  InferSchemaType<typeof transactionSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  amount: number;
  type: string;
  status: string;
};

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
