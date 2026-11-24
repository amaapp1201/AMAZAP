import { DailyRecordHeader } from "@/features/daily-record-page/daily-record-header";
import { getEvent } from "@/features/event-page/event-service";
import { auth } from "@/features/helpers/auth";
import { getTeam } from "@/features/team-page/team-service";
import { Footter } from "@/features/ui/footter";
import { ReactNode } from "react";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const eventId = Number((await params).eventId);
  const session = await auth();

  // midddlewareを通過してるのでsessionが存在するはず
  if (!session) {
    throw new Error("session is null");
  }

  // 現在のイベント取得(アクション含む)
  const currentEvent = await getEvent(eventId);

  if (!currentEvent) {
    return <div>該当するイベントが存在しませんでした</div>;
  }

  const team = session.user.teamId
    ? await getTeam({ teamId: session.user.teamId })
    : null;

  return (
    <div>
      <DailyRecordHeader
        team={team}
        userProfile={session.user}
        event={currentEvent}
        isoCurrentDate={new Date().toISOString()}
      ></DailyRecordHeader>
      {children}
      <Footter></Footter>
    </div>
  );
}
