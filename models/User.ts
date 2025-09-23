import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    id_number: {
      type: String,
      trim: true,
      minLength: 10,
      maxLength: 10,
      unique: true,
    },
    tax_number: {
      type: String,
      trim: true,
    },
    bank_iban: {
      type: String,
      trim: true,
    },
    bank_name: {
      type: String,
      trim: true,
    },
    commercial_number: {
      type: String,
      trim: true,
      unique: true,
    },
    documents: [String],
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    delete (ret as any).password;
    return ret;
  },
});

export type UserType = Omit<InferSchemaType<typeof userSchema>, "role"> & {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  password?: string; // Optional because it gets deleted in toJSON
  mobile_number: string;
  id_number: string;
  tax_number: string;
  bank_iban: string;
  bank_name: string;
  commercial_number: string;
  documents: string[];
  isActive: boolean;
  isVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
