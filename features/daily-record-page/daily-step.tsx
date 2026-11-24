"use client";

import { useAtom, useAtomValue } from "jotai";
import { enableActionAtom, writableTodayStepsAtom } from "./daily-record-state";
import { Input } from "@/features/ui/input";
import { Plate } from "@/features/ui/plate";
import { Label } from "../ui/label";

export function DailyStep() {
  const [todayStep, setTodayStep] = useAtom(writableTodayStepsAtom);
  const canAction = useAtomValue(enableActionAtom);

  return (
    <Plate>
      <Label className="font-bold" htmlFor="today-step">
        今日の歩数
        <span className="ml-1 text-sm font-normal">(1000歩ごとに1pt)</span>
      </Label>
      <div className="relative flex items-center">
        <Input
          id="today-step"
          onChange={(e) =>
            setTodayStep(
              e.target.value ? Number.parseInt(e.target.value, 10) : 0
            )
          }
          defaultValue={todayStep}
          disabled={!canAction}
          className="pr-12" // 単位分の余白を確保
        ></Input>
        <div className="absolute right-4 flex space-x-3">
          <span className="text-gray-500">歩</span>
          <span className="text-green-500 italic">
            {Math.floor(todayStep / 1000)}pt
          </span>
        </div>
      </div>
    </Plate>
  );
}
