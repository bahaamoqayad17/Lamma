import Client from "./client";
import { getMafiaSession } from "@/actions/mafia-actions";

export default async function InGame({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { success, message, data } = await getMafiaSession(id);
  if (!success) {
    return <div>{message}</div>;
  }
  return <Client data={data} />;
}
