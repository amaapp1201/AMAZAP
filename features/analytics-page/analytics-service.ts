"use server";

import { addDays, format } from "date-fns";
import { createAdminClient } from "@/features/supabase/server";
import { requireAdmin } from "../helpers/require-admin";
import { convertIsoDateIntoJstRecordDate } from "../helpers/utils";
import { AnalyticsData, AnalyticsEventOption } from "./types";

// 個人の記録を扱うため、管理者だけが呼べる。全ユーザー分を読むのでサーバー用の鍵を使う

// 分析できるイベント（公開済みのもの）を、新しい順に返す
export async function getAnalyticsEvents(): Promise<AnalyticsEventOption[]> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data, error } = await supabase
    .from("events")
    .select("id, name, status")
    .in("status", ["active", "done"])
    .order("status", { ascending: true })
    .order("id", { ascending: false });

  if (error) {
    console.error("query error events", error);
    throw error;
  }

  return data.map((event) => ({
    id: event.id,
    name: event.name,
    status: event.status === "active" ? "active" : "done",
  }));
}

// ISO 日時を、日本時間の yyyy-MM-dd にする
function toJstDay(iso: string) {
  return convertIsoDateIntoJstRecordDate(iso).slice(0, 10);
}

function listDays(startDay: string, endDay: string) {
  const days: string[] = [];
  // 日付だけを扱うので、時差の影響を受けないよう正午で計算する
  let current = new Date(`${startDay}T12:00:00Z`);
  const end = new Date(`${endDay}T12:00:00Z`);
  // 異常に長い期間でも止まるよう上限を置く
  while (current <= end && days.length < 1000) {
    days.push(format(current, "yyyy-MM-dd"));
    current = addDays(current, 1);
  }
  return days;
}

export async function getAnalyticsData(
  eventId: number
): Promise<AnalyticsData | null> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      startAt,
      endAt,
      event_categories (
        category_id,
        name_snapshot,
        order_id_snapshot
      ),
      event_actions_snapshot (
        action_id,
        name,
        category_id,
        point,
        order_id
      ),
      event_teams (
        team_id,
        name_snapshot
      ),
      event_users_snapshot (
        user_id,
        name,
        team_id
      )
      `
    )
    .eq("id", eventId)
    .in("status", ["active", "done"])
    .maybeSingle();

  if (eventError) {
    console.error("query error event", eventError);
    throw eventError;
  }

  if (!event) {
    return null;
  }

  // 1 回の問い合わせで返る行数には上限があるので、分けて全件を読む
  const pageSize = 1000;
  const records: AnalyticsData["records"] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("records")
      .select(
        `
        id,
        date,
        user_id,
        snapshot_team_id,
        today_step_summary,
        today_action_point_summary,
        record_actions ( action_id )
        `
      )
      .eq("event_id", eventId)
      .order("id")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("query error records", error);
      throw error;
    }

    for (const record of data) {
      records.push({
        userId: record.user_id,
        teamId: record.snapshot_team_id,
        day: record.date.slice(0, 10),
        steps: record.today_step_summary,
        actionPoints: record.today_action_point_summary,
        actionIds: record.record_actions.map((action) => action.action_id),
      });
    }

    if (data.length < pageSize) {
      break;
    }
  }

  // 公開後に追加されたユーザーなど、スナップショットに無いユーザーの名前を補う
  const users = new Map(
    event.event_users_snapshot.map((user) => [
      user.user_id,
      {
        id: user.user_id,
        name: user.name ?? "名前不明",
        teamId: user.team_id,
      },
    ])
  );
  const missingUserIds = [
    ...new Set(
      records.map((record) => record.userId).filter((id) => !users.has(id))
    ),
  ];
  if (missingUserIds.length > 0) {
    const nextAuth = await createAdminClient({ schema: "next_auth" });
    const { data, error } = await nextAuth
      .from("users")
      .select("id, name")
      .in("id", missingUserIds);

    if (error) {
      console.error("query error users", error);
      throw error;
    }

    for (const user of data) {
      const teamId =
        records.find((record) => record.userId === user.id)?.teamId ?? null;
      users.set(user.id, { id: user.id, name: user.name, teamId });
    }
  }

  // ユーザーごとの入力期間
  const { data: periods, error: periodsError } = await supabase
    .from("event_user_periods")
    .select("user_id, start_date, end_date")
    .eq("event_id", eventId);

  if (periodsError) {
    console.error("query error event_user_periods", periodsError);
    throw periodsError;
  }

  const periodByUser = new Map(
    periods.map((period) => [
      period.user_id,
      { startDate: period.start_date, endDate: period.end_date },
    ])
  );

  // 日付の範囲: 開始日から、終了日と今日の早いほうまで。範囲外の記録があればそこまで広げる
  const today = toJstDay(new Date().toISOString());
  const recordDays = records.map((record) => record.day).sort();
  const startCandidates = [
    event.startAt ? toJstDay(event.startAt) : null,
    recordDays[0] ?? null,
  ].filter((day): day is string => !!day);
  const startDay = startCandidates.sort()[0] ?? today;
  const scheduledEnd = event.endAt ? toJstDay(event.endAt) : today;
  const endCandidates = [
    scheduledEnd < today ? scheduledEnd : today,
    recordDays[recordDays.length - 1] ?? null,
    startDay,
  ].filter((day): day is string => !!day);
  const endDay = endCandidates.sort()[endCandidates.length - 1];

  const categoryOrder = new Map(
    event.event_categories.map((category) => [
      category.category_id,
      category.order_id_snapshot ?? 0,
    ])
  );

  return {
    event: { id: event.id, name: event.name },
    days: listDays(startDay, endDay),
    teams: event.event_teams
      .map((team) => ({
        id: team.team_id,
        name: team.name_snapshot ?? "名称不明",
      }))
      .sort((a, b) => a.id - b.id),
    users: [...users.values()]
      .map((user) => ({ ...user, period: periodByUser.get(user.id) ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja")),
    categories: event.event_categories
      .map((category) => ({
        id: category.category_id,
        name: category.name_snapshot ?? "名称不明",
        order: category.order_id_snapshot ?? 0,
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ id, name }) => ({ id, name })),
    actions: event.event_actions_snapshot
      .map((action) => ({
        id: action.action_id,
        name: action.name,
        categoryId: action.category_id,
        point: action.point,
        order: action.order_id,
      }))
      .sort(
        (a, b) =>
          (categoryOrder.get(a.categoryId) ?? 0) -
            (categoryOrder.get(b.categoryId) ?? 0) || a.order - b.order
      )
      .map(({ id, name, categoryId, point }) => ({
        id,
        name,
        categoryId,
        point,
      })),
    records,
  };
}
