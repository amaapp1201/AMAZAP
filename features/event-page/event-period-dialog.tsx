"use client";

import { CalendarRangeIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
// 期間の設定は、この画面でしか使わないのでサーバーの処理を直接呼ぶ
import {
  EventPeriodSettings,
  clearEventUserPeriods,
  getEventPeriodSettings,
  setEventUserPeriods,
} from "./event-period-service";

// イベントの参加者ごとに、入力できる期間を設定する画面
export function EventPeriodDialog({
  eventId,
  eventName,
}: {
  eventId: number;
  eventName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<EventPeriodSettings | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPending, setIsPending] = useState(false);

  const load = useCallback(() => {
    return getEventPeriodSettings(eventId)
      .then(setSettings)
      .catch(() => {
        toast("エラーが発生しました", {
          description: "参加者の一覧を読み込めませんでした",
        });
      });
  }, [eventId]);

  // 開くたびに最新の状態を読み直し、選択は空に戻す
  useEffect(() => {
    if (isOpen) {
      setSettings(null);
      setSelectedIds([]);
      load();
    }
  }, [isOpen, load]);

  const usersByTeam = useMemo(() => {
    if (!settings) {
      return [];
    }
    return settings.teams.map((team) => ({
      team,
      users: settings.users.filter((user) => user.teamId === team.id),
    }));
  }, [settings]);

  const toggleUser = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  // チームの見出しのチェックで、そのチームの全員をまとめて選ぶ・外す
  const toggleTeam = (userIds: string[], checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? [...current, ...userIds.filter((id) => !current.includes(id))]
        : current.filter((id) => !userIds.includes(id))
    );
  };

  const run = (
    action: () => Promise<{ failure: string } | void>,
    successMessage: string
  ) => {
    setIsPending(true);
    action()
      .then(async (result) => {
        if (result?.failure) {
          toast("実行できませんでした", { description: result.failure });
          return;
        }
        await load();
        setSelectedIds([]);
        toast(successMessage);
      })
      .catch(() => {
        toast("エラーが発生しました", {
          description: "処理を完了できませんでした。もう一度お試しください",
        });
      })
      .finally(() => setIsPending(false));
  };

  const count = selectedIds.length;
  const canSet =
    count > 0 && !!startDate && !!endDate && startDate <= endDate && !isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full">
          <CalendarRangeIcon className="h-4 w-4 mr-1"></CalendarRangeIcon>
          入力期間の設定
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>「{eventName}」の入力期間</DialogTitle>
          <DialogDescription>
            ユーザーごとに、記録を入力できる期間を決められます。設定していないユーザーは、イベントの開催期間中ずっと入力できます。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-slate-50 p-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            開始日
            <Input
              type="date"
              className="h-8 w-40 bg-white text-foreground"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            終了日（この日も入力できます）
            <Input
              type="date"
              className="h-8 w-40 bg-white text-foreground"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <Button
            className="h-8"
            disabled={!canSet}
            onClick={() =>
              run(
                () =>
                  setEventUserPeriods({
                    eventId,
                    userIds: selectedIds,
                    startDate,
                    endDate,
                  }),
                `${count}人に入力期間を設定しました`
              )
            }
          >
            選んだ{count}人に設定
          </Button>
          <Button
            variant="outline"
            className="h-8"
            disabled={count === 0 || isPending}
            onClick={() =>
              run(
                () => clearEventUserPeriods({ eventId, userIds: selectedIds }),
                `${count}人の設定を外しました`
              )
            }
          >
            選んだ{count}人の設定を外す
          </Button>
          {startDate && endDate && startDate > endDate && (
            <p className="w-full text-xs text-red-600">
              終了日は、開始日と同じか後の日にしてください
            </p>
          )}
        </div>

        {!settings ? (
          <p className="text-sm text-muted-foreground">読み込んでいます…</p>
        ) : settings.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            このイベントの参加チームに、ユーザーがいません。
          </p>
        ) : (
          <div className="flex flex-col space-y-3">
            {usersByTeam.map(({ team, users }) => {
              const userIds = users.map((user) => user.userId);
              const selectedInTeam = userIds.filter((id) =>
                selectedIds.includes(id)
              ).length;
              return (
                <section key={team.id} className="rounded-md border">
                  <label className="flex items-center gap-2 bg-slate-50 px-3 py-2 text-sm font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={users.length === 0}
                      checked={
                        users.length > 0 && selectedInTeam === users.length
                      }
                      onChange={(e) => toggleTeam(userIds, e.target.checked)}
                      aria-label={`${team.name}の全員を選ぶ`}
                    />
                    {team.name}
                    <span className="text-xs font-normal text-muted-foreground">
                      {users.length}人
                    </span>
                  </label>
                  {users.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      ユーザーがいません
                    </p>
                  ) : (
                    <ul>
                      {users.map((user) => (
                        <li key={user.userId} className="border-t">
                          <label className="grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-2 px-3 py-1.5 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(user.userId)}
                              onChange={() => toggleUser(user.userId)}
                              aria-label={`${user.name}を選ぶ`}
                            />
                            <span className="break-words">{user.name}</span>
                            {user.period ? (
                              <span className="tabular-nums font-bold">
                                {user.period.startDate} 〜{" "}
                                {user.period.endDate}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                開催期間中ずっと
                              </span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
