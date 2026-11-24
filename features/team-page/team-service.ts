"use server";

import { createAdminClient, createClient } from "@/features/supabase/server";
import { requireAdmin } from "../helpers/require-admin";
import { Team } from "../user-page/type";

/**
 * 現在進行中のイベント、イベントカテゴリ、アクション
 */
export async function getTeam({ teamId }: { teamId: number }) {
  const supabase = await createClient();

  const { error, data: team } = await supabase
    .from("teams")
    .select(
      `
        id,
        name
      `
    )
    .match({
      id: teamId,
    })
    .maybeSingle();

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return team;
}

export async function getTeams({
  page = 1,
  pageSize = 10,
  searchTerm,
  archived = false,
}: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  // true ならアーカイブ中のチームだけ、false なら利用中のチームだけを返す
  archived?: boolean;
}): Promise<{
  teams: Team[];
  count: number;
}> {
  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // orが複数テーブルをまたがって使えないのでview化した
  // https://github.com/orgs/supabase/discussions/28026
  let baseQuery = supabase
    .from("teams")
    .select(
      `
      id,
      name,
      created_at
      `,
      { count: "exact" }
    )
    .order("id")
    .range(from, to);

  baseQuery = archived
    ? baseQuery.not("archived_at", "is", null)
    : baseQuery.is("archived_at", null);

  if (searchTerm) {
    baseQuery = baseQuery.ilike("name", `%${searchTerm}%`);
  }

  const { data, error, count } = await baseQuery;

  if (error) {
    console.error("query error users", error);
    throw error;
  }

  return {
    teams: data,
    count: count ?? 0,
  };
}

export async function createTeam(data: { name: string }) {
  const supabase = await createClient();

  const { error } = await supabase.from("teams").insert([data]);

  if (error) {
    console.error("create error", error);
    throw error;
  }
}

export async function updateTeam(data: { teamId: number; name: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teams")
    .update({
      name: data.name,
    })
    .match({
      id: data.teamId,
    });

  if (error) {
    console.error("update error", error);
    throw error;
  }
}

// 計画中のイベントの id を返す（公開前なので、対象チームなどを外しても記録に影響しない）
async function getPlanningEventIds(
  supabase: Awaited<ReturnType<typeof createAdminClient<"public">>>
) {
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("status", "planning");

  if (error) {
    console.error("query error events", error);
    throw error;
  }

  return data.map((event) => event.id);
}

// チームをアーカイブする。一覧や選択肢から外れ、計画中のイベントの対象からも外れる。
// 公開済みのイベントと、その記録・集計には影響しない
export async function archiveTeam(
  teamId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const planningEventIds = await getPlanningEventIds(supabase);
  if (planningEventIds.length > 0) {
    const { error } = await supabase
      .from("event_teams")
      .delete()
      .eq("team_id", teamId)
      .in("event_id", planningEventIds);

    if (error) {
      console.error("delete error event_teams", error);
      throw error;
    }
  }

  const { error } = await supabase
    .from("teams")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", teamId);

  if (error) {
    console.error("archive error teams", error);
    throw error;
  }
}

// アーカイブしたチームを元に戻す
export async function restoreTeam(
  teamId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { error } = await supabase
    .from("teams")
    .update({ archived_at: null })
    .eq("id", teamId);

  if (error) {
    console.error("restore error teams", error);
    throw error;
  }
}

// チームを削除する。公開済みのイベントで使われたチームは、記録や集計が
// チームを参照しているため削除できない（アーカイブを案内する）
export async function deleteTeam(
  teamId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const planningEventIds = await getPlanningEventIds(supabase);

  const { data: eventTeams, error: eventTeamsError } = await supabase
    .from("event_teams")
    .select("event_id")
    .eq("team_id", teamId);

  if (eventTeamsError) {
    console.error("query error event_teams", eventTeamsError);
    throw eventTeamsError;
  }

  const { count: recordCount, error: recordsError } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("snapshot_team_id", teamId);

  if (recordsError) {
    console.error("count error records", recordsError);
    throw recordsError;
  }

  const isUsedInPublishedEvent = eventTeams.some(
    (eventTeam) => !planningEventIds.includes(eventTeam.event_id)
  );

  if (isUsedInPublishedEvent || (recordCount ?? 0) > 0) {
    return {
      failure:
        "公開済みのイベントで使われているため削除できません。使わなくなったチームはアーカイブしてください。",
    };
  }

  // 計画中のイベントの対象から外す
  const { error: deleteEventTeamsError } = await supabase
    .from("event_teams")
    .delete()
    .eq("team_id", teamId);

  if (deleteEventTeamsError) {
    console.error("delete error event_teams", deleteEventTeamsError);
    throw deleteEventTeamsError;
  }

  // 所属していたユーザーは「所属なし」にする
  const nextAuth = await createAdminClient({ schema: "next_auth" });
  const { error: usersError } = await nextAuth
    .from("users")
    .update({ team_id: null })
    .eq("team_id", teamId);

  if (usersError) {
    console.error("update error users", usersError);
    throw usersError;
  }

  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) {
    console.error("delete error teams", error);
    throw error;
  }
}
