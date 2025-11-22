import Client from "./client";
import { getLammaSession } from "@/actions/lamma-actions";
import LammaEndGame from "@/components/LammaEndGame";

export default async function InGame({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { success, message, data } = await getLammaSession(id);

  if (!success) {
    return <div>{message}</div>;
  }

  if (data?.session?.finished) {
    return <LammaEndGame data={JSON.parse(JSON.stringify(data?.session))} />;
  }

  return <Client data={JSON.parse(JSON.stringify(data))} />;
}
