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
      enum: ["waiting", "action", "voting", "results"],
      default: "waiting",
    },
    status: {
      type: String,
      enum: ["created", "started", "ended"],
      default: "created",
    },
    winner: {
      type: String,
      enum: ["mafia", "citizens", null],
      default: null,
    },
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        host: {
          type: Boolean,
          default: false,
        },
        role: {
          type: String,
          enum: ["mafia", "doctor", "detective", "citizen"],
          default: "citizen",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        eliminatedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    phaseEndTime: {
      type: Date,
      default: null,
    },
    currentPhaseActions: {
      mafiaKill: {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        target: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
      doctorHeal: {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        target: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
      detectiveReveal: {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        target: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        revealedRole: { type: String, default: null },
      },
    },
    votes: [
      {
        voter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        target: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null, // null means skip/no vote
        },
        roundNumber: {
          type: Number,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
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
