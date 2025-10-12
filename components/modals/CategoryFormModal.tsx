"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
  categories?: CategoryType[];
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  categories = [],
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const [categoryImage, setCategoryImage] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleFileChange = (file: File | null) => {
    setCategoryImage(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "اسم التصنيف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("categoryId", formData.categoryId);

      // Add image file
      if (categoryImage) {
        formDataToSubmit.append("categoryImage", categoryImage);
      }

      const response = await onSubmit(formDataToSubmit);
      if (response.success) {
        toast.success(response.message || "تم إضافة التصنيف بنجاح");
        handleClose();
      } else {
        toast.error(response.message || "حدث خطأ أثناء إضافة التصنيف");
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
    });
    setCategoryImage(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle>إضافة تصنيف جديد</DialogTitle>
          <DialogDescription>
            قم بملء البيانات المطلوبة لإضافة تصنيف جديد
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Name */}
            <div className="md:col-span-2">
              <Label>اسم التصنيف</Label>
              <FieldWrap>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="أدخل اسم التصنيف"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </FieldWrap>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label>وصف التصنيف</Label>
              <FieldWrap>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="أدخل وصف التصنيف"
                  className="w-full px-3 py-2 border rounded-md resize-none border-gray-300"
                  rows={3}
                />
              </FieldWrap>
            </div>

            {/* Parent Category */}
            <div className="md:col-span-2">
              <Label>التصنيف الأب (اختياري)</Label>
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
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف الأب (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد تصنيف أب</SelectItem>
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

            {/* Category Image Upload */}
            <div className="md:col-span-2">
              <Label>صورة التصنيف</Label>
              <FieldWrap>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(file);
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {categoryImage && (
                  <p className="text-sm text-gray-600 mt-1">
                    الصورة المحددة: {categoryImage.name}
                  </p>
                )}
              </FieldWrap>
            </div>
          </div>

          <div className="flex justify-between w-full">
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? "جاري الإضافة..." : "إضافة التصنيف"}
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
