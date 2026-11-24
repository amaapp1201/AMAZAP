"use server";

import { createClient } from "../supabase/server";
import { Category } from "./type";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { error, data: categories } = await supabase
    .from("action_categories")
    .select("*")
    .order("order_id", { ascending: true });

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
