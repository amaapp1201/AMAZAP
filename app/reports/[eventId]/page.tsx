import { getSimpleEvent } from "@/features/event-page/event-service";
import { ReportHome } from "@/features/report-page/report-home";
import {
  getTeamReportByEventId,
  getUserReportByEventId,
} from "@/features/report-page/report-service";
import { auth } from "@/features/helpers/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const eventId = Number((await params).eventId);
  const session = await auth();

  if (!session) {
    throw new Error("session is null");
  }

  const teamsReport = await getTeamReportByEventId({ eventId: eventId });

  const teams = (teamsReport ?? []).map((team) => ({
    id: team.team_id,
    name: team.team_name,
    points: team.total_action_point + Math.floor(team.total_step / 1000),
    steps: team.total_step,
  }));

  const usersReport = await getUserReportByEventId({ eventId: eventId });

  const users = (usersReport ?? []).map((user) => ({
    id: user.user_id,
    name: `${user.user_name}(${user.team_name})`,
    points: user.total_action_point + Math.floor(user.total_step / 1000),
    steps: user.total_step,
  }));

  const event = await getSimpleEvent(eventId);

  if (!event) {
    return <div>イベントが見つかりません</div>;
  }

  if (
    !session.user.isAdmin &&
    !event.is_team_rank_visible &&
    !event.is_user_rank_visible
  ) {
    return <div>ランキングは非公開です</div>;
  }

  return (
    <ReportHome
      event={event}
      teams={teams}
      users={users}
      isTeamRankVisible={event.is_team_rank_visible || session.user.isAdmin}
      isUserRankVisible={event.is_user_rank_visible || session.user.isAdmin}
    ></ReportHome>
  );
}
