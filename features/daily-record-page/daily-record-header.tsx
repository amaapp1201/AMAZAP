import { UserNameWithMenu } from "./user-name-with-menu";
import { RankButton } from "../event-page/rank-button";
import { formatToJst, nextDay } from "../helpers/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/ui/popover";
import { InfoIcon } from "lucide-react";
import { isWihtinEventRange } from "./get-recordable-range";
import { format } from "date-fns";

export function DailyRecordHeader({
  team,
  userProfile,
  event,
  isoCurrentDate,
  isPersonalPeriod = false,
}: {
  team: { name: string } | null;
  userProfile: { name: string; isAdmin: boolean } | null;
  event: {
    id: number;
    name: string;
    startAt: string | null;
    endAt: string | null;
    is_team_rank_visible: boolean;
    is_user_rank_visible: boolean;
  } | null;
  isoCurrentDate: string;
  // true のときは、event の期間がこのユーザーだけの入力期間であることを表示する
  isPersonalPeriod?: boolean;
}) {
  return (
    <header>
      <div className="flex justify-between p-4">
        <span className="font-bold">{team?.name ?? "???チーム"}</span>
        <UserNameWithMenu
          name={userProfile?.name ?? "???"}
          isAdmin={userProfile?.isAdmin ?? false}
        ></UserNameWithMenu>
      </div>
      {event && (
        <div className="relative flex flex-col items-center px-4 pb-4 pt-8 space-y-5 bg-blue-300">
          {(event.is_team_rank_visible || event.is_user_rank_visible) && (
            <span className="absolute right-2 top-2">
              <RankButton eventId={event.id} iconOnly></RankButton>
            </span>
          )}
          <span className="text-2xl text-center font-bold">{event.name}</span>
          {!isWihtinEventRange(
            {
              startAt: event.startAt,
              endAt: event.endAt,
            },
            isoCurrentDate,
            "Asia/Tokyo"
          ) && (
            <span className="flex">
              <span className="text-red-500">
                {isPersonalPeriod
                  ? "あなたの入力期間外です"
                  : "イベント期間外です"}
              </span>
            </span>
          )}

          <div className="self-end flex flex-col items-end">
            <span>
              {isPersonalPeriod ? "あなたの入力期間:" : "集計期間:"}
              {event.startAt
                ? formatToJst(event.startAt, "MM/dd HH:mm")
                : "???"}
              ~{event.endAt ? formatToJst(event.endAt, "MM/dd HH:mm") : "???"}
            </span>
            <div>
              {event.endAt && (
                <span className="text-sm flex">
                  ※{format(nextDay(event.endAt, "Asia/Tokyo"), "MM/dd")}
                  まで入力できます
                  <Popover>
                    <PopoverTrigger>
                      <InfoIcon className="text-slate-700 w-4 h-4 ml-1"></InfoIcon>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white w-full max-w-[95vw] sm:max-w-[400pxd p-4 rounded-md shadow-sm">
                      イベント期間中にその日の出来事を記録できます。さらに、前日分もさかのぼって記録が可能です。
                      <br />
                      また、イベントが終了した後でも、次の日まで前日分を記録することができます。たとえば、イベントが12月5日に終了した場合、12月6日までは12月5日の出来事を記録できます。
                    </PopoverContent>
                  </Popover>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
