"use client";
import { DatePicker } from "@/features/ui/date-picker";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toURLDate } from "@/features/helpers/utils";
import { subDays } from "date-fns";
import { enableActionAtom } from "./daily-record-state";
import { useAtomValue } from "jotai";

export function DateSelector({
  isoCurrentDate,
  isoActualCurrentDate,
  disabled,
}: {
  isoCurrentDate: string;
  isoActualCurrentDate: string;
  disabled: {
    isoBefore: string | null;
    isoAfter: string | null;
  };
}) {
  const router = useRouter();
  const canActoin = useAtomValue(enableActionAtom);

  const changeDate = useCallback((date: string) => {
    router.push("/daily-record/" + toURLDate(date));
  }, []);

  return (
    <div>
      <div className="flex space-x-3 items-center">
        <DatePicker
          defaultIsoDate={isoCurrentDate}
          onSetDate={changeDate}
          disabled={disabled}
        ></DatePicker>
        <Button
          onClick={() =>
            changeDate(subDays(isoActualCurrentDate, 1).toISOString())
          }
          size="xs"
          className="text-xs bg-slate-500"
        >
          昨日
        </Button>
        <Button
          onClick={() => changeDate(isoActualCurrentDate)}
          size="xs"
          className="text-xs bg-slate-500"
        >
          今日
        </Button>
      </div>
      {!canActoin && (
        <div className="text-xs text-red-600 mt-1">
          ※この日のアクションの入力は締め切りました
        </div>
      )}
    </div>
  );
}
