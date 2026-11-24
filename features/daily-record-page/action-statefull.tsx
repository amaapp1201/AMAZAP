"use client";
import { useAtom, useAtomValue } from "jotai";
import {
  actionAchievementFamily,
  enableActionAtom,
} from "./daily-record-state";
import { Action } from "../ui/action";

export function ActionStatefull({
  action,
}: {
  action: {
    id: number;
    name: string;
    point: number;
  };
}) {
  const canAction = useAtomValue(enableActionAtom);

  const [actionAchievement, setActionAchievement] = useAtom(
    actionAchievementFamily(action.id)
  );

  return (
    <Action
      action={action}
      onClick={() =>
        setActionAchievement((prev) => ({
          ...prev,
          isActive: !prev.isActive,
        }))
      }
      isCheckVisible={actionAchievement.isActive}
      canActive={canAction}
    />
  );
}
