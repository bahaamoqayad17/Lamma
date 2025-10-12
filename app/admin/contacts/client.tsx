"use client";

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { ContactType } from "@/models/Contact";

export default function ContactsClient({ data }: { data: ContactType[] }) {
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
    columnHelper.accessor("subject", {
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
      header: "الموضوع",
    }),
    columnHelper.accessor("message", {
      cell: (info) => {
        const message = info.getValue();
        return (
          <div className="max-w-[200px]">
            <p className="text-sm text-gray-600 truncate">
              {message && message.length > 50
                ? `${message.substring(0, 50)}...`
                : message || "-"}
            </p>
          </div>
        );
      },
      header: "الرسالة",
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
      header: "تاريخ الإرسال",
    }),
  ];

  return (
    <div className="p-6">
      <DataTable data={data} columns={columns} title="رسائل التواصل" />
    </div>
  );
}
