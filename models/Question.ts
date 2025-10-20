import mongoose, { InferSchemaType } from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    file_question: { type: String },
    file_answer: { type: String },
    question: { type: String },
    answer: { type: String },
    points: { type: Number },
  },
  { timestamps: true }
);

export type QuestionType = Omit<InferSchemaType<typeof questionSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  category: mongoose.Types.ObjectId | string;
  question: string;
  answer: string;
  file_answer: string;
  file_question: string;
  points: number;
};

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;
