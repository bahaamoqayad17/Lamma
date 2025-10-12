"use client";

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { UserType } from "@/models/User";

export default function UsersClient({ data }: { data: UserType[] }) {
  const columnHelper = createColumnHelper<any>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "الاسم",
    }),
    columnHelper.accessor("email", {
      cell: (info) => (
        <span className="text-blue-600 hover:text-blue-800">
          {info.getValue()}
        </span>
      ),
      header: "البريد الإلكتروني",
    }),
    columnHelper.accessor("role", {
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
      header: "الدور",
    }),
    columnHelper.accessor("mobile_number", {
      cell: (info) => {
        return <p className="text-gray-700">{info.getValue()}</p>;
      },
      header: "رقم الهاتف",
    }),
    columnHelper.accessor("createdAt", {
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-500">
            {date ? new Date(date).toLocaleDateString("ar-SA") : "-"}
          </span>
        );
      },
      header: "تاريخ الإنشاء",
    }),
  ];

  return (
    <div className="p-6">
      <DataTable data={data} columns={columns} title="المستخدمين" />
    </div>
  );
}
