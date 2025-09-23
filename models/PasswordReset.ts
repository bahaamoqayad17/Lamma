import mongoose, { InferSchemaType } from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 900, // 15 minutes
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
passwordResetSchema.index({ email: 1, code: 1 });

export type PasswordResetType = Omit<
  InferSchemaType<typeof passwordResetSchema>,
  ""
> & {
  _id: mongoose.Types.ObjectId | string;
};

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
