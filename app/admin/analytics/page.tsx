import { AnalyticsHome } from "@/features/analytics-page/analytics-home";
import {
  getAnalyticsData,
  getAnalyticsEvents,
} from "@/features/analytics-page/analytics-service";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    event?: string; // 分析するイベントの id。指定がなければ先頭（進行中の新しいもの）
  }>;
}) {
  const { event: eventParam } = await searchParams;

  const events = await getAnalyticsEvents();
  const selectedEvent =
    events.find((event) => event.id === Number(eventParam)) ?? events[0];

  const data = selectedEvent ? await getAnalyticsData(selectedEvent.id) : null;

  return <AnalyticsHome events={events} data={data}></AnalyticsHome>;
}

export const dynamic = "force-dynamic";
