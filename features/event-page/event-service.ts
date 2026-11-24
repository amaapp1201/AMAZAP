"use server";

import { createAdminClient, createClient } from "@/features/supabase/server";
import {
  CreateRequestEventSchemaType,
  UpdateRequestEventSchemaType,
} from "./schema";
import { Event, PublishedEvent } from "../daily-record-page/types";
import { requireAdmin } from "../helpers/require-admin";

const EVENT_SQL = `
id,
name,
startAt,
endAt,
is_team_rank_visible,
is_user_rank_visible,
event_categories (
  category_id,
  event_id,
  action_categories (
    id,
    name,
    order_id,
    is_single_selection,
    actions (
      id,
      name,
      point,
      order_id,
      archived_at
    )
  )
),
event_teams (
  team_id,
  event_id,
  teams (
    id,
    name
  )
)
` as const;

const PUBLISHED_EVENT_SQL = `
id,
name,
startAt,
endAt,
is_team_rank_visible,
is_user_rank_visible,
event_categories (
  category_id,
  event_id,
  name_snapshot,
  order_id_snapshot,
  is_single_selection_snapshot,
  event_actions_snapshot (
    action_id,
    event_id,
    name,
    category_id,
    point,
    order_id
  )
),
event_teams (
  team_id,
  event_id,
  name_snapshot
)
` as const;

// 公開前のイベントは最新のアクションをそのまま表示するので、アーカイブ中のものを除く
function omitArchivedActions<
  T extends {
    event_categories: {
      action_categories: { actions: { archived_at: string | null }[] } | null;
    }[];
  }
>(event: T): T {
  return {
    ...event,
    event_categories: event.event_categories.map((eventCategory) => ({
      ...eventCategory,
      action_categories: eventCategory.action_categories
        ? {
            ...eventCategory.action_categories,
            actions: eventCategory.action_categories.actions.filter(
              (action) => !action.archived_at
            ),
          }
        : null,
    })),
  };
}

export async function getSimpleEvent(eventId: number) {
  const supabase = await createClient();

  const { error, data: event } = await supabase
    .from("events")
    .select("*")
    .match({
      id: eventId,
    })
    .maybeSingle();

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return event;
}

export async function getEvent(eventId: number): Promise<Event | null> {
  const supabase = await createClient();
  const { error, data: currentEvent } = await supabase
    .from("events")
    .select(EVENT_SQL)
    .match({
      id: eventId,
    })
    .maybeSingle();

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return currentEvent ? omitArchivedActions(currentEvent) : null;
}

/**
 * 現在進行中のイベント、イベントカテゴリ、アクション
 */
export async function getCurrentEvent(): Promise<PublishedEvent | null> {
  const supabase = await createClient();

  const { error, data: currentEvent } = await supabase
    .from("events")
    .select(PUBLISHED_EVENT_SQL)
    .match({
      status: "active",
    })
    .maybeSingle();

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return currentEvent;
}

export async function getPastEvents(
  eventIds?: number[]
): Promise<PublishedEvent[]> {
  const supabase = await createClient();

  const { error, data: currentEvent } = await supabase
    .from("events")
    .select(PUBLISHED_EVENT_SQL)
    .match(
      eventIds
        ? {
            status: "done",
            id: eventIds,
          }
        : {
            status: "done",
          }
    );

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return currentEvent;
}

export async function getPlanningEvents(): Promise<Event[]> {
  const supabase = await createClient();

  const { error, data: currentEvent } = await supabase
    .from("events")
    .select(EVENT_SQL)
    .match({
      status: "planning",
    });

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return currentEvent.map(omitArchivedActions);
}

export async function createEvent(args: CreateRequestEventSchemaType): Promise<{
  eventId: number;
}> {
  console.debug("createEvent", args);

  const supabase = await createClient();

  const { eventName, startAt, endAt, categoryIds, teamIds } = args;

  const { error, data: newEvent } = await supabase
    .from("events")
    .insert([
      {
        name: eventName,
        startAt: startAt,
        endAt: endAt,
        status: "planning",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("insert error event", error);
    throw error;
  }

  const eventId = newEvent.id;

  const categoryInserts = categoryIds.map((category_id) => ({
    event_id: eventId,
    category_id: category_id,
  }));

  const teamInserts = teamIds.map((teamId) => ({
    event_id: eventId,
    team_id: teamId,
  }));

  if (categoryInserts.length > 0) {
    const { error: categoryError } = await supabase
      .from("event_categories")
      .insert(categoryInserts);

    if (categoryError) {
      console.error("insert error event_categories", categoryError);
      throw categoryError;
    }
  }

  if (teamInserts.length > 0) {
    const { error: teamError } = await supabase
      .from("event_teams")
      .insert(teamInserts);

    if (teamError) {
      console.error("insert error event_teams", teamError);
      throw teamError;
    }
  }

  return {
    eventId: newEvent.id,
  };
}

export async function archiveEvent(eventId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      status: "done",
    })
    .match({
      id: eventId,
    });

  if (error) {
    console.error("update error event", error);
    throw error;
  }
}

export async function updateEvent({
  eventName,
  startAt,
  endAt,
  categoryIds,
  teamIds,
  id,
}: UpdateRequestEventSchemaType): Promise<{
  eventId: number;
}> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      name: eventName,
      startAt: startAt,
      endAt: endAt,
    })
    .match({
      id: id,
    });

  if (error) {
    console.error("insert error event", error);
    throw error;
  }

  const eventId = id;

  if (categoryIds) {
    const categoryInserts = categoryIds.map((category_id) => ({
      event_id: eventId,
      category_id: category_id,
    }));

    const { error: categoryDeleteError } = await supabase
      .from("event_categories")
      .delete()
      .match({ event_id: eventId });

    if (categoryDeleteError) {
      console.error("delete error event_categories", categoryDeleteError);
      throw categoryDeleteError;
    }

    if (categoryInserts.length > 0) {
      const { error: categoryDeleteError } = await supabase
        .from("event_categories")
        .delete()
        .match({ event_id: eventId });

      if (categoryDeleteError) {
        console.error("delete error event_categories", categoryDeleteError);
        throw categoryDeleteError;
      }

      const { error: categoryError } = await supabase
        .from("event_categories")
        .insert(categoryInserts);

      if (categoryError) {
        console.error("insert error event_categories", categoryError);
        throw categoryError;
      }
    }
  }

  if (teamIds) {
    const teamInserts = teamIds.map((teamId) => ({
      event_id: eventId,
      team_id: teamId,
    }));

    const { error: teamDeleteError } = await supabase
      .from("event_teams")
      .delete()
      .match({ event_id: eventId });

    if (teamDeleteError) {
      console.error("delete error event_teams", teamDeleteError);
      throw teamDeleteError;
    }

    if (teamInserts.length > 0) {
      const { error: categoryDeleteError } = await supabase
        .from("event_teams")
        .delete()
        .match({ event_id: eventId });

      if (categoryDeleteError) {
        console.error("delete error event_teams", categoryDeleteError);
        throw categoryDeleteError;
      }

      const { error: teamError } = await supabase
        .from("event_teams")
        .insert(teamInserts);

      if (teamError) {
        console.error("insert error event_teams", teamError);
        throw teamError;
      }
    }
  }

  return {
    eventId,
  };
}

export async function publishEvent(eventId: number) {
  const supabase = await createAdminClient({
    schema: "public",
  });

  // 現在公開中のイベントがあればエラー
  const { data: currentEvent, error: currentEventError } = await supabase
    .from("events")
    .select("id")
    .match({
      status: "active",
    })
    .maybeSingle();

  if (currentEventError) {
    console.error("query error event", currentEventError);
    throw currentEventError;
  }

  if (currentEvent) {
    throw new Error("既に公開中のイベントがあります");
  }

  const { error: eventStatusUpdateError } = await supabase
    .from("events")
    .update({
      status: "active",
    })
    .match({
      id: eventId,
    });

  if (eventStatusUpdateError) {
    console.error("update error event", eventStatusUpdateError);
    throw eventStatusUpdateError;
  } else {
    console.log("Event status updated successfully:", eventId);
  }

  // event_categoriesのname_snapshotを更新
  const { error: updateEventCategorySnapshotError } = await supabase.rpc(
    "update_event_category_snapshot",
    {
      p_event_id: eventId,
    }
  );

  if (updateEventCategorySnapshotError) {
    console.error(
      "Error updating event category snapshot:",
      updateEventCategorySnapshotError
    );
  } else {
    console.log("Event category snapshot updated successfully:", eventId);
  }

  // event_actions_snapshotを挿入
  const { error: insertEventActionsSnapshotError } = await supabase.rpc(
    "insert_event_actions_snapshot",
    {
      p_event_id: eventId,
    }
  );

  if (insertEventActionsSnapshotError) {
    console.error(
      "Error inserting event actions snapshot:",
      insertEventActionsSnapshotError
    );
  } else {
    console.log("Event actions snapshot inserted successfully:", eventId);
  }

  // event_teamsのname_snapshotを更新
  const { error: updateEventTeamsSnapshotError } = await supabase.rpc(
    "update_event_teams_snapshot",
    {
      p_event_id: eventId,
    }
  );

  if (updateEventTeamsSnapshotError) {
    console.error(
      "Error updating event teams snapshot:",
      updateEventTeamsSnapshotError
    );
  } else {
    console.log("Event teams snapshot updated successfully:", eventId);
  }

  // event_users_snapshotを挿入
  const { error: inesrtEventUsersSnapshotError } = await supabase.rpc(
    "insert_event_users_snapshot",
    {
      p_event_id: eventId,
    }
  );

  if (inesrtEventUsersSnapshotError) {
    console.error(
      "Error inserting event users snapshot:",
      inesrtEventUsersSnapshotError
    );
  } else {
    console.log("Event users snapshot inserted successfully:", eventId);
  }
}

export async function updateRankVisible(data: {
  eventId: number;
  isTeamRankVisible?: boolean;
  isUserRankVisible?: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      is_team_rank_visible: data.isTeamRankVisible,
      is_user_rank_visible: data.isUserRankVisible,
    })
    .match({
      id: data.eventId,
    });

  if (error) {
    console.error("update error event", error);
    throw error;
  }
}

export async function copyEvent(eventId: number) {
  const supabase = await createClient();

  const { error, data: event } = await supabase
    .from("events")
    .select(EVENT_SQL)
    .match({
      id: eventId,
    })
    .single();

  if (error) {
    console.error("query error event", error);
    throw error;
  }

  return createEvent({
    eventName: event.name,
    startAt: null,
    endAt: null,
    categoryIds: event.event_categories.map((category) => category.category_id),
    teamIds: event.event_teams.map((team) => team.team_id),
  });
}

// 削除の確認画面に出すため、イベントに紐づく記録の件数を返す
export async function getEventRecordCount(eventId: number) {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { count, error } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    console.error("count error records", error);
    throw error;
  }

  return count ?? 0;
}

// イベントを、参加者の記録ごと削除する。
// 外部キーで参照している側から順に消す。途中で失敗してもイベント自体は残るため、
// もう一度実行すれば続きから削除できる
export async function deleteEvent(
  eventId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data: records, error: recordsError } = await supabase
    .from("records")
    .select("id")
    .eq("event_id", eventId);

  if (recordsError) {
    console.error("query error records", recordsError);
    throw recordsError;
  }

  // 件数が多いと URL が長くなりすぎるので、分割して消す
  const recordIds = records.map((record) => record.id);
  const chunkSize = 200;
  for (let i = 0; i < recordIds.length; i += chunkSize) {
    const { error } = await supabase
      .from("record_actions")
      .delete()
      .in("record_id", recordIds.slice(i, i + chunkSize));

    if (error) {
      console.error("delete error record_actions", error);
      throw error;
    }
  }

  // event_actions_snapshot は event_categories を、event_users_snapshot は event_teams を参照している
  const tables = [
    "records",
    "event_users_snapshot",
    "event_actions_snapshot",
    "event_categories",
    "event_teams",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("event_id", eventId);

    if (error) {
      console.error(`delete error ${table}`, error);
      throw error;
    }
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    console.error("delete error events", error);
    throw error;
  }
}
