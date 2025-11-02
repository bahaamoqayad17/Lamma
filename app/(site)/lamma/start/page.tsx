import { getCategoriesForLamma } from "@/actions/category-actions";
import Client from "./client";

export default async function StartPage() {
  const { success, message, data } = await getCategoriesForLamma();

  if (!success) {
    return <div>{message}</div>;
  }

  return <Client data={JSON.parse(JSON.stringify(data))} />;
}
