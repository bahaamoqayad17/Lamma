"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { CategoryType } from "@/models/Category";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/category-actions";
import CategoryFormModal from "@/components/modals/CategoryFormModal";
import { toast } from "react-toastify";

export default function CategoriesClient({ data }: { data: CategoryType[] }) {
  const columnHelper = createColumnHelper<any>();
  const [categories, setCategories] = useState<CategoryType[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitCategory = async (
    formData: FormData
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      console.log("Submitting category data:", formData);
      const response = await createCategory(formData);
      if (response.success) {
        setCategories([...categories, response.data]);
        toast.success("تم إضافة التصنيف بنجاح!");
        setIsModalOpen(false);
        return { success: true, message: "تم إضافة التصنيف بنجاح!" };
      } else {
        toast.error(response.message || "حدث خطأ أثناء إضافة التصنيف");
        setIsModalOpen(true);
        return {
          success: false,
          message: response.message || "حدث خطأ أثناء إضافة التصنيف",
        };
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("حدث خطأ أثناء إضافة التصنيف");
      return {
        success: false,
        message: "حدث خطأ أثناء إضافة التصنيف",
      };
    } finally {
      setLoading(false);
    }
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
        return <p className="text-gray-700">{info.getValue() || "لا يوجد"}</p>;
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

    columnHelper.accessor("actions", {
      cell: (info) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                deleteCategory(info.getValue()._id).then((res) => {
                  if (res.success) {
                    setCategories(
                      categories.filter(
                        (category) => category._id !== info.getValue()._id
                      )
                    );
                  }
                });
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                deleteCategory(info.getValue()._id).then((res) => {
                  if (res.success) {
                    setCategories(
                      categories.filter(
                        (category) => category._id !== info.getValue()._id
                      )
                    );
                  }
                });
              }}
            >
              <Edit className="h-4 w-4" />
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
        onAdd={() => setIsModalOpen(true)}
      />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitCategory}
        isLoading={loading}
        categories={categories}
      />
    </div>
  );
}
