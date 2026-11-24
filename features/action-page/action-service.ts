"use server";

import { createClient } from "../supabase/server";

export async function getActions() {
  const supabase = await createClient();

  const { error, data: actions } = await supabase
    .from("actions")
    .select("*")
    .order("order_id");

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

export async function deleteAction(
  category_id: number,
  action_id: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("actions")
    .delete()
    .match({ id: action_id, category_id: category_id });

  if (error) {
    console.error("delete error", error);
    throw error;
  }
}

// アーカイブもカテゴリの一部。
const ARCHIVE_CATEGORY_ID = 5;

export async function archiveAction(action_id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("actions")
    .update({
      category_id: ARCHIVE_CATEGORY_ID,
    })
    .match({ id: action_id });

  if (error) {
    console.error("archive error", error);
    throw error;
  }
}

export async function getCategories() {
  const supabase = await createClient();

  const { error, data: categories } = await supabase
    .from("action_categories")
    .select("*")
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
