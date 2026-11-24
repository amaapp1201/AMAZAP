"use server";

import { createClient } from "@/features/supabase/server";
import {
  convertIsoDateIntoJstRecordDate,
  isAfterTodayInLocal,
  isBeforeYesterdayInLocal,
} from "@/features/helpers/utils";

export async function getTodayRecord({
  eventId,
  userId,
  isoCurrentDate,
  snapshot_team_id,
  allowCreate = true,
}: {
  eventId: number;
  userId: string;
  isoCurrentDate: string;
  snapshot_team_id: number;
  // false のときは、その日の記録が無くても新しく作らない（本人の入力期間の外を表示するとき）
  allowCreate?: boolean;
}): Promise<{
  id: number;
  date: string;
  today_step_summary: number;
  today_action_point_summary: number;
  last_step_cumulative: number;
  last_action_point_cumulative: number;
  record_actions: {
    record_id: number;
    action_id: number;
  }[];
}> {
  const supabase = await createClient();

  const recordCurrentDate = convertIsoDateIntoJstRecordDate(isoCurrentDate);

  // console.debug(`recordCurrentDate: ${recordCurrentDate}`);

  if (
    isAfterTodayInLocal(
      () => new Date().toISOString(),
      isoCurrentDate,
      "Asia/Tokyo"
    )
  ) {
    throw new Error("isoCurrentDate is in the future");
  }

  // today以前でdateが最新のものをとってくる
  const { error: lastDailyRecordError, data: lastDailyRecord } = await supabase
    .from("records")
    .select(
      `
      id,
      date,
      today_step_summary,
      today_action_point_summary,
      last_step_cumulative,
      last_action_point_cumulative,
      record_actions (
        record_id,
        action_id
      )
      `
    )
    .match({
      event_id: eventId,
      user_id: userId,
    })
    .order("date", { ascending: false })
    .lte("date", recordCurrentDate)
    .limit(1)
    .maybeSingle();

  // console.debug("lastDailyRecord", lastDailyRecord);

  if (lastDailyRecordError) {
    throw lastDailyRecordError;
  }

  let lastActionPointCumulative = 0;
  let lastStepComlative = 0;

  // console.log(
  //   "lastDailyRecord.date",
  //   lastDailyRecord?.date,
  //   recordCurrentDate,
  //   lastDailyRecord?.date === recordCurrentDate
  // );

  // 最新がある場合todayと比較、最新のrecordがtodayであればそれを利用
  if (lastDailyRecord) {
    if (lastDailyRecord.date === recordCurrentDate) {
      return {
        ...lastDailyRecord,
        record_actions: lastDailyRecord.record_actions ?? [],
      };
    }

    lastActionPointCumulative =
      lastDailyRecord.last_action_point_cumulative +
      lastDailyRecord.today_action_point_summary;
    lastStepComlative =
      lastDailyRecord.last_step_cumulative + lastDailyRecord.today_step_summary;
  }

  // 最新がなければイベントにはじめてアクセスしたことに。
  // その場合lastPointCumulativeとlastStepComlativeは0のままで。
  const createNewRecord =
    allowCreate &&
    !isBeforeYesterdayInLocal(
      () => new Date().toISOString(),
      isoCurrentDate,
      "Asia/Tokyo"
    );

  if (!createNewRecord) {
    return {
      id: 0,
      date: recordCurrentDate,
      last_action_point_cumulative: lastActionPointCumulative,
      last_step_cumulative: lastStepComlative,
      today_action_point_summary: 0,
      today_step_summary: 0,
      record_actions: [],
    };
  }

  // daily record 作成
  const { error: newDailyRecordError, data: newDailyRecord } = await supabase
    .from("records")
    .insert({
      event_id: eventId,
      user_id: userId,
      snapshot_team_id: snapshot_team_id,
      date: recordCurrentDate,
      last_action_point_cumulative: lastActionPointCumulative,
      last_step_cumulative: lastStepComlative,
      today_action_point_summary: 0,
      today_step_summary: 0,
    })
    .select()
    .single();

  if (newDailyRecordError) {
    throw newDailyRecordError;
  }

  return { ...newDailyRecord, record_actions: [] };
}

export type UpdateDailyRecordParams = {
  recordId: number;
  eventId: number;
  userId: string;
  lastStepComulative: number;
  lastActionPointComulative: number;
  todayActionPointSummary: number;
  todayStepSummary: number;
  activeaction_ids: number[];
  isUpdateYesterday?: boolean;
};

export async function updateDailyRecord({
  recordId,
  eventId,
  userId,
  todayActionPointSummary,
  todayStepSummary,
  lastStepComulative,
  lastActionPointComulative,
  activeaction_ids,
  isUpdateYesterday = false,
}: UpdateDailyRecordParams): Promise<void> {
  console.debug(`
  recordId: ${recordId},
  eventId: ${eventId},
  userId: ${userId},
  todayActionPointSummary: ${todayActionPointSummary},
  todayStepSummary: ${todayStepSummary},
  lastStepComulative: ${lastStepComulative},
  lastActionPointComulative: ${lastActionPointComulative},
  activeaction_ids: ${activeaction_ids},
    `);
  const supabase = await createClient();

  // ユーザーごとの入力期間が設定されていれば、その外の日の記録は更新させない。
  // 画面側でも入力を止めているが、画面を通さない呼び出しに備えてここでも確認する。
  // 期間は、引数ではなく記録そのものに書かれたイベントとユーザーで調べる
  const { data: targetRecord, error: targetRecordError } = await supabase
    .from("records")
    .select("date, event_id, user_id")
    .eq("id", recordId)
    .maybeSingle();

  if (targetRecordError) {
    throw targetRecordError;
  }

  if (targetRecord) {
    const { data: period, error: periodError } = await supabase
      .from("event_user_periods")
      .select("start_date, end_date")
      .match({
        event_id: targetRecord.event_id,
        user_id: targetRecord.user_id,
      })
      .maybeSingle();

    if (periodError) {
      throw periodError;
    }

    const recordDay = targetRecord.date.slice(0, 10);
    if (
      period &&
      (recordDay < period.start_date || recordDay > period.end_date)
    ) {
      throw new Error("入力期間外のため、記録を更新できません");
    }
  }

  // daily record の update
  const { error: updateDailyRecordError } = await supabase
    .from("records")
    .update({
      today_action_point_summary: todayActionPointSummary,
      today_step_summary: todayStepSummary,
    })
    .eq("id", recordId);

  if (updateDailyRecordError) {
    throw updateDailyRecordError;
  }

  const { error: deleteError } = await supabase
    .from("record_actions")
    .delete()
    .eq("record_id", recordId);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("record_actions").insert(
    activeaction_ids.map((action_id) => ({
      record_id: recordId,
      action_id: action_id,
    }))
  );

  if (insertError) {
    throw insertError;
  }

  if (!isUpdateYesterday) {
    return;
  }

  // もし昨日のレコードをupdateしたのであれば、
  // 今日のレコードのlastStepComulativeとlastActionPointComulativeを修正しないといけない
  const zonedNow = convertIsoDateIntoJstRecordDate(new Date().toISOString());

  const { error: updateTodayError } = await supabase
    .from("records")
    .update({
      date: zonedNow,
      last_action_point_cumulative:
        lastActionPointComulative + todayActionPointSummary,
      last_step_cumulative: lastStepComulative + todayStepSummary,
    })
    .match({
      event_id: eventId,
      user_id: userId,
      date: zonedNow,
    });

  if (updateTodayError) {
    throw updateTodayError;
  }
}
