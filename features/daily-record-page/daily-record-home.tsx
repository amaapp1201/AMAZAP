"use client";

import { DevTools } from "jotai-devtools";
import { Provider, createStore } from "jotai";
import { Category } from "./category";
import { PointDisplay } from "./point-display";
import { DailyRecord } from "./types";
import "jotai-devtools/styles.css";

import {
  actionsAtom,
  lastActionPointComulativeAtom,
  lastStepsComulativeAtom,
  todayStepsAtom,
  recordIdAtom,
  enableActionAtom,
  eventIdAtom,
  userIdAtom,
  isYesterdayAtom,
} from "./daily-record-state";
import { DailyStep } from "./daily-step";
import { useEffect, useMemo } from "react";
import { DateSelector } from "./date-selector";
import { SyncWithServerEffect } from "./sync-with-server-effect";
import {
  isWithinYesterTodayInLocal,
  isYesterdayInLocal,
} from "@/features/helpers/utils";
import { isWihtinEventRange } from "./get-recordable-range";
import type { UpdateDailyRecordParams } from "./daily-record-service";

export function DailyRecordHome({
  userId,
  currentEvent,
  todayDailyRecord,
  isoCurrentDate,
  isoActualCurrentDate,
  preview = false,
  updateDailyRecord,
}: {
  userId: string;
  currentEvent: {
    id: number;
    name: string;
    startAt: string | null;
    endAt: string | null;
    isTeamRankVisible: boolean;
    isUserRankVisible: boolean;
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
      isSingleSelection: boolean;
    }[];
    teams: {
      id: number;
      name: string;
    }[];
  };
  todayDailyRecord: DailyRecord;
  isoCurrentDate: string;
  isoActualCurrentDate: string;
  preview?: boolean;
  updateDailyRecord: (args: UpdateDailyRecordParams) => Promise<void>;
}) {
  const myStore = createStore();
  const totalAchievementaction_ids = useMemo(
    () => todayDailyRecord?.record_actions.map((a) => a.action_id) ?? [],
    [todayDailyRecord]
  );
  const isYesterday = useMemo(
    () => isYesterdayInLocal(isoCurrentDate, "Asia/Tokyo"),
    [isoCurrentDate]
  );
  const actions = useMemo(
    () =>
      currentEvent.categories.flatMap((category) =>
        category.actions.map((action) => ({
          ...action,
          id: action.id,
          isActive: totalAchievementaction_ids.includes(action.id),
          categoryId: category.id,
          onlyOneByCategory: category.isSingleSelection,
        }))
      ),
    [currentEvent]
  );

  myStore.set(isYesterdayAtom, isYesterday);
  myStore.set(recordIdAtom, todayDailyRecord.id);
  myStore.set(eventIdAtom, currentEvent.id);
  myStore.set(userIdAtom, userId);
  myStore.set(actionsAtom, actions);
  myStore.set(todayStepsAtom, todayDailyRecord.today_step_summary);
  myStore.set(
    lastActionPointComulativeAtom,
    todayDailyRecord.last_action_point_cumulative
  );
  myStore.set(lastStepsComulativeAtom, todayDailyRecord.last_step_cumulative);
  const isEnableAction = preview
    ? false
    : isWithinYesterTodayInLocal(
        isoActualCurrentDate,
        isoCurrentDate,
        "Asia/Tokyo"
      ) &&
      isWihtinEventRange(
        {
          startAt: currentEvent.startAt,
          endAt: currentEvent.endAt,
        },
        isoCurrentDate,
        "Asia/Tokyo"
      );
  myStore.set(enableActionAtom, isEnableAction);

  return (
    <Provider store={myStore}>
      {/* <DevTools store={myStore} /> */}
      <div className="pt-3 pb-32 px-0.5 flex flex-col space-y-3  flex-1">
        <SyncWithServerEffect
          updateDailyRecord={updateDailyRecord}
        ></SyncWithServerEffect>
        {preview ? (
          <div>プレビューモード</div>
        ) : (
          <DateSelector
            isoActualCurrentDate={isoActualCurrentDate}
            isoCurrentDate={isoCurrentDate}
            disabled={{
              isoBefore: currentEvent.startAt,
              isoAfter: isoActualCurrentDate,
            }}
          ></DateSelector>
        )}
        <DailyStep></DailyStep>
        {currentEvent.categories.length === 0 && (
          <div>イベントカテゴリがまだ登録されていません。</div>
        )}
        {currentEvent.categories.map((eventCategory) => (
          <Category
            key={eventCategory.id}
            eventCategory={{
              name: eventCategory.name,
              actions: eventCategory.actions.map((action) => ({
                id: action.id,
                name: action.name,
                point: action.point,
              })),
              isSingleSelection: eventCategory.isSingleSelection,
            }}
          ></Category>
        ))}
        <div className="fixed bottom-5 left-0 right-0">
          <PointDisplay></PointDisplay>
        </div>
      </div>
    </Provider>
  );
}
