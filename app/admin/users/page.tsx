import { getUsers } from "@/actions/user-actons";
import UsersClient from "./client";
import { UserType } from "@/models/User";

export default async function UsersPage() {
  const { success, message, data } = await getUsers();

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

  return <UsersClient data={JSON.parse(JSON.stringify(data)) as UserType[]} />;
}
