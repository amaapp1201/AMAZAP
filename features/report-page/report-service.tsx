"use server";

import { createAdminClient, createClient } from "@/features/supabase/server";

/**
 * 現在進行中のイベント、イベントカテゴリ、アクション
 */
export async function getTeamReportByEventId({ eventId }: { eventId: number }) {
  const supabase = await createClient();

  //  イベントに参加しているチームごとに集計

  let { data, error } = await supabase.rpc("get_team_action_point_summary", {
    p_event_id: eventId,
  });

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return data;
}

export async function getUserReportByEventId({ eventId }: { eventId: number }) {
  const supabase = await createAdminClient({
    schema: "public",
  });

  //  イベントに参加しているチームごとに集計

  let { data, error } = await supabase.rpc("get_user_action_point_summary", {
    p_event_id: eventId,
  });

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return data;
}
