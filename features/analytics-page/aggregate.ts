import { AnalyticsData } from "./types";

// 集計の単位。ユーザーごと、またはチームごと
export type Unit = "user" | "team";

// 表の 1 行になる対象（ユーザーまたはチーム）
export type Entity = {
  key: string;
  name: string;
  // ユーザーの場合の所属チーム名
  note?: string;
  // ユーザーごとの入力期間が設定されている場合の表示（例: 10/1〜12/31）
  period?: string;
};

// アクション別・カテゴリ別の集計で、何を数えるか
export type CheckTarget =
  | { type: "action"; id: number }
  | { type: "category"; id: number };

export function listEntities(data: AnalyticsData, unit: Unit): Entity[] {
  if (unit === "team") {
    return data.teams.map((team) => ({
      key: String(team.id),
      name: team.name,
    }));
  }

  const teamNames = new Map(data.teams.map((team) => [team.id, team.name]));
  return data.users.map((user) => ({
    key: user.id,
    name: user.name,
    note: user.teamId ? teamNames.get(user.teamId) : undefined,
    period: user.period
      ? `${formatDay(user.period.startDate)}〜${formatDay(user.period.endDate)}`
      : undefined,
  }));
}

function entityKey(record: AnalyticsData["records"][number], unit: Unit) {
  return unit === "team" ? String(record.teamId) : record.userId;
}

function dayIndexMap(data: AnalyticsData) {
  return new Map(data.days.map((day, index) => [day, index]));
}

export type PointSeries = {
  // その日に増えたポイント
  daily: number[];
  // その日までの合計ポイント
  cumulative: number[];
  // その日の歩数
  steps: number[];
  // その日までの歩数の合計
  cumulativeSteps: number[];
  // その日のアクションのポイント
  actionPoints: number[];
};

// 対象ごとの、日ごとのポイントと歩数。
// ポイントはランキングと同じ計算（アクションのポイントの合計 + 歩数の合計 ÷ 1000 の切り捨て）。
// 歩数は合計してから 1000 で割るため、その日に増えたポイントは「前日までの合計との差」で求める
export function buildPointSeries(
  data: AnalyticsData,
  unit: Unit
): Map<string, PointSeries> {
  const dayIndex = dayIndexMap(data);
  const length = data.days.length;
  const result = new Map<string, PointSeries>();

  const get = (key: string) => {
    let series = result.get(key);
    if (!series) {
      series = {
        daily: new Array(length).fill(0),
        cumulative: new Array(length).fill(0),
        steps: new Array(length).fill(0),
        cumulativeSteps: new Array(length).fill(0),
        actionPoints: new Array(length).fill(0),
      };
      result.set(key, series);
    }
    return series;
  };

  for (const entity of listEntities(data, unit)) {
    get(entity.key);
  }

  for (const record of data.records) {
    const index = dayIndex.get(record.day);
    if (index === undefined) {
      continue;
    }
    const series = get(entityKey(record, unit));
    series.steps[index] += record.steps;
    series.actionPoints[index] += record.actionPoints;
  }

  for (const series of result.values()) {
    let actionTotal = 0;
    let stepTotal = 0;
    let previous = 0;
    for (let i = 0; i < length; i++) {
      actionTotal += series.actionPoints[i];
      stepTotal += series.steps[i];
      const total = actionTotal + Math.floor(stepTotal / 1000);
      series.cumulative[i] = total;
      series.cumulativeSteps[i] = stepTotal;
      series.daily[i] = total - previous;
      previous = total;
    }
  }

  return result;
}

// 対象ごとの、日ごとのチェック回数（指定したアクション、またはカテゴリ内のアクション）
export function buildCheckSeries(
  data: AnalyticsData,
  unit: Unit,
  target: CheckTarget
): Map<string, number[]> {
  const dayIndex = dayIndexMap(data);
  const length = data.days.length;
  const targetActionIds = new Set(
    target.type === "action"
      ? [target.id]
      : data.actions
          .filter((action) => action.categoryId === target.id)
          .map((action) => action.id)
  );

  const result = new Map<string, number[]>();
  for (const entity of listEntities(data, unit)) {
    result.set(entity.key, new Array(length).fill(0));
  }

  for (const record of data.records) {
    const index = dayIndex.get(record.day);
    if (index === undefined) {
      continue;
    }
    const count = record.actionIds.filter((id) =>
      targetActionIds.has(id)
    ).length;
    if (count === 0) {
      continue;
    }
    const key = entityKey(record, unit);
    let series = result.get(key);
    if (!series) {
      series = new Array(length).fill(0);
      result.set(key, series);
    }
    series[index] += count;
  }

  return result;
}

// 対象ごとの、アクション別のチェック回数（cutoffIndex の日まで）
export function buildActionCounts(
  data: AnalyticsData,
  unit: Unit,
  cutoffIndex: number
): Map<string, Map<number, number>> {
  const dayIndex = dayIndexMap(data);
  const result = new Map<string, Map<number, number>>();

  for (const entity of listEntities(data, unit)) {
    result.set(entity.key, new Map());
  }

  for (const record of data.records) {
    const index = dayIndex.get(record.day);
    if (index === undefined || index > cutoffIndex) {
      continue;
    }
    const key = entityKey(record, unit);
    let counts = result.get(key);
    if (!counts) {
      counts = new Map();
      result.set(key, counts);
    }
    for (const actionId of record.actionIds) {
      counts.set(actionId, (counts.get(actionId) ?? 0) + 1);
    }
  }

  return result;
}

// 1 つの対象の、日ごとにチェックしたアクション（アクション id → その日の回数）
export function buildDailyActions(
  data: AnalyticsData,
  unit: Unit,
  key: string
): Map<number, number>[] {
  const dayIndex = dayIndexMap(data);
  const result: Map<number, number>[] = data.days.map(() => new Map());

  for (const record of data.records) {
    if (entityKey(record, unit) !== key) {
      continue;
    }
    const index = dayIndex.get(record.day);
    if (index === undefined) {
      continue;
    }
    for (const actionId of record.actionIds) {
      result[index].set(actionId, (result[index].get(actionId) ?? 0) + 1);
    }
  }

  return result;
}

export function sum(values: number[], untilIndex: number) {
  let total = 0;
  for (let i = 0; i <= untilIndex && i < values.length; i++) {
    total += values[i];
  }
  return total;
}

// yyyy-MM-dd を M/d にする
export function formatDay(day: string) {
  const [, month, date] = day.split("-");
  return `${Number(month)}/${Number(date)}`;
}
