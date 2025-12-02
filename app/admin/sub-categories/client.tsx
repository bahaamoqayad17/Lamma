"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { CategoryType } from "@/models/Category";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/category-actions";
import CategoryFormModal from "@/components/modals/CategoryFormModal";
import { toast } from "react-toastify";

export default function CategoriesClient({ data }: { data: CategoryType[] }) {
  const columnHelper = createColumnHelper<any>();
  const [categories, setCategories] = useState<CategoryType[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmitCategory = async (
    formData: FormData
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      console.log("Submitting category data:", formData);

      let response: any;
      if (editingCategory) {
        // Update existing category
        response = await updateCategory(String(editingCategory._id), formData);
        if (response.success) {
          setCategories(
            categories.map((cat) =>
              cat._id === editingCategory._id ? response.data : cat
            )
          );
          toast.success("تم تحديث الفئة بنجاح!");
          setIsModalOpen(false);
          setEditingCategory(null);
        }
      } else {
        // Create new category
        response = await createCategory(formData);
        if (response.success) {
          setCategories([...categories, response.data]);
          toast.success("تم إضافة الفئة بنجاح!");
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
      console.error("Error submitting category:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الفئة؟");
    if (!confirmed) return;

    try {
      const response = await deleteCategory(id);
      if (response.success) {
        setCategories(categories.filter((category) => category._id !== id));
        toast.warning("تم حذف الفئة بنجاح");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("حدث خطأ أثناء حذف الفئة");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "الاسم",
    }),
    columnHelper.accessor("description", {
      cell: (info) => (
        <span className="text-blue-600 hover:text-blue-800">
          {info.getValue()}
        </span>
      ),
      header: "الوصف",
    }),
    columnHelper.accessor("image", {
      cell: (info) => (
        <span className="text-gray-700">
          <Image src={info.getValue()} alt="image" width={100} height={100} />
        </span>
      ),
      header: "الصورة",
    }),
    columnHelper.accessor("category", {
      cell: (info) => {
        return (
          <p className="text-gray-700">{info.getValue()?.name || "لا يوجد"}</p>
        );
      },
      header: "الفئة الرئيسية",
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
              onClick={() => handleEditCategory(info.row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDeleteCategory(String(info.row.original._id))
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
        data={categories}
        columns={columns}
        title="الفئات"
        addButtonText="إضافة فئة"
        onAdd={handleAddCategory}
      />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        isLoading={loading}
        categories={categories}
        editingCategory={editingCategory}
        isSubCategory={true}
      />
    </div>
  );
}
