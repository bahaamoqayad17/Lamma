import mongoose, { InferSchemaType } from "mongoose";

const LammaSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    team1: {
      name: String,
      score: { type: Number, default: 0 },
      selectedCards: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HelpingCard",
        },
      ],
    },
    team2: {
      name: String,
      score: { type: Number, default: 0 },
      selectedCards: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HelpingCard",
        },
      ],
    },
    selectedSubcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    playWithoutCards: { type: Boolean, default: false },
    currentRound: { type: Number, default: 1 },
    currentTurn: { type: String, enum: ["team1", "team2"], default: "team1" },
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
    // Card usage tracking
    team1UsedCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HelpingCard",
      },
    ],
    team2UsedCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HelpingCard",
      },
    ],
    // Active card effects
    activeEffects: {
      // Lock Categories: { team: "team1", lockedPoints: [200, 400] }
      lockedCategories: [
        {
          team: String, // team that locked it
          targetTeam: String, // team that is locked
          lockedPoints: [Number], // array of point values locked
        },
      ],
      // Prevent Answer: { team: "team1", questionId: "..." }
      preventedQuestions: [
        {
          team: String, // team that prevented
          targetTeam: String, // team that is prevented
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
          },
        },
      ],
      // Double Points: { team: "team1", active: true }
      doublePoints: {
        team: String,
        active: { type: Boolean, default: false },
      },
      // Double Answers: { team: "team1", remaining: 2 }
      doubleAnswers: {
        team: String,
        remaining: { type: Number, default: 0 },
      },
      // Lock Card: { team: "team1", targetTeam: "team2", active: true }
      lockCard: {
        team: String,
        targetTeam: String,
        active: { type: Boolean, default: false },
      },
      // Counter Attack available: { team: "team1", available: true, triggeredBy: "team2" }
      counterAttack: {
        team: String,
        available: { type: Boolean, default: false },
        triggeredBy: String,
        attackType: String, // type of attack that triggered it
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
