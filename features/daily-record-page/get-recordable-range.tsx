import { isWithinIntervalInIsoString } from "../helpers/utils";

export function isWihtinEventRange(
  eventIsoRange: { startAt: string | null; endAt: string | null },
  isoCurrentDate: string,
  timeZone: string
) {
  return isWithinIntervalInIsoString(isoCurrentDate, timeZone, {
    isoDateStart: eventIsoRange.startAt,
    isoDateEnd: eventIsoRange.endAt,
  });
}
