import { endOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { isWithinIntervalInIsoString } from "../helpers/utils";

// 終了日時を、その日（timeZone での日付）の終わりまで延ばす。
// イベントの終了日は「2026-11-30 の 0 時」のように日付の始まりで保存されるため、
// そのまま比べると最終日の分が期間外になってしまう。最終日もまるごと期間に含める
function toEndOfDay(isoDate: string, timeZone: string) {
  return fromZonedTime(
    endOfDay(toZonedTime(isoDate, timeZone)),
    timeZone
  ).toISOString();
}

// isoCurrentDate の日が、イベント（またはユーザーごと）の入力期間に入っているか。
// 開始日と終了日は、どちらも期間に含む。
// 記録できるのは当日と前日だけなので（isWithinYesterTodayInLocal）、
// 最終日の分は翌日まで入力でき、翌日の分は期間外なので入力できない
export function isWihtinEventRange(
  eventIsoRange: { startAt: string | null; endAt: string | null },
  isoCurrentDate: string,
  timeZone: string
) {
  return isWithinIntervalInIsoString(isoCurrentDate, timeZone, {
    isoDateStart: eventIsoRange.startAt,
    isoDateEnd: eventIsoRange.endAt
      ? toEndOfDay(eventIsoRange.endAt, timeZone)
      : null,
  });
}
