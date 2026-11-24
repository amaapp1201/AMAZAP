"use server";

import { createAdminClient, createClient } from "../supabase/server";
import { requireAdmin } from "../helpers/require-admin";
import { Category } from "./type";

// archived が true ならアーカイブ中のカテゴリだけ、false なら利用中のカテゴリだけを返す
export async function getCategories(
  args: { archived?: boolean } = {}
): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from("action_categories")
    .select("*")
    .order("order_id", { ascending: true });

  query = args.archived
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);

  const { error, data: categories } = await query;

  if (error) {
    console.error("query error category", error);
    throw error;
  }

  return categories ?? [];
}

export async function createNewCategory(createDto: {
  name: string;
  isSingleSelection: boolean;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("action_categories").insert([
    {
      name: createDto.name,
      is_single_selection: createDto.isSingleSelection,
    },
  ]);

  if (error) {
    console.error("create error", error);
    throw error;
  }
}

export async function updateCategory(updateDto: {
  id: number;
  name: string;
  isSingleSelection: boolean;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("action_categories")
    .update({
      name: updateDto.name,
      is_single_selection: updateDto.isSingleSelection,
    })
    .match({ id: updateDto.id });

  if (error) {
    console.error("update error", error);
    throw error;
  }
}

export async function updateCategoryOrders(
  dto: { id: number; order_id: number }[]
): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("bulk_update_action_categories", {
    updates: dto,
  });
  if (error) {
    console.error("update error", error);
    throw error;
  }
}

// カテゴリをアーカイブする。中のアクションごと一覧や選択肢から外れ、
// 計画中のイベントの対象からも外れる。公開済みのイベントと記録には影響しない
export async function archiveCategory(
  categoryId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data: planningEvents, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .eq("status", "planning");

  if (eventsError) {
    console.error("query error events", eventsError);
    throw eventsError;
  }

  if (planningEvents.length > 0) {
    const { error } = await supabase
      .from("event_categories")
      .delete()
      .eq("category_id", categoryId)
      .in(
        "event_id",
        planningEvents.map((event) => event.id)
      );

    if (error) {
      console.error("delete error event_categories", error);
      throw error;
    }
  }

  const { error } = await supabase
    .from("action_categories")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", categoryId);

  if (error) {
    console.error("archive error action_categories", error);
    throw error;
  }
}

// アーカイブしたカテゴリを元に戻す
export async function restoreCategory(
  categoryId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { error } = await supabase
    .from("action_categories")
    .update({ archived_at: null })
    .eq("id", categoryId);

  if (error) {
    console.error("restore error action_categories", error);
    throw error;
  }
}

// カテゴリを、中のアクションごと削除する。公開済みのイベントで使われたものは、
// 記録や集計が参照しているため削除できない（アーカイブを案内する）
export async function deleteCategory(
  categoryId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const failure = {
    failure:
      "公開済みのイベントで使われているため削除できません。使わなくなったカテゴリはアーカイブしてください。",
  };

  const { count: snapshotCount, error: snapshotError } = await supabase
    .from("event_actions_snapshot")
    .select("action_id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (snapshotError) {
    console.error("count error event_actions_snapshot", snapshotError);
    throw snapshotError;
  }

  if ((snapshotCount ?? 0) > 0) {
    return failure;
  }

  const { data: eventCategories, error: eventCategoriesError } = await supabase
    .from("event_categories")
    .select("event_id, events ( status )")
    .eq("category_id", categoryId);

  if (eventCategoriesError) {
    console.error("query error event_categories", eventCategoriesError);
    throw eventCategoriesError;
  }

  if (
    eventCategories.some(
      (eventCategory) => eventCategory.events?.status !== "planning"
    )
  ) {
    return failure;
  }

  const { data: actions, error: actionsError } = await supabase
    .from("actions")
    .select("id")
    .eq("category_id", categoryId);

  if (actionsError) {
    console.error("query error actions", actionsError);
    throw actionsError;
  }

  const actionIds = actions.map((action) => action.id);

  if (actionIds.length > 0) {
    // 以前ほかのカテゴリに入っていたアクションが、公開済みのイベントで使われていることがある
    const { count: usedSnapshotCount, error: usedSnapshotError } =
      await supabase
        .from("event_actions_snapshot")
        .select("action_id", { count: "exact", head: true })
        .in("action_id", actionIds);

    if (usedSnapshotError) {
      console.error("count error event_actions_snapshot", usedSnapshotError);
      throw usedSnapshotError;
    }

    const { count: usedRecordCount, error: usedRecordError } = await supabase
      .from("record_actions")
      .select("action_id", { count: "exact", head: true })
      .in("action_id", actionIds);

    if (usedRecordError) {
      console.error("count error record_actions", usedRecordError);
      throw usedRecordError;
    }

    if ((usedSnapshotCount ?? 0) > 0 || (usedRecordCount ?? 0) > 0) {
      return {
        failure:
          "このカテゴリの中に、公開済みのイベントで使われたアクションがあるため削除できません。カテゴリをアーカイブしてください。",
      };
    }
  }

  // 計画中のイベントの対象から外す
  const { error: deleteEventCategoriesError } = await supabase
    .from("event_categories")
    .delete()
    .eq("category_id", categoryId);

  if (deleteEventCategoriesError) {
    console.error("delete error event_categories", deleteEventCategoriesError);
    throw deleteEventCategoriesError;
  }

  const { error: deleteActionsError } = await supabase
    .from("actions")
    .delete()
    .eq("category_id", categoryId);

  if (deleteActionsError) {
    console.error("delete error actions", deleteActionsError);
    throw deleteActionsError;
  }

  const { error } = await supabase
    .from("action_categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("delete error action_categories", error);
    throw error;
  }
}
