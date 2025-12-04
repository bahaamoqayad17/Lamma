"use server";

import { getUserFromCookie } from "@/lib/cookie";
import { connectToDatabase } from "@/lib/mongo";
import Contact from "@/models/Contact";

export const createContact = async (data: any) => {
  try {
    await connectToDatabase();

    await Contact.create(data);

    return { success: true, message: "Contact created successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create contact" };
  }
};

export const getContacts = async () => {
  try {
    await connectToDatabase();
    const contacts = await Contact.find({ type: "contact" })
      .sort({ createdAt: -1 })
      .lean();
    return {
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to get contacts" };
  }
};

export const getAnswerCorrections = async () => {
  try {
    await connectToDatabase();
    const contacts = await Contact.find({ type: "answer_correction" })
      .sort({ createdAt: -1 })
      .lean();
    return {
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to get contacts" };
  }
};

export const submitAnswerCorrection = async (
  correctAnswer: string,
  questionText: string
) => {
  try {
    const session = await getUserFromCookie();
    if (!session) {
      return {
        success: false,
        message: "يرجى تسجيل الدخول للمتابعة",
      };
    }

    await connectToDatabase();

    await Contact.create({
      name: session.user.name,
      email: session.user.email,
      subject: `تصحيح إجابة - ${questionText}`,
      message: correctAnswer,
      type: "answer_correction",
    });

    return {
      success: true,
      message: "تم إرسال تصحيح الإجابة بنجاح",
    };
  } catch (error) {
    console.error("Error submitting answer correction:", error);
    return {
      success: false,
      message: "فشل إرسال تصحيح الإجابة",
    };
  }
};
