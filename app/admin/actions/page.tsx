import { ActionHome } from "@/features/action-page/action-home";
import {
  archiveAction,
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
import { ScrollArea, ScrollBar } from "@/features/ui/scroll-area";

export default async function Page() {
  const categories = await getCategories();

  const actions = await getActions();

  return (
    <ActionHome
      archiveAction={archiveAction}
      categories={categories.map((category) => ({
        ...category,
        isSingleSelection: category.is_single_selection,
      }))}
      actions={actions}
      createNewAction={createNewAction}
      updateAction={updateAction}
      updateCategory={updateCategory}
      updateCategoryOrders={updateCategoryOrders}
      updateActionOrders={updateActionOrders}
      createNewCategory={createNewCategory}
    ></ActionHome>
  );
}
