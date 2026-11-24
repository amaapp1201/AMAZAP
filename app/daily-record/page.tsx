import { formatToJst } from "@/features/helpers/utils";
import { redirect } from "next/navigation";

export default async function Page() {
  // サーバーサイドのUTC時間
  const isoActualCurrentDate = new Date().toISOString();

  redirect(`/daily-record/${formatToJst(isoActualCurrentDate, "yyyy-MM-dd")}`);
}

export const dynamic = "force-dynamic";
