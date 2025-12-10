import { getLastCategoriesForLamma } from "@/actions/lamma-actions";
import Client from "./client";
import { getMainCategories } from "@/actions/category-actions";

export default async function Lamma() {
  const { success, message, data } = await getLastCategoriesForLamma();

  const mainCategoriesResult = await getMainCategories();

  if (!mainCategoriesResult.success) {
    return <div>{mainCategoriesResult.message}</div>;
  }

  return (
    <Client
      categories={JSON.parse(JSON.stringify(data))}
      mainCategories={JSON.parse(JSON.stringify(mainCategoriesResult.data))}
    />
  );
}
