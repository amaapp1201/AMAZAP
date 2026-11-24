import { useAtom, useAtomValue } from "jotai";
import {
  lastStepsComulativeAtom,
  lastTotalPointAtom,
  todayTotalPointAtom,
} from "./daily-record-state";
import { ReactNode, useMemo } from "react";

function DisplayItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <span className="flex flex-col items-end space-y-0">
      <span className="italic text-xs">{title}</span>
      <span className="italic text-right text-xl font-bold leading-none">
        {children}
      </span>
    </span>
  );
}
function Point({ children }: { children: number }) {
  return (
    <>
      <span>{children}</span>
      <span className="text-xs ml-0.5">pt</span>
    </>
  );
}

function Step({ children }: { children: number }) {
  return (
    <>
      <span>{children}</span>
      <span className="text-xs ml-1">歩</span>
    </>
  );
}

export function PointDisplay() {
  const lastTotalPoint = useAtomValue(lastTotalPointAtom);
  const todayTotalPoint = useAtomValue(todayTotalPointAtom);
  const lastStepsComulative = useAtomValue(lastStepsComulativeAtom);

  const totalPoint = useMemo(
    () => lastTotalPoint + todayTotalPoint,
    [lastTotalPoint, todayTotalPoint]
  );

  return (
    <div className="flex text-white space-x-4 justify-center bg-slate-700 bg-opacity-80 p-2">
      <div className="flex space-x-2">
        <DisplayItem title="前日まで">
          <Point>{lastTotalPoint}</Point>
        </DisplayItem>
        <span className="font-bold text-lg mt-3">+</span>
        <DisplayItem title="本日">
          <Point>{todayTotalPoint}</Point>
        </DisplayItem>
        <span className="font-bold text-lg mt-3">=</span>
        <DisplayItem title="総合">
          <Point>{totalPoint}</Point>
        </DisplayItem>
      </div>
      <span className="self-stretch w-0.5 border-r-1 bg-white"></span>
      <div className="">
        <DisplayItem title="前日まで">
          <Step>{lastStepsComulative}</Step>
        </DisplayItem>
      </div>
    </div>
  );
}
