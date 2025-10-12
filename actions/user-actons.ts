"use server";

import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";

export const getUsers = async () => {
  try {
    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return {
      success: true,
      message: "Users fetched successfully",
      data: users,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to get users" };
  }
};
