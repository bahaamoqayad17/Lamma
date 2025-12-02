"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { UserType } from "@/models/User";
import { Button } from "@/components/ui/button";
import { Ban, RotateCcw, Wallet } from "lucide-react";
import { banOrRestoreUser, updateUserBalances } from "@/actions/user-actons";
import { toast } from "react-toastify";
import BalanceModal from "@/components/modals/BalanceModal";

export default function UsersClient({ data }: { data: UserType[] }) {
  const columnHelper = createColumnHelper<any>();
  const [users, setUsers] = useState<UserType[]>(data);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBanOrRestore = async (userId: string) => {
    try {
      const response = await banOrRestoreUser(userId);
      if (response.success) {
        setUsers(
          users.map((user) => (user._id === userId ? response.data : user))
        );
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error banning/restoring user:", error);
      toast.error("حدث خطأ أثناء العملية");
    }
  };

  const handleOpenBalanceModal = (user: UserType) => {
    setSelectedUser(user);
    setIsBalanceModalOpen(true);
  };

  const handleUpdateBalances = async (
    lammaBalance: number,
    mafiaBalance: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!selectedUser) {
      return { success: false, message: "المستخدم غير محدد" };
    }

    setLoading(true);
    try {
      const response = await updateUserBalances(
        String(selectedUser._id),
        lammaBalance,
        mafiaBalance
      );
      if (response.success) {
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data : user
          )
        );
        toast.success(response.message);
        return { success: true, message: response.message };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Error updating balances:", error);
      toast.error("حدث خطأ أثناء تحديث الأرصدة");
      return { success: false, message: "حدث خطأ أثناء العملية" };
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
    columnHelper.accessor("email", {
      cell: (info) => (
        <div className="max-w-[180px] break-words">
          <p className="text-blue-600 hover:text-blue-800 break-words whitespace-normal">
            {info.getValue()}
          </p>
        </div>
      ),
      header: "البريد الإلكتروني",
    }),
    columnHelper.accessor("role", {
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
      header: "الدور",
    }),
    columnHelper.accessor("isActive", {
      cell: (info) => {
        const isActive = info.getValue();
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "نشط" : "محظور"}
          </span>
        );
      },
      header: "الحالة",
    }),
    columnHelper.accessor("lammaBalance", {
      cell: (info) => (
        <span className="font-semibold text-blue-600">
          {info.getValue() || 0}
        </span>
      ),
      header: "رصيد لمة",
    }),
    columnHelper.accessor("mafiaBalance", {
      cell: (info) => (
        <span className="font-semibold text-purple-600">
          {info.getValue() || 0}
        </span>
      ),
      header: "رصيد مافيا",
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
        const user = info.row.original;
        const isActive = user.isActive;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBanOrRestore(String(user._id))}
              title={isActive ? "حظر المستخدم" : "تفعيل المستخدم"}
              className={isActive ? "text-red-600" : "text-green-600"}
            >
              {isActive ? (
                <Ban className="h-4 w-4" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenBalanceModal(user)}
              title="تعديل الأرصدة"
            >
              <Wallet className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      header: "الإجراءات",
    }),
  ];

  return (
    <div className="p-6">
      <DataTable data={users} columns={columns} title="المستخدمين" />

      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => {
          setIsBalanceModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateBalances}
        isLoading={loading}
        initialLammaBalance={selectedUser?.lammaBalance || 0}
        initialMafiaBalance={selectedUser?.mafiaBalance || 0}
        userName={selectedUser?.name || ""}
      />
    </div>
  );
}
