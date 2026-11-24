"use client";

import { Plate } from "@/features/ui/plate";
import { ActionStatefull } from "./action-statefull";

export function Category({
  eventCategory,
}: {
  eventCategory: {
    name: string;
    actions: {
      id: number;
      name: string;
      point: number;
    }[];
    isSingleSelection: boolean;
  };
}) {
  const actions = eventCategory.actions;

  if (actions.length <= 0)
    return <div>このカテゴリにはアクションが登録されていません。</div>;
  return (
    <Plate>
      <h3 className="font-bold">
        {eventCategory.name}
        {eventCategory.isSingleSelection && <span>(１つのみ選択可能)</span>}
      </h3>
      {actions.map((action) => (
        <ActionStatefull key={action.id} action={action}></ActionStatefull>
      ))}
    </Plate>
  );
}
