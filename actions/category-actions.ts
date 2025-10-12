"use server";

import { connectToDatabase } from "@/lib/mongo";
import { uploadFileToS3 } from "@/lib/s3-utils";
import Category from "@/models/Category";

export const getCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return {
      success: true,
      message: "تم تحميل الفئات بنجاح",
      data: categories,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "فشل تحميل الفئات" };
  }
};

export async function createCategory(formData: FormData) {
  try {
    await connectToDatabase();

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;

    // Get image file
    const categoryImage = formData.get("categoryImage") as File;

    // Validate required fields
    if (!name?.trim()) {
      return {
        success: false,
        message: "اسم التصنيف مطلوب",
        data: null,
      };
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      name: name.trim(),
    });
    if (existingCategory) {
      return {
        success: false,
        message: "اسم التصنيف موجود بالفعل",
        data: null,
      };
    }

    // Upload image to S3
    let categoryImageUrl = "";

    if (categoryImage && categoryImage.size > 0) {
      try {
        const arrayBuffer = await categoryImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sanitizedFileName = categoryImage.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const uploadResult = await uploadFileToS3(
          buffer,
          sanitizedFileName,
          categoryImage.type,
          "categories/"
        );
        categoryImageUrl = uploadResult.publicUrl;
      } catch (error) {
        console.error("Error uploading category image:", error);
        return {
          success: false,
          message: "حدث خطأ أثناء رفع صورة التصنيف",
          data: null,
        };
      }
    }

    // Create category in database
    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: categoryImageUrl,
      category: categoryId || null,
    });

    return {
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      data: category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء إنشاء التصنيف",
      data: null,
    };
  }
}

export const deleteCategory = async (id: string) => {
  try {
    await connectToDatabase();
    await Category.findByIdAndDelete(id);
    return { success: true, message: "تم حذف الفئة بنجاح" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "فشل حذف الفئة" };
  }
};
