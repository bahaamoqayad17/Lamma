import mongoose, { InferSchemaType } from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["seen_w_geem", "mafia", "future"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "finished"],
      default: "waiting",
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        teamName: String,
        role: String, // mafia, doctor, detective, citizen
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export type GameType = Omit<InferSchemaType<typeof gameSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  createdBy: mongoose.Types.ObjectId | string;
  players: {
    userId: mongoose.Types.ObjectId | string;
    username: string;
    teamName: string;
    role: string;
    isActive: boolean;
  }[];
};

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
