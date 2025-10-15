"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { toast } from "react-toastify";
import { QuestionType } from "@/models/Question";
import QuestionFormModal from "@/components/modals/QuestionFormModal";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "@/actions/question-actions";
import { CategoryType } from "@/models/Category";

export default function QuestionsClient({
  data,
  categories,
}: {
  data: QuestionType[];
  categories: CategoryType[];
}) {
  const columnHelper = createColumnHelper<any>();
  const [questions, setQuestions] = useState<QuestionType[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmitQuestion = async (
    formData: FormData
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      console.log("Submitting question data:", formData);

      let response: any;
      if (editingQuestion) {
        // Update existing question
        response = await updateQuestion(String(editingQuestion._id), formData);
        if (response.success) {
          setQuestions(
            questions.map((q) =>
              q._id === editingQuestion._id ? response.data : q
            )
          );
          toast.success("تم تحديث السؤال بنجاح!");
          setIsModalOpen(false);
          setEditingQuestion(null);
        }
      } else {
        // Create new question
        response = await createQuestion(formData);
        if (response.success) {
          setQuestions([...questions, response.data]);
          toast.success("تم إضافة السؤال بنجاح!");
          setIsModalOpen(false);
        }
      }

      if (!response.success) {
        toast.error(response.message || "حدث خطأ أثناء العملية");
        return {
          success: false,
          message: response.message || "حدث خطأ أثناء العملية",
        };
      }

      return { success: true, message: response.message };
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: QuestionType) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا السؤال؟");
    if (!confirmed) return;

    try {
      const response = await deleteQuestion(id);
      if (response.success) {
        setQuestions(questions.filter((question) => question._id !== id));
        toast.warning("تم حذف السؤال بنجاح");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("حدث خطأ أثناء حذف السؤال");
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("question", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "الاسم",
    }),
    columnHelper.accessor("answer", {
      cell: (info) => (
        <span className="text-blue-600 hover:text-blue-800">
          {info.getValue()}
        </span>
      ),
      header: "الوصف",
    }),
    columnHelper.accessor("file", {
      cell: (info) => (
        <span className="text-gray-700">
          {info.getValue()?.name ? (
            <>
              <Image
                src={info.getValue() || ""}
                alt="image"
                width={100}
                height={100}
              />
            </>
          ) : (
            "لا يوجد"
          )}
        </span>
      ),
      header: "ملف السؤال",
    }),
    columnHelper.accessor("category", {
      cell: (info) => {
        return (
          <p className="text-gray-700">{info.getValue()?.name || "لا يوجد"}</p>
        );
      },
      header: "الفئة",
    }),
    columnHelper.accessor("createdAt", {
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-500">
            {date ? new Date(date).toLocaleDateString("en-US") : "-"}
          </span>
        );
      },
      header: "تاريخ الإنشاء",
    }),

    columnHelper.display({
      id: "actions",
      cell: (info) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditQuestion(info.row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDeleteQuestion(String(info.row.original._id))
              }
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      header: "الإجراءات",
    }),
  ];

  return (
    <div className="p-6">
      <DataTable
        data={questions}
        columns={columns}
        title="الأسئلة"
        addButtonText="إضافة سؤال"
        onAdd={handleAddQuestion}
      />

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleSubmitQuestion}
        isLoading={loading}
        categories={categories}
        editingQuestion={editingQuestion}
      />
    </div>
  );
}
