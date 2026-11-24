import { DailyRecordHeader } from "@/features/daily-record-page/daily-record-header";
import { getCurrentEvent } from "@/features/event-page/event-service";
import { auth } from "@/features/helpers/auth";
import { getTeam } from "@/features/team-page/team-service";
import { Footter } from "@/features/ui/footter";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();

  // midddlewareを通過してるのでsessionが存在するはず
  if (!session) {
    throw new Error("session is null");
  }

  const currentEvent = await getCurrentEvent();

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
