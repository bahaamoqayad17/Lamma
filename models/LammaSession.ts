import mongoose, { InferSchemaType } from "mongoose";

const LammaSessionSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    team1: { name: String, score: { type: Number, default: 0 } },
    team2: { name: String, score: { type: Number, default: 0 } },
    currentRound: { type: Number, default: 1 },
    finished: { type: Boolean, default: false },
    moves: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        answeredBy: String,
        isCorrect: Boolean,
        pointsAwarded: Number,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    helpingCards: [
      {
        card: { type: mongoose.Schema.Types.ObjectId, ref: "HelpingCard" },
        usedBy: String,
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export type LammaSessionType = Omit<
  InferSchemaType<typeof LammaSessionSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
};

const LammaSession =
  mongoose.models.LammaSession ||
  mongoose.model("LammaSession", LammaSessionSchema);

export default LammaSession;
