import { getAnswerCorrections } from "@/actions/contact-actions";
import ContactsClient from "./client";
import { ContactType } from "@/models/Contact";

export default async function ContactsPage() {
  const result = await getAnswerCorrections();

  if (!result.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">
          خطأ في تحميل البيانات
        </h1>
        <p className="text-gray-600">{result.message}</p>
      </div>
    );
  }

  return (
    <ContactsClient
      data={JSON.parse(JSON.stringify(result.data)) as ContactType[]}
    />
  );
}
