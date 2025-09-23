import mongoose from "mongoose";
import "../models/User";
import "../models/PasswordReset";
import "../models/Chat";
import "../models/Question";
import "../models/LammaSession";
import "../models/Transaction";
import "../models/Category";
import "../models/Game";
import "../models/MafiaSession";
import "../models/HelpingCard";

const MONGODB_URI =
  "mongodb+srv://Projects:MW4oAAkNPNlhvwRl@projects.vvekv6h.mongodb.net/Lamma";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export async function connectToDatabase() {
  try {
    mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      return mongoose;
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}
