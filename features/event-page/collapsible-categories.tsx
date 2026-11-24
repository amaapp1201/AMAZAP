import { useMemo } from "react";
import { Collapsible } from "./collapsible";
import { LockIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function CollapsibleCategories({
  isDefaultShow,
  categories,
  isLocked = false,
}: {
  isDefaultShow: boolean;
  categories: {
    id: number;
    name: string;
    orderId: number;
    actions: {
      id: number;
      name: string;
      point: number;
      orderId: number;
    }[];
  }[];
  isLocked?: boolean;
}) {
  const sorted = useMemo(
    () => categories.sort((a, b) => a.orderId - b.orderId),
    [categories]
  );
  return (
    <Collapsible title="カテゴリ詳細" isDefaultShow={isDefaultShow}>
      <div className="flex flex-col space-y-3">
        {categories.length <= 0 && <div>カテゴリが設定されていません</div>}
        {sorted.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className="p-4 border rounded-lg bg-gray-50 flex flex-col space-y-3"
          >
            <div className="font-medium text-gray-700e leading-none flex items-center">
              {isLocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <LockIcon className="mr-1 h-4 w-4 stroke-slate-500"></LockIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>公開後カテゴリは編集できません</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {category.name}
            </div>
            {category.actions.map((action, actionIndex) => (
              <div
                key={action.id}
                className={"flex items-center space-x-1 border bg-white"}
              >
                <span className="pl-0.5 pr-2 italic flex items-baseline clip-diagonal bg-slate-200">
                  <span className="font-bold text-lg">{action.point}</span>
                  <span className="font-bold">pt</span>
                </span>
                <span>{action.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Collapsible>
  );
}
