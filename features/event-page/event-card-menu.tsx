import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/features/ui/dropdown-menu";

import {
  CopyIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { EditEventSheet } from "./edit-event-sheet";
import compact from "lodash.compact";
import { Category } from "../action-page/type";
import { Team } from "../user-page/type";
import { UpdateRequestEventSchemaType } from "./schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCallback } from "react";
import { ConfirmActionButton } from "../ui/confirm-action-button";
// 削除は、このメニューでしか使わないのでサーバーの処理を直接呼ぶ
import { deleteEvent, getEventRecordCount } from "./event-service";

export function EventCardMenu({
  event,
  teams,
  categories,
  updateEvent,
  copyEvent,
  isDeletable = true,
  isShowPreviewButton = false,
  isShowEditButton = true,
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
  teams: Team[];
  categories: Category[];
  updateEvent: (
    data: UpdateRequestEventSchemaType
  ) => Promise<{ eventId: number }>;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
  isDeletable?: boolean;
  isShowPreviewButton?: boolean;
  isShowEditButton?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="w-6 h-6"></EllipsisVerticalIcon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 flex flex-col space-y-1">
        {isShowEditButton && (
          <DropdownMenuItem asChild>
            <EditEventSheet
              existingEvent={{
                id: event.id,
                eventName: event.name,
                startAt: event.startAt,
                endAt: event.endAt,
                categoryIds: compact(
                  event.categories.map((category) => category.id)
                ),
                teamIds: event.teams.map((team) => team.id),
              }}
              teams={teams}
              categories={categories}
              updateEvent={updateEvent}
              isPublished={event.isPublished}
            ></EditEventSheet>
          </DropdownMenuItem>
        )}
        {isShowPreviewButton && (
          <DropdownMenuItem asChild>
            <Button variant="outline" className="h-8 w-full" asChild>
              <Link href={`/daily-record/preview/${event.id}`}>
                <EyeIcon className="h-4 w-4 mr-1"></EyeIcon>プレビュー
              </Link>
            </Button>
          </DropdownMenuItem>
        )}

        {isDeletable && (
          <DropdownMenuItem asChild>
            <DeleteEventButton
              eventId={event.id}
              eventName={event.name}
            ></DeleteEventButton>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <CopyEventButton
            copyEvent={copyEvent}
            eventId={event.id}
          ></CopyEventButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CopyEventButton({
  eventId,
  copyEvent,
}: {
  eventId: number;
  copyEvent: (eventId: number) => Promise<{ eventId: number }>;
}) {
  const router = useRouter();

  const _copyEvent = useCallback(() => {
    copyEvent(eventId).then(() => {
      router.refresh();
      toast("イベントを複製しました！", {
        description: "計画中のイベントに複製されました。",
      });
    });
  }, [eventId]);
  return (
    <Button onClick={_copyEvent} className="h-8 w-full" variant="outline">
      <CopyIcon className="h-4 w-4 mr-1"></CopyIcon>
      このイベントを複製する
    </Button>
  );
}

function DeleteEventButton({
  eventId,
  eventName,
}: {
  eventId: number;
  eventName: string;
}) {
  return (
    <ConfirmActionButton
      label="削除する"
      variant="destructive"
      icon={<TrashIcon className="h-4 w-4 mr-1" />}
      title={`「${eventName}」を削除しますか？`}
      loadDescription={async () => {
        const recordCount = await getEventRecordCount(eventId);
        return recordCount === 0
          ? "このイベントには参加者の記録がありません。一度削除すると元に戻すことはできません。"
          : `参加者の記録${recordCount}件とランキングも一緒に削除されます。一度削除すると元に戻すことはできません。`;
      }}
      confirmLabel="削除する"
      successMessage={`「${eventName}」を削除しました`}
      onConfirm={() => deleteEvent(eventId)}
    ></ConfirmActionButton>
  );
}
