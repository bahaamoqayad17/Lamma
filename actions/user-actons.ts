"use server";

import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/cookie";

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

export const banOrRestoreUser = async (userId: string) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود",
        data: null,
      };
    }

    // Toggle isActive status
    user.isActive = !user.isActive;
    await user.save();

    return {
      success: true,
      message: user.isActive
        ? "تم تفعيل المستخدم بنجاح"
        : "تم حظر المستخدم بنجاح",
      data: user,
    };
  } catch (error) {
    console.error("Error banning/restoring user:", error);
    return {
      success: false,
      message: "فشل في تحديث حالة المستخدم",
      data: null,
    };
  }
};

export const updateUserBalances = async (
  userId: string,
  lammaBalance: number,
  mafiaBalance: number
) => {
  const session = await getUserFromCookie();
  if (!session) {
    return {
      success: false,
      message: "يرجى تسجيل الدخول للمتابعة",
      data: null,
    };
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود",
        data: null,
      };
    }

    user.lammaBalance = lammaBalance;
    user.mafiaBalance = mafiaBalance;
    await user.save();

    return {
      success: true,
      message: "تم تحديث الأرصدة بنجاح",
      data: user,
    };
  } catch (error) {
    console.error("Error updating user balances:", error);
    return {
      success: false,
      message: "فشل في تحديث الأرصدة",
      data: null,
    };
  }
};
