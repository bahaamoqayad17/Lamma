"use server";

import { connectToDatabase } from "@/lib/mongo";
import { uploadFileToS3 } from "@/lib/s3-utils";
import Question from "@/models/Question";

export const getQuestions = async () => {
  try {
    await connectToDatabase();
    const questions = await Question.find().sort({ createdAt: -1 }).lean();
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

    // Get image file
    const questionFile = formData.get("questionFile") as File;

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

    // Upload image to S3
    let questionFileUrl = "";

    if (questionFile && questionFile.size > 0) {
      try {
        const arrayBuffer = await questionFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = questionFile.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          questionFile.type,
          "questions/"
        );
        questionFileUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading question image:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع صورة السؤال",
          data: null,
        };
      }
    }

    // Create category in database
    const newQuestion = await Question.create({
      question: question.trim(),
      answer: answer.trim(),
      points: points.trim(),
      file: questionFileUrl,
      category: categoryId || null,
    });

    const populatedQuestion = await Question.findById(newQuestion._id).populate(
      "category"
    );

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

    // Get image file
    const questionFile = formData.get("questionFile") as File;

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

    // Upload new file to S3 if provided
    let questionFileUrl = currentQuestion.file;

    if (questionFile && questionFile.size > 0) {
      try {
        const arrayBuffer = await questionFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = questionFile.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          questionFile.type,
          "questions/"
        );
        questionFileUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading question file:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع ملف السؤال",
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
        points: points?.trim() || "",
        file: questionFileUrl,
        category: categoryId || null,
      },
      { new: true }
    ).populate("category");

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
    return { success: true, message: "تم حذف السؤال بنجاح" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "فشل حذف السؤال" };
  }
};
