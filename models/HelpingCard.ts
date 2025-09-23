import mongoose, { InferSchemaType } from "mongoose";

const helpingCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export type HelpingCardType = Omit<
  InferSchemaType<typeof helpingCardSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
};

const HelpingCard =
  mongoose.models.HelpingCard ||
  mongoose.model("HelpingCard", helpingCardSchema);

export default HelpingCard;
