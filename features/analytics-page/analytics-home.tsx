"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/features/helpers/utils";
import { Select } from "../ui/select";
import {
  CheckTarget,
  Entity,
  Unit,
  buildActionCounts,
  buildCheckSeries,
  buildDailyActions,
  buildPointSeries,
  formatDay,
  listEntities,
  sum,
} from "./aggregate";
import {
  ColumnChart,
  LineChart,
  MAX_SERIES,
  RankedBars,
  SERIES_COLORS,
} from "./charts";
import { AnalyticsData, AnalyticsEventOption } from "./types";

type View = "points" | "steps" | "checks" | "counts" | "detail";

const VIEWS: { id: View; label: string; description: string }[] = [
  {
    id: "points",
    label: "ポイントの推移",
    description: "日ごとに得たポイントと、指定した日までの合計",
  },
  {
    id: "steps",
    label: "歩数の推移",
    description: "日ごとの歩数と、指定した日までの合計",
  },
  {
    id: "checks",
    label: "アクション・カテゴリ別",
    description: "アクションやカテゴリに、誰がいつチェックを入れたか",
  },
  {
    id: "counts",
    label: "チェック回数",
    description: "どのアクションに何回チェックを入れたか",
  },
  {
    id: "detail",
    label: "個別の記録",
    description: "1 人（1 チーム）が、いつ何をチェックしたか",
  },
];

export function AnalyticsHome({
  events,
  data,
}: {
  events: AnalyticsEventOption[];
  data: AnalyticsData | null;
}) {
  const router = useRouter();

  if (events.length === 0 || !data) {
    return (
      <div className="p-4 flex flex-col space-y-2">
        <h2 className="font-bold">記録の分析</h2>
        <p>
          分析できるイベントがありません。イベントを公開すると、参加者の記録をここで確認できます。
        </p>
      </div>
    );
  }

  return (
    // 管理画面のスクロール領域は中身の幅に合わせて広がるため、幅を画面（サイドバー 110px を除く）に固定し、
    // 横に長い表はそれぞれの枠の中でスクロールさせる
    <div className="p-4 flex flex-col space-y-3 w-[calc(100vw-110px)]">
      <div className="flex flex-wrap items-end gap-3">
        <h2 className="font-bold mr-auto">記録の分析</h2>
        <Field label="イベント">
          <Select
            className="w-96 max-w-full"
            value={data.event.id}
            onChange={(e) =>
              router.push(`/admin/analytics?event=${e.target.value}`)
            }
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
                {event.status === "active" ? "（進行中）" : "（アーカイブ）"}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {/* イベントを切り替えたら、選択中の日付や対象を持ち越さない */}
      <AnalyticsBody key={data.event.id} data={data}></AnalyticsBody>
    </div>
  );
}

function AnalyticsBody({ data }: { data: AnalyticsData }) {
  const [view, setView] = useState<View>("points");
  const [unit, setUnit] = useState<Unit>("user");
  const [cutoffIndex, setCutoffIndex] = useState(data.days.length - 1);

  const entities = useMemo(() => listEntities(data, unit), [data, unit]);
  const visibleDays = useMemo(
    () => data.days.slice(0, cutoffIndex + 1),
    [data.days, cutoffIndex]
  );

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-md p-3">
        <Field label="集計の単位">
          <Segmented
            options={[
              { value: "user", label: "ユーザー" },
              { value: "team", label: "チーム" },
            ]}
            value={unit}
            onChange={(value) => setUnit(value as Unit)}
          ></Segmented>
        </Field>
        <Field label="この日までを集計">
          <Select
            className="w-40"
            value={cutoffIndex}
            onChange={(e) => setCutoffIndex(Number(e.target.value))}
          >
            {data.days.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </Select>
        </Field>
        <span className="text-xs text-muted-foreground pb-2">
          {data.days[0]} 〜 {data.days[cutoffIndex]}（{cutoffIndex + 1}日間）
        </span>
      </div>

      <div
        role="tablist"
        className="grid grid-cols-2 md:grid-cols-5 gap-1 rounded-lg bg-slate-200 p-1"
      >
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={view === item.id}
            title={item.description}
            onClick={() => setView(item.id)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground",
              view === item.id && "bg-background text-foreground shadow"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {VIEWS.find((item) => item.id === view)?.description}
      </p>

      {(view === "points" || view === "steps") && (
        <PointsView
          // 単位や、ポイント・歩数を切り替えたら、グラフに出す対象の選択をやり直す
          key={`${unit}-${view}`}
          metric={view}
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          visibleDays={visibleDays}
        ></PointsView>
      )}
      {view === "checks" && (
        <ChecksView
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          visibleDays={visibleDays}
        ></ChecksView>
      )}
      {view === "counts" && (
        <CountsView
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
        ></CountsView>
      )}
      {view === "detail" && (
        <DetailView
          key={unit}
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          visibleDays={visibleDays}
        ></DetailView>
      )}
    </>
  );
}

type ViewProps = {
  data: AnalyticsData;
  unit: Unit;
  entities: Entity[];
  cutoffIndex: number;
};

// ---------------------------------------------------------------------------
// ポイントの推移・歩数の推移（同じ形の表とグラフで、見る数字だけが違う）
// ---------------------------------------------------------------------------
function PointsView({
  data,
  unit,
  entities,
  cutoffIndex,
  visibleDays,
  metric,
}: ViewProps & { visibleDays: string[]; metric: "points" | "steps" }) {
  const [mode, setMode] = useState<"cumulative" | "daily">("cumulative");
  const pointSeries = useMemo(() => buildPointSeries(data, unit), [data, unit]);

  const isSteps = metric === "steps";
  const metricName = isSteps ? "歩数" : "ポイント";
  const unitLabel = isSteps ? "歩" : "pt";

  const rows = useMemo(
    () =>
      entities
        .map((entity) => {
          const series = pointSeries.get(entity.key)!;
          const points = series.cumulative[cutoffIndex] ?? 0;
          const steps = series.cumulativeSteps[cutoffIndex] ?? 0;
          return {
            entity,
            // 表とグラフに出す、日ごとの値とその日までの合計
            daily: isSteps ? series.steps : series.daily,
            cumulative: isSteps ? series.cumulativeSteps : series.cumulative,
            points,
            steps,
            // 並び順に使う、見ている数字の合計
            total: isSteps ? steps : points,
            // 記録のある日数（1 日あたりの平均に使う）
            recordedDays: series.steps
              .slice(0, cutoffIndex + 1)
              .filter((value, index) => value > 0 || series.daily[index] > 0)
              .length,
          };
        })
        .sort((a, b) => b.total - a.total),
    [entities, pointSeries, cutoffIndex, isSteps]
  );

  // グラフに出す対象。最初は合計の多い順に上限まで選ぶ
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    rows.slice(0, MAX_SERIES).map((row) => row.entity.key)
  );

  const toggle = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : current.length >= MAX_SERIES
        ? current
        : [...current, key]
    );
  };

  const chartSeries = selectedKeys
    .map((key) => rows.find((row) => row.entity.key === key))
    .filter((row): row is (typeof rows)[number] => !!row)
    .map((row) => ({
      key: row.entity.key,
      name: row.entity.name,
      values: (mode === "cumulative" ? row.cumulative : row.daily).slice(
        0,
        cutoffIndex + 1
      ),
    }));

  return (
    <>
      <Panel
        title={
          mode === "cumulative"
            ? `その日までの${metricName}の合計`
            : `日ごとの${metricName}`
        }
        action={
          <Segmented
            options={[
              { value: "cumulative", label: "合計の推移" },
              { value: "daily", label: "日ごと" },
            ]}
            value={mode}
            onChange={(value) => setMode(value as "cumulative" | "daily")}
          ></Segmented>
        }
      >
        <LineChart
          days={visibleDays}
          series={chartSeries}
          unitLabel={unitLabel}
        ></LineChart>
      </Panel>
      <Panel
        title={`日ごとの${metricName}`}
        note={
          isSteps
            ? `グラフに出す対象は、チェックボックスで ${MAX_SERIES} 件まで選べます。「1 日平均」は、記録のある日だけで割った値です。`
            : `グラフに出す対象は、チェックボックスで ${MAX_SERIES} 件まで選べます。ポイントはランキングと同じ計算です（アクションのポイント + 歩数の合計 1000 歩ごとに 1pt）。`
        }
      >
        <ScrollTable>
          <thead>
            <tr>
              <Th sticky>{unit === "user" ? "ユーザー" : "チーム"}</Th>
              <Th right>{data.days[cutoffIndex]} までの合計</Th>
              <Th right>{isSteps ? "1 日平均" : "歩数の合計"}</Th>
              {visibleDays.map((day) => (
                <Th key={day} right>
                  {formatDay(day)}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selectedIndex = selectedKeys.indexOf(row.entity.key);
              const isSelected = selectedIndex !== -1;
              return (
                <tr key={row.entity.key} className="border-t">
                  <Td sticky>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={
                          !isSelected && selectedKeys.length >= MAX_SERIES
                        }
                        onChange={() => toggle(row.entity.key)}
                        aria-label={`${row.entity.name}をグラフに表示`}
                      />
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSelected
                            ? SERIES_COLORS[selectedIndex]
                            : "transparent",
                        }}
                      ></span>
                      <EntityName entity={row.entity}></EntityName>
                    </label>
                  </Td>
                  <Td right bold>
                    {row.total.toLocaleString()}
                    {unitLabel}
                  </Td>
                  <Td right>
                    {isSteps
                      ? row.recordedDays === 0
                        ? "–"
                        : `${Math.round(
                            row.steps / row.recordedDays
                          ).toLocaleString()}歩`
                      : `${row.steps.toLocaleString()}歩`}
                  </Td>
                  {visibleDays.map((day, index) => (
                    <Td key={day} right muted={row.daily[index] === 0}>
                      {row.daily[index].toLocaleString()}
                    </Td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </ScrollTable>
        {rows.length === 0 && <Empty></Empty>}
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// アクション・カテゴリ別
// ---------------------------------------------------------------------------
function ChecksView({
  data,
  unit,
  entities,
  cutoffIndex,
  visibleDays,
}: ViewProps & { visibleDays: string[] }) {
  // "category:1" や "action:3" の形で、数える対象を持つ
  const [targetValue, setTargetValue] = useState(() =>
    data.categories[0]
      ? `category:${data.categories[0].id}`
      : data.actions[0]
      ? `action:${data.actions[0].id}`
      : ""
  );

  const target = useMemo<CheckTarget | null>(() => {
    const [type, id] = targetValue.split(":");
    if ((type !== "category" && type !== "action") || !id) {
      return null;
    }
    return { type, id: Number(id) };
  }, [targetValue]);

  const targetName = target
    ? target.type === "category"
      ? `カテゴリ「${
          data.categories.find((c) => c.id === target.id)?.name ?? ""
        }」`
      : `「${data.actions.find((a) => a.id === target.id)?.name ?? ""}」`
    : "";

  const checkSeries = useMemo(
    () => (target ? buildCheckSeries(data, unit, target) : new Map()),
    [data, unit, target]
  );

  const rows = useMemo(
    () =>
      entities
        .map((entity) => {
          const values: number[] = checkSeries.get(entity.key) ?? [];
          return { entity, values, total: sum(values, cutoffIndex) };
        })
        .sort((a, b) => b.total - a.total),
    [entities, checkSeries, cutoffIndex]
  );

  const dailyTotals = visibleDays.map((_, index) =>
    rows.reduce((total, row) => total + (row.values[index] ?? 0), 0)
  );
  const checkedEntityCount = rows.filter((row) => row.total > 0).length;

  // ユーザー単位でアクション 1 つを見るときは、1 日に 1 回しかチェックできないので ✓ で表す
  const showAsCheckMark = unit === "user" && target?.type === "action";

  if (!target) {
    return <Empty message="このイベントにはアクションがありません"></Empty>;
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="見たいカテゴリ・アクション">
          <Select
            className="w-80"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          >
            <optgroup label="カテゴリ（中のアクションをまとめて数える）">
              {data.categories.map((category) => (
                <option key={category.id} value={`category:${category.id}`}>
                  {category.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="アクション">
              {data.actions.map((action) => (
                <option key={action.id} value={`action:${action.id}`}>
                  {action.name}（{action.point}pt）
                </option>
              ))}
            </optgroup>
          </Select>
        </Field>
        <span className="text-sm pb-1">
          {data.days[cutoffIndex]} までに、
          <b>
            {checkedEntityCount}
            {unit === "user" ? "人" : "チーム"}
          </b>
          が合計 <b>{sum(dailyTotals, cutoffIndex).toLocaleString()}回</b>
          チェック
        </span>
      </div>
      <Panel title={`${targetName}の日ごとのチェック回数（全体）`}>
        <ColumnChart
          days={visibleDays}
          values={dailyTotals}
          seriesName="チェック回数"
          unitLabel="回"
        ></ColumnChart>
      </Panel>
      <Panel
        title={`${targetName}にチェックを入れた${
          unit === "user" ? "ユーザー" : "チーム"
        }`}
        note={
          unit === "team"
            ? "チームの数字は、メンバーがチェックを入れた回数の合計です。"
            : undefined
        }
      >
        <ScrollTable>
          <thead>
            <tr>
              <Th sticky>{unit === "user" ? "ユーザー" : "チーム"}</Th>
              <Th right>{data.days[cutoffIndex]} までの合計</Th>
              {visibleDays.map((day) => (
                <Th key={day} right>
                  {formatDay(day)}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.entity.key} className="border-t">
                <Td sticky>
                  <EntityName entity={row.entity}></EntityName>
                </Td>
                <Td right bold muted={row.total === 0}>
                  {row.total.toLocaleString()}回
                </Td>
                {visibleDays.map((day, index) => {
                  const value = row.values[index] ?? 0;
                  return (
                    <Td key={day} right muted={value === 0}>
                      {value === 0 ? "–" : showAsCheckMark ? "✓" : value}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </ScrollTable>
        {rows.length === 0 && <Empty></Empty>}
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// チェック回数（対象 × アクション）
// ---------------------------------------------------------------------------
function CountsView({ data, unit, entities, cutoffIndex }: ViewProps) {
  const counts = useMemo(
    () => buildActionCounts(data, unit, cutoffIndex),
    [data, unit, cutoffIndex]
  );

  const rows = useMemo(
    () =>
      entities
        .map((entity) => {
          const byAction = counts.get(entity.key) ?? new Map<number, number>();
          let total = 0;
          for (const value of byAction.values()) {
            total += value;
          }
          return { entity, byAction, total };
        })
        .sort((a, b) => b.total - a.total),
    [entities, counts]
  );

  const categoryNames = new Map(data.categories.map((c) => [c.id, c.name]));
  const actionTotals = data.actions.map((action) => ({
    key: String(action.id),
    label: action.name,
    note: categoryNames.get(action.categoryId),
    value: rows.reduce(
      (total, row) => total + (row.byAction.get(action.id) ?? 0),
      0
    ),
  }));

  // 見出しでカテゴリをまとめるため、カテゴリごとのアクション数を数える
  const categoryGroups = data.categories
    .map((category) => ({
      category,
      count: data.actions.filter((a) => a.categoryId === category.id).length,
    }))
    .filter((group) => group.count > 0);

  if (data.actions.length === 0) {
    return <Empty message="このイベントにはアクションがありません"></Empty>;
  }

  return (
    <>
      <Panel
        title={`アクションごとのチェック回数（全体、${data.days[cutoffIndex]} まで）`}
      >
        <RankedBars items={actionTotals} unitLabel="回"></RankedBars>
      </Panel>
      <Panel
        title={`${
          unit === "user" ? "ユーザー" : "チーム"
        }ごとの、アクション別のチェック回数（${data.days[cutoffIndex]} まで）`}
      >
        <ScrollTable>
          <thead>
            <tr>
              <Th sticky rowSpan={2}>
                {unit === "user" ? "ユーザー" : "チーム"}
              </Th>
              <Th right rowSpan={2}>
                合計
              </Th>
              {categoryGroups.map((group) => (
                <th
                  key={group.category.id}
                  colSpan={group.count}
                  className="px-3 py-1 text-xs font-bold text-left border-l bg-slate-50 whitespace-nowrap"
                >
                  {group.category.name}
                </th>
              ))}
            </tr>
            <tr>
              {data.actions.map((action) => (
                <th
                  key={action.id}
                  className="px-3 py-1 text-xs font-medium text-right border-l align-bottom min-w-[5rem] max-w-[9rem]"
                >
                  <span className="block break-words whitespace-normal">
                    {action.name}
                  </span>
                  <span className="text-muted-foreground">
                    {action.point}pt
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.entity.key} className="border-t">
                <Td sticky>
                  <EntityName entity={row.entity}></EntityName>
                </Td>
                <Td right bold muted={row.total === 0}>
                  {row.total.toLocaleString()}回
                </Td>
                {data.actions.map((action) => {
                  const value = row.byAction.get(action.id) ?? 0;
                  return (
                    <Td key={action.id} right muted={value === 0}>
                      {value === 0 ? "–" : value}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </ScrollTable>
        {rows.length === 0 && <Empty></Empty>}
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// 個別の記録
// ---------------------------------------------------------------------------
function DetailView({
  data,
  unit,
  entities,
  cutoffIndex,
  visibleDays,
}: ViewProps & { visibleDays: string[] }) {
  const [selectedKey, setSelectedKey] = useState(entities[0]?.key ?? "");
  const [chartMetric, setChartMetric] = useState<"points" | "steps">("points");

  // 対象の一覧が変わって選択中のものが無くなったら、先頭を選び直す
  useEffect(() => {
    if (!entities.some((entity) => entity.key === selectedKey)) {
      setSelectedKey(entities[0]?.key ?? "");
    }
  }, [entities, selectedKey]);

  const pointSeries = useMemo(() => buildPointSeries(data, unit), [data, unit]);
  const dailyActions = useMemo(
    () => buildDailyActions(data, unit, selectedKey),
    [data, unit, selectedKey]
  );

  const entity = entities.find((e) => e.key === selectedKey);
  const series = pointSeries.get(selectedKey);
  const actionById = new Map(data.actions.map((a) => [a.id, a]));

  if (!entity || !series) {
    return <Empty></Empty>;
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <Field label={unit === "user" ? "ユーザー" : "チーム"}>
          <Select
            className="w-72"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {entities.map((e) => (
              <option key={e.key} value={e.key}>
                {e.name}
                {e.note ? `（${e.note}）` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <span className="text-sm pb-1">
          {data.days[cutoffIndex]} までの合計{" "}
          <b>{(series.cumulative[cutoffIndex] ?? 0).toLocaleString()}pt</b>
          （歩数 {(series.cumulativeSteps[cutoffIndex] ?? 0).toLocaleString()}
          歩）
        </span>
      </div>
      <Panel
        title={`${entity.name}の日ごとの${
          chartMetric === "steps" ? "歩数" : "ポイント"
        }`}
        action={
          <Segmented
            options={[
              { value: "points", label: "ポイント" },
              { value: "steps", label: "歩数" },
            ]}
            value={chartMetric}
            onChange={(value) => setChartMetric(value as "points" | "steps")}
          ></Segmented>
        }
      >
        <ColumnChart
          days={visibleDays}
          values={(chartMetric === "steps" ? series.steps : series.daily).slice(
            0,
            cutoffIndex + 1
          )}
          seriesName={chartMetric === "steps" ? "その日の歩数" : "その日のポイント"}
          unitLabel={chartMetric === "steps" ? "歩" : "pt"}
        ></ColumnChart>
      </Panel>
      <Panel
        title={`${entity.name}の日ごとの記録`}
        note={
          unit === "team"
            ? "「×2」などは、その日にチェックを入れたメンバーの人数です。"
            : undefined
        }
      >
        <ScrollTable>
          <thead>
            <tr>
              <Th sticky>日付</Th>
              <Th>チェックしたアクション</Th>
              <Th right>アクション</Th>
              <Th right>歩数</Th>
              <Th right>その日のポイント</Th>
              <Th right>その日までの合計</Th>
              <Th right>その日までの歩数</Th>
            </tr>
          </thead>
          <tbody>
            {visibleDays.map((day, index) => {
              const actions = [...dailyActions[index].entries()];
              return (
                <tr key={day} className="border-t align-top">
                  <Td sticky>{day}</Td>
                  <td className="px-3 py-1.5 text-sm min-w-[16rem]">
                    {actions.length === 0 ? (
                      <span className="text-muted-foreground">–</span>
                    ) : (
                      <ul className="flex flex-wrap gap-1">
                        {actions.map(([actionId, count]) => {
                          const action = actionById.get(actionId);
                          return (
                            <li
                              key={actionId}
                              className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs"
                            >
                              {action?.name ?? "不明なアクション"}
                              <span className="text-muted-foreground ml-1">
                                {action?.point ?? 0}pt
                                {unit === "team" && ` ×${count}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </td>
                  <Td right muted={series.actionPoints[index] === 0}>
                    {series.actionPoints[index]}pt
                  </Td>
                  <Td right muted={series.steps[index] === 0}>
                    {series.steps[index].toLocaleString()}歩
                  </Td>
                  <Td right bold muted={series.daily[index] === 0}>
                    {series.daily[index]}pt
                  </Td>
                  <Td right>{series.cumulative[index].toLocaleString()}pt</Td>
                  <Td right>
                    {series.cumulativeSteps[index].toLocaleString()}歩
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </ScrollTable>
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// 小さな部品
// ---------------------------------------------------------------------------
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <span className="text-foreground">{children}</span>
    </label>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="inline-flex h-8 items-center rounded-md bg-slate-200 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 rounded px-3 text-sm text-muted-foreground",
            value === option.value && "bg-background text-foreground shadow"
          )}
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}

function Panel({
  title,
  note,
  action,
  children,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-md p-3 flex flex-col space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-sm">{title}</h3>
        {action}
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {children}
    </section>
  );
}

function ScrollTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-max min-w-full border-collapse">{children}</table>
    </div>
  );
}

function Th({
  children,
  right = false,
  sticky = false,
  rowSpan,
}: {
  children: ReactNode;
  right?: boolean;
  sticky?: boolean;
  rowSpan?: number;
}) {
  return (
    <th
      rowSpan={rowSpan}
      className={cn(
        "px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap bg-slate-50",
        right ? "text-right" : "text-left",
        sticky && "sticky left-0 z-[1]"
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right = false,
  sticky = false,
  bold = false,
  muted = false,
}: {
  children: ReactNode;
  right?: boolean;
  sticky?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-1.5 text-sm whitespace-nowrap tabular-nums",
        right && "text-right",
        sticky && "sticky left-0 z-[1] bg-white",
        bold && "font-bold",
        muted && "text-slate-400"
      )}
    >
      {children}
    </td>
  );
}

function EntityName({ entity }: { entity: Entity }) {
  return (
    <span>
      {entity.name}
      {entity.note && (
        <span className="text-xs text-muted-foreground ml-1">
          {entity.note}
        </span>
      )}
    </span>
  );
}

function Empty({ message }: { message?: string }) {
  return (
    <p className="text-sm text-muted-foreground p-2">
      {message ?? "表示できる記録がありません"}
    </p>
  );
}
