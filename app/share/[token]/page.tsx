import { notFound } from "next/navigation";
import { getGanttDataByToken } from "@/lib/db/queries";
import { ShareView } from "./ShareView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const data = await getGanttDataByToken(token);
  if (!data) notFound();

  const referenceDate =
    data.planning.referenceDate ?? new Date().toISOString().slice(0, 10);

  return <ShareView data={data} referenceDate={referenceDate} />;
}
