import { test, expect } from "vitest";
import { isWihtinEventRange } from "./get-recordable-range";
import { isWithinYesterTodayInLocal } from "../helpers/utils";
const tz = "Asia/Tokyo";
// 画面と同じ計算: 入力できる = 表示中の日が「今日か昨日」かつ「期間内」
const canInput = (range: any, nowIso: string, urlDate: string) => {
  const iso = new Date(urlDate).toISOString();
  return isWithinYesterTodayInLocal(nowIso, iso, tz) && isWihtinEventRange(range, iso, tz);
};
// 入力できる期間の境目（開始日、最終日、その翌日）の確認
test("イベント全体の期間 11/20〜11/30（終了日は 0 時で保存される）", () => {
  const range = { startAt: "2026-11-19T15:00:00+00:00", endAt: "2026-11-29T15:00:00+00:00" };
  const r = (d: string) => isWihtinEventRange(range, new Date(d).toISOString(), tz);
  expect([r("2026-11-19"), r("2026-11-20"), r("2026-11-29"), r("2026-11-30"), r("2026-12-01")]).toEqual([false, true, true, true, false]);
  // 最終日 11/30 の当日（昼・深夜）
  expect(canInput(range, "2026-11-30T03:00:00Z", "2026-11-30")).toBe(true);
  expect(canInput(range, "2026-11-30T14:30:00Z", "2026-11-30")).toBe(true);
  // 翌日 12/01: 11/30 の分は入力できる、12/01 の分は入力できない（朝・深夜）
  expect(canInput(range, "2026-11-30T15:30:00Z", "2026-11-30")).toBe(true);
  expect(canInput(range, "2026-12-01T14:30:00Z", "2026-11-30")).toBe(true);
  expect(canInput(range, "2026-11-30T15:30:00Z", "2026-12-01")).toBe(false);
  expect(canInput(range, "2026-12-01T14:30:00Z", "2026-12-01")).toBe(false);
  // 翌々日 12/02: どちらも入力できない
  expect(canInput(range, "2026-12-01T15:30:00Z", "2026-11-30")).toBe(false);
  expect(canInput(range, "2026-12-01T15:30:00Z", "2026-12-01")).toBe(false);
  // 開始日とその前日
  expect(canInput(range, "2026-11-20T03:00:00Z", "2026-11-20")).toBe(true);
  expect(canInput(range, "2026-11-20T03:00:00Z", "2026-11-19")).toBe(false);
});
test("ユーザーごとの期間 11/20〜11/22（終了日は 23:59:59 で渡される）", () => {
  const range = { startAt: new Date("2026-11-20T00:00:00+09:00").toISOString(), endAt: new Date("2026-11-22T23:59:59+09:00").toISOString() };
  const r = (d: string) => isWihtinEventRange(range, new Date(d).toISOString(), tz);
  expect([r("2026-11-19"), r("2026-11-20"), r("2026-11-22"), r("2026-11-23")]).toEqual([false, true, true, false]);
  // 最終日 11/22 の当日
  expect(canInput(range, "2026-11-22T03:00:00Z", "2026-11-22")).toBe(true);
  // 翌日 11/23: 11/22 の分は入力できる、11/23 の分は入力できない
  expect(canInput(range, "2026-11-23T03:00:00Z", "2026-11-22")).toBe(true);
  expect(canInput(range, "2026-11-23T03:00:00Z", "2026-11-23")).toBe(false);
  // 翌々日 11/24: どちらも入力できない
  expect(canInput(range, "2026-11-24T03:00:00Z", "2026-11-22")).toBe(false);
  expect(canInput(range, "2026-11-24T03:00:00Z", "2026-11-23")).toBe(false);
});
test("日付が未設定のイベントは、いつでも期間内", () => {
  expect(isWihtinEventRange({ startAt: null, endAt: null }, new Date("2026-11-30").toISOString(), tz)).toBe(true);
});
