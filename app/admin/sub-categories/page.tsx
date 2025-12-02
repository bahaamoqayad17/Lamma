import { getSubCategories } from "@/actions/category-actions";
import CategoriesClient from "./client";
import { CategoryType } from "@/models/Category";

export default async function SubCategoriesPage() {
  const { success, message, data } = await getSubCategories();

  if (!success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">
          خطأ في تحميل البيانات
        </h1>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <CategoriesClient
      data={JSON.parse(JSON.stringify(data)) as CategoryType[]}
    />
  );
}
