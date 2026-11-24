"use server";

import { createAdminClient, createClient } from "@/features/supabase/server";
import { omitUndefinedCondition } from "../helpers/match-condition";
import bcrypt from "bcrypt";

// supabaseのauth userの作成とともに、usersテーブルにもデータを作成する
export async function createUser({
  name,
  teamId,
  password,
  isAdmin,
}: {
  name: string;
  teamId: number | null;
  password: string;
  isAdmin: boolean;
}) {
  const supabase = await createAdminClient({
    schema: "next_auth",
  });

  // すでに同じ名前のユーザーがいないか確認
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id")
    .match({
      name,
    });

  if (userError) {
    console.error("query error users", userError);
    throw userError;
  }

  if (users.length > 0) {
    return {
      failure: "同じ名前のユーザーがすでに存在します",
    };
  }

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  // auth userの作成
  const { error } = await supabase.from("users").insert({
    password: hashedPassword,
    team_id: teamId,
    name,
    is_admin: isAdmin,
  });

  if (error) {
    console.error("auth create error", error);
    throw error;
  }
}

export async function getUsers({
  page = 1,
  pageSize = 10,
  searchTerm,
  matchCondition,
}: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  matchCondition?: { team_id?: number | null };
}) {
  const supabase = await createClient();

  const filteredMatchCondition = omitUndefinedCondition(matchCondition ?? {});
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // orが複数テーブルをまたがって使えないのでview化した
  // https://github.com/orgs/supabase/discussions/28026
  let baseQuery = supabase
    .from("user_teams_view")
    .select(
      `
      user_id,
      user_name,
      is_admin,
      team_id,
      team_name
      `,
      { count: "exact" }
    )
    .match(filteredMatchCondition)
    .range(from, to);

  if (searchTerm) {
    baseQuery = baseQuery.or(
      `user_name.ilike.%${searchTerm}%,team_name.ilike.%${searchTerm}%`
    );
  }

  const { data, error, count } = await baseQuery;

  if (error) {
    console.error("query error users", error);
    throw error;
  }

  return {
    users: data,
    count: count ?? 0,
  };
}

// まずは event_users_snapshotを見に行き、なければuser_teams_viewを見に行く
export async function getEventUsers({
  eventId,
  teamId,
}: {
  eventId: number;
  teamId: number;
}): Promise<
  {
    user_id: string;
    user_name: string;
    team_id: number;
    team_name: string;
  }[]
> {
  const supabase = await createClient();

  const { data: eventTeamsSnapshot, error: eventTeamsError } = await supabase
    .from("event_teams")
    .select(
      `
    event_id,
    team_id,
    name_snapshot,
    event_users_snapshot (
      user_id,
      name
    )
  `
    )
    .match({
      event_id: eventId,
      team_id: teamId,
    })
    .maybeSingle();

  if (eventTeamsError) {
    console.error("query error users", eventTeamsError);
    throw eventTeamsError;
  }

  if (
    eventTeamsSnapshot &&
    eventTeamsSnapshot.event_users_snapshot.length > 0
  ) {
    return eventTeamsSnapshot.event_users_snapshot.map((user) => ({
      user_id: user.user_id,
      user_name: user.name ?? "名前不明",
      team_id: eventTeamsSnapshot.team_id,
      team_name: eventTeamsSnapshot.name_snapshot ?? "名称不明",
    }));
  }

  const { data: users, error } = await supabase
    .from("user_teams_view")
    .select(
      `
    user_id,
    user_name,
    team_id,
    team_name
  `
    )
    .match({
      team_id: teamId,
    });

  if (error) {
    console.error("query error users", error);
    throw error;
  }

  return users.map((user) => ({
    user_id: user.user_id ?? "0",
    user_name: user.user_name ?? "名称不明",
    team_id: user.team_id ?? 0,
    team_name: user.team_name ?? "名称不明",
  }));
}

export async function getTeamUsers(teamId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_teams_view")
    .select(
      `
      user_id,
      user_name,
      is_admin,
      team_id,
      team_name
      `
    )
    .match({
      team_id: teamId,
    });

  if (error) {
    console.error("query error users", error);
    throw error;
  }

  return data;
}

export async function updateUser(data: {
  userId: string;
  name: string;
  teamId?: number | null;
  isAdmin: boolean;
}) {
  const supabase = await createAdminClient({
    schema: "next_auth",
  });

  const { error } = await supabase
    .from("users")
    .update({
      name: data.name,
      team_id: data.teamId,
      is_admin: data.isAdmin,
    })
    .match({ id: data.userId });

  if (error) {
    console.error("update error", error);
    throw error;
  }
}

export async function updateUserPassword(data: {
  userId: string;
  password: string;
}) {
  const supabase = await createAdminClient({
    schema: "next_auth",
  });
  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const { error } = await supabase
    .from("users")
    .update({
      password: hashedPassword,
    })
    .match({ id: data.userId });

  if (error) {
    console.error("update password error", error);
    throw error;
  }
}
