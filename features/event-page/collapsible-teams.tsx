"use client";
import useSWR from "swr";
import { Collapsible } from "./collapsible";
import { TeamUser } from "../team-page/team-user";

// ユーザーはisVisibleな時にfetchする
export function CollapsibleTeams({
  isDefaultShow,
  eventTeams,
  eventId,
  isLocked = false,
}: {
  isDefaultShow: boolean;
  eventTeams: {
    id: number;
    name: string;
  }[];
  eventId: number;
  isLocked?: boolean;
}) {
  return (
    <Collapsible title="参加チーム詳細" isDefaultShow={isDefaultShow}>
      <div className="flex flex-col space-y-3">
        {eventTeams.length <= 0 && <div>参加チームが設定されていません</div>}
        {eventTeams.map((team, teamIndex) => (
          <TeamUser
            isLocked={isLocked}
            key={team.id}
            teamId={team.id}
            teamName={team.name}
            eventId={eventId}
          ></TeamUser>
        ))}
      </div>
    </Collapsible>
  );
}
