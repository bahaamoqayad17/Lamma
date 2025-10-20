"use server";

import { connectToDatabase } from "@/lib/mongo";
import { uploadFileToS3 } from "@/lib/s3-utils";
import Question from "@/models/Question";
import { revalidatePath } from "next/cache";

export const getQuestions = async () => {
  try {
    await connectToDatabase();
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .populate("category")
      .lean();
    return {
      success: true,
      message: "تم تحميل الأسئلة بنجاح",
      data: questions,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "فشل تحميل الأسئلة" };
  }
};

export async function createQuestion(formData: FormData) {
  try {
    await connectToDatabase();

    // Extract form data
    const categoryId = formData.get("categoryId") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const points = formData.get("points") as string;

    // Get files
    const fileQuestion = formData.get("file_question") as File;
    const fileAnswer = formData.get("file_answer") as File;

    // Validate required fields
    if (!question?.trim()) {
      return {
        success: false,
        message: "السؤال مطلوب",
        data: null,
      };
    }

    // Check if question name already exists
    const existingQuestion = await Question.findOne({
      question: question.trim(),
    });
    if (existingQuestion) {
      return {
        success: false,
        message: "اسم السؤال موجود بالفعل",
        data: null,
      };
    }

    // Upload files to S3
    let fileQuestionUrl = "";
    let fileAnswerUrl = "";

    if (fileQuestion && (fileQuestion as any).size > 0) {
      try {
        const arrayBuffer = await (fileQuestion as any).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = (fileQuestion as any).name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          (fileQuestion as any).type,
          "questions/"
        );
        fileQuestionUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading question file:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع ملف السؤال",
          data: null,
        };
      }
    }

    if (fileAnswer && (fileAnswer as any).size > 0) {
      try {
        const arrayBuffer = await (fileAnswer as any).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = (fileAnswer as any).name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          (fileAnswer as any).type,
          "answers/"
        );
        fileAnswerUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading answer file:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع ملف الإجابة",
          data: null,
        };
      }
    }

    // Create category in database
    const newQuestion = await Question.create({
      question: question.trim(),
      answer: answer.trim(),
      points: Number(points) || 0,
      file_question: fileQuestionUrl,
      file_answer: fileAnswerUrl,
      category: categoryId || null,
    });

    const populatedQuestion = await Question.findById(newQuestion._id).populate(
      "category"
    );

    revalidatePath("/admin/questions");

    return {
      success: true,
      message: "تم إنشاء السؤال بنجاح",
      data: populatedQuestion,
    };
  } catch (error) {
    console.error("Error creating question:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء إنشاء السؤال",
      data: null,
    };
  }
}

export async function updateQuestion(id: string, formData: FormData) {
  try {
    await connectToDatabase();

    // Extract form data
    const categoryId = formData.get("categoryId") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const points = formData.get("points") as string;

    // Get files
    const fileQuestion = formData.get("file_question") as File;
    const fileAnswer = formData.get("file_answer") as File;

    // Validate required fields
    if (!question?.trim()) {
      return {
        success: false,
        message: "السؤال مطلوب",
        data: null,
      };
    }

    // Check if question name already exists (excluding current question)
    const existingQuestion = await Question.findOne({
      question: question.trim(),
      _id: { $ne: id },
    });
    if (existingQuestion) {
      return {
        success: false,
        message: "اسم السؤال موجود بالفعل",
        data: null,
      };
    }

    // Get current question
    const currentQuestion = await Question.findById(id);
    if (!currentQuestion) {
      return {
        success: false,
        message: "السؤال غير موجود",
        data: null,
      };
    }

    // Upload new files to S3 if provided
    let fileQuestionUrl = currentQuestion.file_question || "";
    let fileAnswerUrl = currentQuestion.file_answer || "";

    if (fileQuestion && (fileQuestion as any).size > 0) {
      try {
        const arrayBuffer = await (fileQuestion as any).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = (fileQuestion as any).name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          (fileQuestion as any).type,
          "questions/"
        );
        fileQuestionUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading question file:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع ملف السؤال",
          data: null,
        };
      }
    }

    if (fileAnswer && (fileAnswer as any).size > 0) {
      try {
        const arrayBuffer = await (fileAnswer as any).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = (fileAnswer as any).name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          (fileAnswer as any).type,
          "answers/"
        );
        fileAnswerUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading answer file:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع ملف الإجابة",
          data: null,
        };
      }
    }

    // Update question in database
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question: question.trim(),
        answer: answer?.trim() || "",
        points: Number(points) || 0,
        file_question: fileQuestionUrl,
        file_answer: fileAnswerUrl,
        category: categoryId || null,
      },
      { new: true }
    ).populate("category");

    revalidatePath("/admin/questions");

    return {
      success: true,
      message: "تم تحديث السؤال بنجاح",
      data: updatedQuestion,
    };
  } catch (error) {
    console.error("Error updating question:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تحديث السؤال",
      data: null,
    };
  }
}

export const deleteQuestion = async (id: string) => {
  try {
    await connectToDatabase();
    await Question.findByIdAndDelete(id);
    revalidatePath("/admin/questions");
    return { success: true, message: "تم حذف السؤال بنجاح", data: null };
  } catch (error) {
    console.error(error);
    return { success: false, message: "فشل حذف السؤال", data: null };
  }
};
