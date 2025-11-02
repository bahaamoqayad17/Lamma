import mongoose, { InferSchemaType } from "mongoose";

const mafiaSessionSchema = new mongoose.Schema(
  {
    // game: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Game",
    //   required: true,
    // },
    name: {
      type: String,
    },
    number_of_players: {
      type: Number,
      min: 4,
      required: true,
    },
    roundNumber: {
      type: Number,
      default: 1,
    },
    gameId: {
      type: String,
      unique: true,
    },
    phase: {
      type: String,
      enum: ["day", "night", "voting"],
      default: "day",
    },
    status: {
      type: String,
      enum: ["in_progress", "ended"],
      default: "in_progress",
    },
    winner: {
      type: String,
      enum: ["mafia", "citizens", null],
      default: null,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    actions: [
      {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        actionType: {
          type: String,
          enum: ["kill", "save", "investigate", "vote"],
        },
        target: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        result: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export type MafiaSessionType = Omit<
  InferSchemaType<typeof mafiaSessionSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
};

const MafiaSession =
  mongoose.models.MafiaSession ||
  mongoose.model("MafiaSession", mafiaSessionSchema);

export default MafiaSession;
