"use server";

import { createAdminClient, createClient } from "../supabase/server";
import { requireAdmin } from "../helpers/require-admin";

// archived が true ならアーカイブ中のアクションだけ、false なら利用中のアクションだけを返す
export async function getActions(args: { archived?: boolean } = {}) {
  const supabase = await createClient();

  let query = supabase.from("actions").select("*").order("order_id");

  query = args.archived
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);

  const { error, data: actions } = await query;

  if (error) {
    console.error("query error actions", error);
    throw error;
  }

  return actions;
}

export async function createNewAction(createDto: {
  name: string;
  point: number;
  category_id: number;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("actions").insert([
    {
      name: createDto.name,
      point: createDto.point,
      category_id: createDto.category_id,
    },
  ]);

  if (error) {
    console.error("create error", error);
    throw error;
  }
}

export async function updateAction(updateDto: {
  id: number;
  name: string;
  point: number;
  category_id: number;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("actions")
    .update({
      name: updateDto.name,
      point: updateDto.point,
      category_id: updateDto.category_id,
    })
    .match({ id: updateDto.id });

  if (error) {
    console.error("update error", error);
    throw error;
  }
}

// アクションをアーカイブする。一覧から外れ、これから公開するイベントにも入らなくなる。
// 公開済みのイベントと記録には影響しない
export async function archiveAction(
  actionId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { error } = await supabase
    .from("actions")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", actionId);

  if (error) {
    console.error("archive error actions", error);
    throw error;
  }
}

// アーカイブしたアクションを元に戻す
export async function restoreAction(
  actionId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id, action_categories ( name, archived_at )")
    .eq("id", actionId)
    .maybeSingle();

  if (actionError) {
    console.error("query error actions", actionError);
    throw actionError;
  }

  if (!action) {
    return { failure: "アクションが見つかりませんでした" };
  }

  // カテゴリがアーカイブ中のままだと、戻しても一覧に出てこない
  if (action.action_categories?.archived_at) {
    return {
      failure: `カテゴリ「${action.action_categories.name}」がアーカイブ中です。先にカテゴリを元に戻してください。`,
    };
  }

  const { error } = await supabase
    .from("actions")
    .update({ archived_at: null })
    .eq("id", actionId);

  if (error) {
    console.error("restore error actions", error);
    throw error;
  }
}

// アクションを削除する。公開済みのイベントで使われたものは、
// 記録や集計が参照しているため削除できない（アーカイブを案内する）
export async function deleteAction(
  actionId: number
): Promise<{ failure: string } | void> {
  await requireAdmin();

  const supabase = await createAdminClient({ schema: "public" });

  const { count: snapshotCount, error: snapshotError } = await supabase
    .from("event_actions_snapshot")
    .select("action_id", { count: "exact", head: true })
    .eq("action_id", actionId);

  if (snapshotError) {
    console.error("count error event_actions_snapshot", snapshotError);
    throw snapshotError;
  }

  const { count: recordCount, error: recordError } = await supabase
    .from("record_actions")
    .select("action_id", { count: "exact", head: true })
    .eq("action_id", actionId);

  if (recordError) {
    console.error("count error record_actions", recordError);
    throw recordError;
  }

  if ((snapshotCount ?? 0) > 0 || (recordCount ?? 0) > 0) {
    return {
      failure:
        "公開済みのイベントで使われているため削除できません。使わなくなったアクションはアーカイブしてください。",
    };
  }

  const { error } = await supabase.from("actions").delete().eq("id", actionId);

  if (error) {
    console.error("delete error actions", error);
    throw error;
  }
}

export async function getCategories() {
  const supabase = await createClient();

  const { error, data: categories } = await supabase
    .from("action_categories")
    .select("*")
    .is("archived_at", null)
    .order("order_id");

  if (error) {
    console.error("query error categories", error);
    throw error;
  }

  return categories;
}

export async function updateActionOrders(
  dto: { category_id: number; id: number; order_id: number }[]
): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("bulk_update_actions", {
    updates: dto,
  });

  if (error) {
    console.error("Error updating actions:", error);
  } else {
    console.log("Actions updated successfully:", data);
  }
}
