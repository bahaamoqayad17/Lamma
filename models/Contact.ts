import mongoose, { InferSchemaType } from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export type ContactType = Omit<InferSchemaType<typeof contactSchema>, ""> & {
  _id: mongoose.Types.ObjectId | string;
};

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
