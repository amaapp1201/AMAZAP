"use client";

import { isBefore } from "date-fns";
import { useRouter } from "next/navigation";

import { UpdateRequestEventSchemaType } from "./schema";
import { Team } from "../user-page/type";
import { Category } from "../action-page/type";

import { EventCardMenu } from "./event-card-menu";
import { CollapsibleCategories } from "./collapsible-categories";
import { CollapsibleTeams } from "./collapsible-teams";
import { ArchiveButton } from "./archive-button";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PublishButton } from "./publish-button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { AwardIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { formatToJst } from "../helpers/utils";

export function ExpandedEventCard({
  event,
  isDefaultShowCategories = false,
  isDefaultShowTeams = false,
  isShowEditMenu = false,
  isShowPreviewButton = false,
  isShowEditButton = true,
  isPublisable = true,
  isArchivable = true,
  updateEvent = () => Promise.resolve({ eventId: 0 }),
  updateRankVisible = () => Promise.resolve(),
  archiveEvent = () => Promise.resolve(),
  publishEvent = () => Promise.resolve(),
  copyEvent = () => Promise.resolve({ eventId: 0 }),
  teams,
  categories,
  isArchived = false,
  isPublished = false,
}: {
  event: {
    id: number;
    name: string;

    startAt: string | null;
    endAt: string | null;
    isTeamRankVisible: boolean;
    isUserRankVisible: boolean;
    isPublished: boolean;
    categories: {
      id: number;
      name: string;
      orderId: number;
      actions: {
        id: number;
        name: string;
        point: number;
        orderId: number;
      }[];
    }[];
    teams: {
      id: number;
      name: string;
    }[];
  };
  isDefaultShowCategories?: boolean;
  isDefaultShowTeams?: boolean;
  isShowPreviewButton?: boolean;
  isShowEditButton?: boolean;
  isShowEditMenu?: boolean;
  updateEvent?: (
    data: UpdateRequestEventSchemaType
  ) => Promise<{ eventId: number }>;
  archiveEvent?: (eventId: number) => Promise<void>;
  publishEvent?: (eventId: number) => Promise<any>;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
  updateRankVisible?: (data: {
    eventId: number;
    isTeamRankVisible?: boolean;
    isUserRankVisible?: boolean;
  }) => Promise<any>;
  isPublisable?: boolean;
  isArchivable?: boolean;
  teams: Team[];
  categories: Category[];
  isArchived?: boolean;
  isPublished?: boolean;
}) {
  const router = useRouter();
  const onClickArchiveButton = useCallback(() => {
    archiveEvent(event.id)
      .then(() => {
        toast("イベントをアーカイブしました");
        router.refresh();
      })
      .catch((error) => {
        console.error("archive error", error);
        toast("アーカイブエラー", {
          description: "アーカイブに失敗しました",
        });
      });
  }, []);

  const onClickPublishButton = useCallback(() => {
    publishEvent(event.id)
      .then(() => {
        router.refresh();
        toast("イベントを公開しました");
      })
      .catch((error) => {
        console.error("archive error", error);
        toast("公開エラー", {
          description: "イベント公開に失敗しました",
        });
      });
  }, []);

  const isFinished = useMemo(
    () => (event.endAt ? isBefore(event.endAt, new Date()) : false),
    [event.endAt]
  );
  const isNotYesStarted = useMemo(
    () => (event.startAt ? isBefore(new Date(), event.startAt) : false),
    [event.startAt]
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex  items-center gap-2">
            <span className="text-lg font-semibold"> {event.name}</span>

            {isFinished ? <Badge variant="secondary">終了</Badge> : ""}
            {isNotYesStarted ? <Badge variant="outline">開始前</Badge> : ""}
            {!isFinished && !isNotYesStarted ? (
              <Badge variant="default">進行中</Badge>
            ) : (
              ""
            )}
          </div>
          <div className="flex space-x-1 text-sm text-gray-500">
            <span>
              {event.startAt
                ? formatToJst(event.startAt, "yyyy-MM-dd")
                : "設定なし"}
            </span>
            <span>〜</span>
            <span>
              {event.endAt
                ? formatToJst(event.endAt, "yyyy-MM-dd")
                : "設定なし"}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          {event.id && (
            <div className="text-right mr-1 flex space-x-3">
              {isPublisable && (
                <PublishButton
                  onClick={onClickPublishButton}
                  isRepublish={isArchived}
                ></PublishButton>
              )}
              {isArchivable && (
                <ArchiveButton onClick={onClickArchiveButton}></ArchiveButton>
              )}
              <RankingConfig
                event={event}
                updateRankVisible={updateRankVisible}
              ></RankingConfig>
            </div>
          )}
          {isShowEditMenu && (
            <EventCardMenu
              event={event}
              teams={teams}
              updateEvent={updateEvent}
              copyEvent={copyEvent}
              categories={categories}
              isShowPreviewButton={isShowPreviewButton}
              isShowEditButton={isShowEditButton}
            ></EventCardMenu>
          )}
        </div>
      </div>
      <CollapsibleCategories
        isDefaultShow={isDefaultShowCategories}
        categories={event.categories}
        isLocked={isPublished || isArchived}
      ></CollapsibleCategories>
      <CollapsibleTeams
        isDefaultShow={isDefaultShowTeams}
        eventTeams={event.teams}
        eventId={event.id}
        isLocked={isPublished || isArchived}
      ></CollapsibleTeams>
    </div>
  );
}

function RankingConfig({
  event,
  updateRankVisible = () => Promise.resolve(),
}: {
  event: {
    isTeamRankVisible: boolean;
    isUserRankVisible: boolean;
    id: number;
  };
  updateRankVisible?: (data: {
    eventId: number;
    isTeamRankVisible?: boolean;
    isUserRankVisible?: boolean;
  }) => Promise<any>;
}) {
  const router = useRouter();

  const toggleTeamRankVisible = useCallback((checked: boolean) => {
    updateRankVisible({
      eventId: event.id,
      isTeamRankVisible: checked,
    })
      .then(() => {
        router.refresh();
        toast(
          checked
            ? "チームランキングを公開しました"
            : "チームランキングを非公開にしました"
        );
      })
      .catch((error) => {
        console.error("update error", error);
        toast("更新エラー", {
          description: "更新に失敗しました",
        });
      });
  }, []);

  const toggleUserRankVisible = useCallback((checked: boolean) => {
    updateRankVisible({
      eventId: event.id,
      isUserRankVisible: checked,
    })
      .then(() => {
        router.refresh();
        toast(
          checked
            ? "ユーザーランキングを公開しました"
            : "ユーザーランキングを非公開にしました"
        );
      })
      .catch((error) => {
        console.error("update error", error);
        toast("更新エラー", {
          description: "更新に失敗しました",
        });
      });
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-yellow-600 text-white hover:bg-yellow-700"
        >
          <AwardIcon className="w-4 h-4 mr-1"></AwardIcon>
          ランキング設定
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-1">
            <Switch
              id={`isTeamRankVisible-${event.id}`}
              checked={event.isTeamRankVisible}
              onCheckedChange={toggleTeamRankVisible}
            />
            <Label
              className="flex-1 text-nowrap"
              htmlFor={`isTeamRankVisible-${event.id}`}
            >
              チームランキング公開
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <Switch
              id={`isUserRankVisible-${event.id}`}
              checked={event.isUserRankVisible}
              onCheckedChange={toggleUserRankVisible}
            />
            <Label
              className="flex-1 text-nowrap"
              htmlFor={`isUserRankVisible-${event.id}`}
            >
              個人ランキング公開
            </Label>
          </div>
          <Link
            href={`/reports/${event.id}`}
            target="_blank"
            className="underline flex space-x-1 items-center text-slate-700"
          >
            <span>ランキングを見る</span>
            <ExternalLinkIcon className="h-4 w-4 "></ExternalLinkIcon>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
