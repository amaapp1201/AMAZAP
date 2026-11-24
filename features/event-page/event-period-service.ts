"use server";

import { createAdminClient, createClient } from "@/features/supabase/server";
import { requireAdmin } from "../helpers/require-admin";

// イベントの中で、ユーザーごとに入力できる期間（開始日・終了日とも含む、日本時間の日付）。
// 設定のないユーザーは、イベントの開催期間中ずっと入力できる

export type EventUserPeriod = {
  // yyyy-MM-dd
  startDate: string;
  endDate: string;
};

export type EventPeriodUser = {
  userId: string;
  name: string;
  teamId: number;
  period: EventUserPeriod | null;
};

export type EventPeriodSettings = {
  teams: { id: number; name: string }[];
  users: EventPeriodUser[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ログイン中のユーザー自身の期間を返す。設定がなければ null
export async function getMyEventPeriod(
  eventId: number,
  userId: string
): Promise<EventUserPeriod | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_user_periods")
    .select("start_date, end_date")
    .match({ event_id: eventId, user_id: userId })
    .maybeSingle();

  if (error) {
    console.error("query error event_user_periods", error);
    throw error;
  }

  return data ? { startDate: data.start_date, endDate: data.end_date } : null;
}

// 期間の設定画面に出す、イベントの参加チームとユーザー、現在の期間
export async function getEventPeriodSettings(
  eventId: number
): Promise<EventPeriodSettings> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      id,
      event_teams ( team_id, name_snapshot, teams ( name ) ),
      event_users_snapshot ( user_id, name, team_id )
      `
    )
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    console.error("query error event", eventError);
    throw eventError;
  }

  if (!event) {
    return { teams: [], users: [] };
  }

  const teams = event.event_teams
    .map((team) => ({
      id: team.team_id,
      name: team.name_snapshot ?? team.teams?.name ?? "名称不明",
    }))
    .sort((a, b) => a.id - b.id);
  const teamIds = teams.map((team) => team.id);

  // 公開時に固定された参加者に、いま参加チームに所属している利用中のユーザーを足す
  // （公開前のイベントや、公開後にチームへ入った人にも設定できるようにするため）
  const users = new Map<string, Omit<EventPeriodUser, "period">>();
  for (const user of event.event_users_snapshot) {
    if (user.team_id !== null) {
      users.set(user.user_id, {
        userId: user.user_id,
        name: user.name ?? "名前不明",
        teamId: user.team_id,
      });
    }
  }

  if (teamIds.length > 0) {
    const { data: currentUsers, error: usersError } = await supabase
      .from("user_teams_view")
      .select("user_id, user_name, team_id")
      .in("team_id", teamIds)
      .is("archived_at", null);

    if (usersError) {
      console.error("query error users", usersError);
      throw usersError;
    }

    for (const user of currentUsers) {
      if (user.user_id && user.team_id !== null && !users.has(user.user_id)) {
        users.set(user.user_id, {
          userId: user.user_id,
          name: user.user_name ?? "名前不明",
          teamId: user.team_id,
        });
      }
    }
  }

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

  return {
    teams,
    users: [...users.values()]
      .map((user) => ({
        ...user,
        period: periodByUser.get(user.userId) ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja")),
  };
}

// 選んだユーザーに、同じ入力期間を設定する（すでに設定があれば上書き）
export async function setEventUserPeriods({
  eventId,
  userIds,
  startDate,
  endDate,
}: {
  eventId: number;
  userIds: string[];
  startDate: string;
  endDate: string;
}): Promise<{ failure: string } | void> {
  await requireAdmin();

  if (userIds.length === 0) {
    return { failure: "ユーザーを選んでください" };
  }
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    return { failure: "開始日と終了日を入力してください" };
  }
  if (startDate > endDate) {
    return { failure: "終了日は、開始日と同じか後の日にしてください" };
  }

  const supabase = await createAdminClient({ schema: "public" });

  const { error } = await supabase.from("event_user_periods").upsert(
    userIds.map((userId) => ({
      event_id: eventId,
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
    })),
    { onConflict: "event_id,user_id" }
  );

  if (error) {
    console.error("upsert error event_user_periods", error);
    throw error;
  }
}

// 選んだユーザーの期間の設定を外す（イベントの開催期間中ずっと入力できる状態に戻す）
export async function clearEventUserPeriods({
  eventId,
  userIds,
}: {
  eventId: number;
  userIds: string[];
}): Promise<{ failure: string } | void> {
  await requireAdmin();

  if (userIds.length === 0) {
    return { failure: "ユーザーを選んでください" };
  }

  const supabase = await createAdminClient({ schema: "public" });

  const { error } = await supabase
    .from("event_user_periods")
    .delete()
    .eq("event_id", eventId)
    .in("user_id", userIds);

  if (error) {
    console.error("delete error event_user_periods", error);
    throw error;
  }
}
