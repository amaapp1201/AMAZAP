"use client";

import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { atomEffect } from "jotai-effect";
import { UpdateDailyRecordParams } from "./daily-record-service";

type Action = {
  id: number;
  name: string;
  point: number;
  isActive: boolean;
  categoryId: number;
  onlyOneByCategory: boolean;
};

// アクション編集可能かどうか
export const enableActionAtom = atom(true);
enableActionAtom.debugLabel = "enableActionAtom";

export const actionsAtom = atom<Action[]>([]);
actionsAtom.debugLabel = "actionsAtom";

export const actionAchievementFamily = atomFamily(
  (action_id: number) =>
    atom(
      (get) => {
        const actions = get(actionsAtom);
        const item = actions.find((a) => a.id === action_id) ?? null;
        if (!item) {
          return {
            id: action_id,
            name: "",
            point: 0,
            isActive: false,
            categoryId: 0,
            onlyOneByCategory: false,
          };
        }

        return item;
      },
      (get, set, updateValue: (prev: Action) => Action | Action) => {
        const canAction = get(enableActionAtom);
        if (!canAction) return;
        const actions = get(actionsAtom);
        const prevAction = actions.find((a) => a.id === action_id);
        const category_id = prevAction?.categoryId;
        const newArray = actions
          // onlyOneByCategoryがtrueの場合、同じカテゴリのアクションを非アクティブにする
          .map((action) =>
            action.id === action_id
              ? typeof updateValue === "function"
                ? updateValue(action)
                : updateValue
              : action.onlyOneByCategory
              ? {
                  ...action,
                  isActive:
                    action.categoryId === category_id ? false : action.isActive,
                }
              : action
          );

        set(actionsAtom, newArray);
      }
    ),
  (prev, next) => prev === next
);

// 今日の歩数
export const todayStepsAtom = atom(0);
todayStepsAtom.debugLabel = "todayStepsAtom";

export const writableTodayStepsAtom = atom(
  (get) => get(todayStepsAtom),
  (get, set, newValue: number) => {
    const canAction = get(enableActionAtom);
    if (!canAction) return;
    set(todayStepsAtom, newValue);
  }
);
writableTodayStepsAtom.debugLabel = "writableTodayStepsAtom";

// 前回までの累計アクションポイント
export const lastActionPointComulativeAtom = atom(0);
lastActionPointComulativeAtom.debugLabel = "lastActionPointComulativeAtom";

// 前回までの累計歩数
export const lastStepsComulativeAtom = atom(0);
lastStepsComulativeAtom.debugLabel = "lastStepsComulativeAtom";

export const isYesterdayAtom = atom(false);
isYesterdayAtom.debugLabel = "isYesterdayAtom";

export const recordIdAtom = atom(0);
recordIdAtom.debugLabel = "recordIdAtom";
export const eventIdAtom = atom(0);
eventIdAtom.debugLabel = "eventIdAtom";
export const userIdAtom = atom("");
userIdAtom.debugLabel = "userIdAtom";

function calcActionPointSummry(actions: Action[]): number {
  return filterActiveActions(actions).reduce(
    (acc, action) => acc + action.point,
    0
  );
}

function filterActiveActions(actions: Action[]): Action[] {
  return actions.filter((action) => action.isActive);
}

function calcStepPointSummry(todaySteps: number): number {
  return Math.floor(todaySteps / 1000);
}

// 今日のポイント
export const todayTotalPointAtom = atom((get) => {
  const actions = get(actionsAtom);
  const todaySteps = get(todayStepsAtom);
  const actionPointSummary = calcActionPointSummry(actions);
  const stepPointSummary = calcStepPointSummry(todaySteps);
  return actionPointSummary + stepPointSummary;
});
todayTotalPointAtom.debugLabel = "todayTotalPointAtom";

// 昨日までの総合ポイント
export const lastTotalPointAtom = atom((get) => {
  const lastComulativeActionPoint = get(lastActionPointComulativeAtom);
  const lastComulativeSteps = get(lastStepsComulativeAtom);
  const stepPoints = Math.floor(lastComulativeSteps / 1000);
  return lastComulativeActionPoint + stepPoints;
});
lastTotalPointAtom.debugLabel = "lastTotalPointAtom";

// export const combineAtom = atom((get) => {
//   const recordId = get(recordIdAtom);
//   const eventId = get(eventIdAtom);
//   const userId = get(userIdAtom);
//   const actions = get(actionsAtom);
//   const todayStepSummary = get(todayStepsAtom);
//   const lastComulativeActionPoint = get(lastActionPointComulativeAtom);
//   const lastComulativeSteps = get(lastStepsComulativeAtom);
//   const isYesterday = get(isYesterdayAtom);

//   const todayActionPointSummary = calcActionPointSummry(actions);
//   const activeaction_ids = filterActiveActions(actions).map(
//     (action) => action.id
//   );

//   if (!isInitialized) {
//     isInitialized = true;
//     return;
//   }

//   return {
//     recordId,
//     userId,
//     eventId,
//     todayActionPointSummary,
//     todayStepSummary,
//     lastActionPointComulative: lastComulativeActionPoint,
//     lastStepComulative: lastComulativeSteps,
//     activeaction_ids,
//     isUpdateYesterday: isYesterday,
//   };
// });

let isInitialized = false;
// TODO: storeの値をdbとsyncする目的で書いたが、初回マウント時に発火してしまい、
// 何の変化もないのに更新してしまう。いったん置いておく。
export const syncWithServerEffect = (
  debouncedUpdateDailyRecord: (args: UpdateDailyRecordParams) => Promise<void>
) =>
  atomEffect((get) => {
    const recordId = get(recordIdAtom);
    const eventId = get(eventIdAtom);
    const userId = get(userIdAtom);
    const actions = get(actionsAtom);
    const todayStepSummary = get(todayStepsAtom);
    const lastComulativeActionPoint = get(lastActionPointComulativeAtom);
    const lastComulativeSteps = get(lastStepsComulativeAtom);
    const isYesterday = get(isYesterdayAtom);

    const todayActionPointSummary = calcActionPointSummry(actions);
    const activeaction_ids = filterActiveActions(actions).map(
      (action) => action.id
    );

    if (!isInitialized) {
      isInitialized = true;
      return;
    }

    console.debug(
      "fired",
      recordId,
      todayStepSummary,
      todayActionPointSummary,
      activeaction_ids
    );

    debouncedUpdateDailyRecord({
      recordId,
      userId,
      eventId,
      todayActionPointSummary,
      todayStepSummary,
      lastActionPointComulative: lastComulativeActionPoint,
      lastStepComulative: lastComulativeSteps,
      activeaction_ids,
      isUpdateYesterday: isYesterday,
    });
  });
