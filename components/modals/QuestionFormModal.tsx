"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrap } from "@/components/ui/field-wrap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryType } from "@/models/Category";
import { QuestionType } from "@/models/Question";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  categories?: CategoryType[];
  editingQuestion?: QuestionType | null;
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  categories = [],
  editingQuestion = null,
}: QuestionFormModalProps) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    points: 0,
    file_question: "",
    file_answer: "",
    categoryId: "",
  });

  const [questionFileQuestion, setQuestionFileQuestion] = useState<File | null>(
    null
  );
  const [questionFileAnswer, setQuestionFileAnswer] = useState<File | null>(
    null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effect to populate form when editing
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        question: editingQuestion.question || "",
        answer: editingQuestion.answer || "",
        points: editingQuestion.points || 0,
        file_question: editingQuestion.file_question || "",
        file_answer: editingQuestion.file_answer || "",
        categoryId: editingQuestion.category
          ? String(editingQuestion.category)
          : "",
      });
    } else {
      setFormData({
        question: "",
        answer: "",
        points: 0,
        file_question: "",
        file_answer: "",
        categoryId: "",
      });
    }
    setQuestionFileQuestion(null);
    setQuestionFileAnswer(null);
    setErrors({});
  }, [editingQuestion, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleQuestionFileChange = (file: File | null) => {
    setQuestionFileQuestion(file);
  };

  const handleAnswerFileChange = (file: File | null) => {
    setQuestionFileAnswer(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question?.trim()) {
      newErrors.question = "اسم السؤال مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("question", formData.question);
      formDataToSubmit.append("answer", formData.answer);
      formDataToSubmit.append("points", formData.points.toString());
      formDataToSubmit.append("categoryId", formData.categoryId);

      // Add files
      if (questionFileQuestion) {
        formDataToSubmit.append("file_question", questionFileQuestion);
      }
      if (questionFileAnswer) {
        formDataToSubmit.append("file_answer", questionFileAnswer);
      }

      const response = await onSubmit(formDataToSubmit);
      if (response.success) {
        toast.success(response.message || "تم إضافة السؤال بنجاح");
        handleClose();
      } else {
        toast.error(response.message || "حدث خطأ أثناء إضافة السؤال");
      }
    }
  };

  const handleClose = () => {
    setFormData({
      question: "",
      answer: "",
      points: 0,
      file_question: "",
      file_answer: "",
      categoryId: "",
    });
    setQuestionFileQuestion(null);
    setQuestionFileAnswer(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle>
            {editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد"}
          </DialogTitle>
          <DialogDescription>
            {editingQuestion
              ? "قم بتعديل البيانات المطلوبة للسؤال"
              : "قم بملء البيانات المطلوبة لإضافة سؤال جديد"}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Name */}
            <div className="md:col-span-2">
              <Label>اسم السؤال</Label>
              <FieldWrap>
                <Input
                  value={formData.question || ""}
                  onChange={(e) =>
                    handleInputChange("question", e.target.value)
                  }
                  placeholder="أدخل اسم السؤال"
                  className={errors.question ? "border-red-500" : ""}
                />
                {errors.question && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </FieldWrap>
            </div>

            {/* Answer */}
            <div className="md:col-span-2">
              <Label>إجابة السؤال</Label>
              <FieldWrap>
                <textarea
                  value={formData.answer || ""}
                  onChange={(e) => handleInputChange("answer", e.target.value)}
                  placeholder="أدخل إجابة السؤال"
                  className="w-full px-3 py-2 border rounded-md resize-none border-gray-300"
                  rows={3}
                />
              </FieldWrap>
            </div>

            {/* Points */}
            <div className="md:col-span-2">
              <Label>النقاط</Label>
              <FieldWrap>
                <Select
                  value={formData.points?.toString() || "200"}
                  onValueChange={(value) => handleInputChange("points", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر النقاط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="600">600</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWrap>
            </div>

            {/* Parent Category */}
            <div className="md:col-span-2">
              <Label>الفئة</Label>
              <FieldWrap>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) =>
                    handleInputChange(
                      "categoryId",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد فئة</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category._id.toString()}
                        value={category._id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            </div>

            {/* Question File Upload */}
            <div className="md:col-span-2">
              <Label>ملف السؤال (إن وجد)</Label>
              <FieldWrap>
                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleQuestionFileChange(file);
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {questionFileQuestion && (
                  <p className="text-sm text-gray-600 mt-1">
                    الملف المحدد: {questionFileQuestion.name}
                  </p>
                )}
              </FieldWrap>
            </div>

            {/* Answer File Upload */}
            <div className="md:col-span-2">
              <Label>ملف الإجابة (إن وجد)</Label>
              <FieldWrap>
                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleAnswerFileChange(file);
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {questionFileAnswer && (
                  <p className="text-sm text-gray-600 mt-1">
                    الملف المحدد: {questionFileAnswer.name}
                  </p>
                )}
              </FieldWrap>
            </div>
          </div>

          <div className="flex justify-between w-full">
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading
                ? editingQuestion
                  ? "جاري التحديث..."
                  : "جاري الإضافة..."
                : editingQuestion
                ? "تحديث السؤال"
                : "إضافة السؤال"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
