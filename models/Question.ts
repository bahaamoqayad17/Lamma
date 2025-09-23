import mongoose, { InferSchemaType } from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    questionText: { type: String, required: true },
    answerText: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

export type QuestionType = Omit<InferSchemaType<typeof questionSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  category: mongoose.Types.ObjectId | string;
  questionText: string;
  answerText: string;
  points: number;
};

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;
