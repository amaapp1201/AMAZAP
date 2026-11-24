import { type ClassValue, clsx } from "clsx";
import {
  addDays,
  endOfDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  format,
  subDays,
  isAfter,
  isBefore,
  isYesterday,
  Locale,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DailyRecordDate = ``;

export function convertIsoDateIntoJstRecordDate(isoString: string) {
  // ISO文字列からDateオブジェクトを生成
  const date = new Date(isoString);

  // JSTに変換
  const jstDate = toZonedTime(date, "Asia/Tokyo");

  // console.debug("jstDate", isoString, date, jstDate);

  // UTCでその日の0時0分0秒に修正
  const year = jstDate.getFullYear();
  const month = jstDate.getMonth();
  const day = jstDate.getDate();

  // 新しいDateオブジェクトをUTCで作成
  const midnightDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

  // 修正後のDateオブジェクトをISO文字列に変換 .000Zを削除
  return midnightDate.toISOString().slice(0, -5);
}

// 2024-10-10という形にする
export function toURLDate(formattedDate: string) {
  return format(formattedDate, "yyyy-MM-dd");
}

function isWithinIntervalInLocaleInLocal(
  isoCurrentDate: string,
  timeZone: string,
  duration: {
    targetDayStart: Date | null;
    targetDayEnd: Date | null;
  }
) {
  const parsedDate = parseISO(isoCurrentDate);

  // 渡された日付をタイムゾーンに変換
  const zonedDate = toZonedTime(parsedDate, timeZone);

  if (duration.targetDayStart && duration.targetDayEnd) {
    return isWithinInterval(zonedDate, {
      start: duration.targetDayStart,
      end: duration.targetDayEnd,
    });
  }

  if (duration.targetDayStart) {
    return isAfter(zonedDate, duration.targetDayStart);
  }

  if (duration.targetDayEnd) {
    return isBefore(zonedDate, duration.targetDayEnd);
  }

  return true;
}

export function isWithinIntervalInIsoString(
  isoCurrentDate: string,
  timeZone: string,
  duration: {
    isoDateStart: string | null;
    isoDateEnd: string | null;
  }
) {
  const zonedDuration = {
    start: duration.isoDateStart
      ? toZonedTime(parseISO(duration.isoDateStart), timeZone)
      : null,
    end: duration.isoDateEnd
      ? toZonedTime(parseISO(duration.isoDateEnd), timeZone)
      : null,
  };

  return isWithinIntervalInLocaleInLocal(isoCurrentDate, timeZone, {
    targetDayStart: zonedDuration.start,
    targetDayEnd: zonedDuration.end,
  });
}

function isWithinIntervalFromTodayInLocale(
  generateIsoToday: (() => string) | string,
  isoCurrentDate: string,
  timeZone: string,
  durationFromToday: {
    plus: number;
    minus: number;
  }
) {
  const now =
    typeof generateIsoToday === "function"
      ? generateIsoToday()
      : generateIsoToday;

  const zonedNow = toZonedTime(now, timeZone);

  // ローカルタイムゾーンでの範囲を計算
  const targetDayStart = startOfDay(subDays(zonedNow, durationFromToday.minus));
  const targetDayEnd = endOfDay(addDays(zonedNow, durationFromToday.plus));

  return isWithinIntervalInLocaleInLocal(isoCurrentDate, timeZone, {
    targetDayStart: targetDayStart,
    targetDayEnd: targetDayEnd,
  });
}

/**
 *
 * @param generateIsoToday
 * @param isoCurrentDate
 * @param timeZone
 * @returns
 */
export function isWithinYesterTodayInLocal(
  generateIsoToday: (() => string) | string,
  isoCurrentDate: string,
  timeZone: string
) {
  return isWithinIntervalFromTodayInLocale(
    generateIsoToday,
    isoCurrentDate,
    timeZone,
    {
      plus: 0,
      minus: 1,
    }
  );
}

export function isAfterTodayInLocal(
  generateIsoToday: (() => string) | string,
  isoCurrentDate: string,
  timeZone: string
) {
  const parsedDate = parseISO(isoCurrentDate);

  const now =
    typeof generateIsoToday === "function"
      ? generateIsoToday()
      : generateIsoToday;

  const zonedNow = toZonedTime(now, timeZone);

  // ローカルタイムゾーンでの範囲を計算
  const startOfTommorow = startOfDay(addDays(zonedNow, 1));

  // 渡された日付も同じタイムゾーンに変換
  const currentZonedDate = toZonedTime(parsedDate, timeZone);

  return currentZonedDate.getTime() >= startOfTommorow.getTime();
}

export function isYesterdayInLocal(isoCurrentDate: string, timeZone: string) {
  return isYesterday(toZonedTime(parseISO(isoCurrentDate), timeZone));
}

export function isBeforeYesterdayInLocal(
  generateIsoToday: (() => string) | string,
  isoCurrentDate: string,
  timeZone: string
) {
  const parsedDate = parseISO(isoCurrentDate);

  const now =
    typeof generateIsoToday === "function"
      ? generateIsoToday()
      : generateIsoToday;

  const zonedNow = toZonedTime(now, timeZone);

  // ローカルタイムゾーンでの範囲を計算
  const startOfTommorow = startOfDay(subDays(zonedNow, 1));

  // 渡された日付も同じタイムゾーンに変換
  const currentZonedDate = toZonedTime(parsedDate, timeZone);

  return currentZonedDate.getTime() < startOfTommorow.getTime();
}

export function formatToJst(
  isoString: string | Date,
  formatString: string,
  options?: { locale: Locale }
) {
  const date = new Date(isoString);
  const jstDate = toZonedTime(date, "Asia/Tokyo");
  return format(jstDate, formatString, options);
}

export function nextDay(isoString: string, timeZone: string) {
  const zonedNow = toZonedTime(isoString, timeZone);

  const nextDay = addDays(zonedNow, 1);

  return nextDay;
}
