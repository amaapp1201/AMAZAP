"use server";

import { createClient } from "@/features/supabase/server";
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
}: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
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
    .range(from, to);

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
