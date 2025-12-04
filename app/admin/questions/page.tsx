import { getQuestions } from "@/actions/question-actions";
import QuestionsClient from "./client";
import { QuestionType } from "@/models/Question";
import { getSubCategories } from "@/actions/category-actions";
import { CategoryType } from "@/models/Category";

export default async function QuestionsPage() {
  const { success, message, data } = await getQuestions();
  const categoriesResult = await getSubCategories();

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
    <QuestionsClient
      data={JSON.parse(JSON.stringify(data)) as QuestionType[]}
      categories={
        JSON.parse(JSON.stringify(categoriesResult.data)) as CategoryType[]
      }
    />
  );
}
