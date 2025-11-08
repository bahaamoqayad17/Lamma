import mongoose, { InferSchemaType } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      default: null,
    },
    mafiaSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MafiaSession",
      default: null,
    },
    type: { type: String, enum: ["all", "mafia"], required: true },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export type ChatType = Omit<InferSchemaType<typeof chatSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
  gameId: mongoose.Types.ObjectId | string;
  type: "all" | "mafia";
  messages: {
    sender: mongoose.Types.ObjectId | string;
    senderName: string;
    message: string;
  }[];
};

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
