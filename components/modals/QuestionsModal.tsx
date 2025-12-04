"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionType } from "@/models/Question";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  categoryName?: string;
  onFetchQuestions: (categoryId: string) => Promise<{
    success: boolean;
    message: string;
    data: QuestionType[] | null;
  }>;
}

export default function QuestionsModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  onFetchQuestions,
}: QuestionsModalProps) {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!categoryId) return;

      setIsLoading(true);
      setError(null);
      try {
        const result = await onFetchQuestions(categoryId);
        if (result.success && result.data) {
          setQuestions(result.data);
        } else {
          setError(result.message || "فشل تحميل الأسئلة");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("حدث خطأ أثناء تحميل الأسئلة");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && categoryId) {
      fetchQuestions();
    } else {
      setQuestions([]);
      setError(null);
    }
  }, [isOpen, categoryId, onFetchQuestions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            أسئلة الفئة: {categoryName || "غير محدد"}
          </DialogTitle>
          <DialogDescription>
            عرض جميع الأسئلة المرتبطة بهذه الفئة
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد أسئلة لهذه الفئة
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={String(question._id)}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      السؤال {index + 1}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {question.points} نقطة
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 font-medium mb-1">السؤال:</p>
                    <p className="text-gray-900">{question.question || "لا يوجد"}</p>
                  </div>

                  {question.file_question && (
                    <div className="mb-3">
                      <p className="text-gray-700 font-medium mb-1">ملف السؤال:</p>
                      <div className="relative w-full h-48">
                        <Image
                          src={question.file_question}
                          alt="Question file"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-gray-700 font-medium mb-1">الإجابة:</p>
                    <p className="text-gray-900">{question.answer || "لا يوجد"}</p>
                  </div>

                  {question.file_answer && (
                    <div>
                      <p className="text-gray-700 font-medium mb-1">ملف الإجابة:</p>
                      <div className="relative w-full h-48">
                        <Image
                          src={question.file_answer}
                          alt="Answer file"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

