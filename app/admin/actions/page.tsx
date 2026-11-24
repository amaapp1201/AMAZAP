import { ActionHome } from "@/features/action-page/action-home";
import {
  createNewAction,
  updateAction,
  updateActionOrders,
  getActions,
} from "@/features/action-page/action-service";
import {
  updateCategory,
  updateCategoryOrders,
  createNewCategory,
  getCategories,
} from "@/features/action-page/category-service";

export default async function Page() {
  const categories = await getCategories();
  const archivedCategories = await getCategories({ archived: true });

  const actions = await getActions();
  const archivedActions = await getActions({ archived: true });

  // アーカイブ中のカテゴリに入っているアクションは、カテゴリごと隠す
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const categoryNames = new Map(
    [...categories, ...archivedCategories].map((category) => [
      category.id,
      category.name,
    ])
  );

  return (
    <ActionHome
      categories={categories.map((category) => ({
        ...category,
        isSingleSelection: category.is_single_selection,
      }))}
      actions={actions.filter((action) =>
        activeCategoryIds.has(action.category_id)
      )}
      archivedCategories={archivedCategories}
      archivedActions={archivedActions.map((action) => ({
        id: action.id,
        name: action.name,
        point: action.point,
        categoryName: categoryNames.get(action.category_id) ?? "名称不明",
      }))}
      createNewAction={createNewAction}
      updateAction={updateAction}
      updateCategory={updateCategory}
      updateCategoryOrders={updateCategoryOrders}
      updateActionOrders={updateActionOrders}
      createNewCategory={createNewCategory}
    ></ActionHome>
  );
}
