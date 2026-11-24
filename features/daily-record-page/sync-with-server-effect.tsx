import { useAtom } from "jotai";
import { syncWithServerEffect } from "./daily-record-state";
import { useCallback, useRef } from "react";
import { type UpdateDailyRecordParams } from "./daily-record-service";
import debounce from "lodash.debounce";

export function SyncWithServerEffect({
  updateDailyRecord,
}: {
  updateDailyRecord: (args: UpdateDailyRecordParams) => Promise<void>;
}) {
  const finishFirst = useRef(false);

  const syncEffect = useRef(
    syncWithServerEffect(
      debounce(updateDailyRecord, 1000) as (
        args: UpdateDailyRecordParams
      ) => Promise<void>
    )
  );
  useAtom(syncEffect.current);

  return null;
}
