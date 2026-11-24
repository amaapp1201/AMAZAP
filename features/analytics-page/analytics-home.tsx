"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
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
  DEFAULT_SERIES,
  RankedBars,
  SeriesSwatch,
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
  // 表の並び順。タブや単位を切り替えても同じ並びのままにする
  const [sort, setSort] = useState<SortState>({ key: "total", desc: true });
  // グラフに出す対象の選択。ユーザー単位とチーム単位で別々に覚えておき、
  // ポイントと歩数のタブを行き来しても同じ選択のままにする。null はまだ選び直していない状態
  const [selectedByUnit, setSelectedByUnit] = useState<
    Record<Unit, string[] | null>
  >({ user: null, team: null });

  const entities = useMemo(() => listEntities(data, unit), [data, unit]);
  const visibleDays = useMemo(
    () => data.days.slice(0, cutoffIndex + 1),
    [data.days, cutoffIndex],
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
              view === item.id && "bg-background text-foreground shadow",
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
          metric={view}
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          visibleDays={visibleDays}
          sort={sort}
          onSort={setSort}
          selectedKeys={selectedByUnit[unit]}
          onSelectedKeysChange={(keys) =>
            setSelectedByUnit((current) => ({ ...current, [unit]: keys }))
          }
        ></PointsView>
      )}
      {view === "checks" && (
        <ChecksView
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          visibleDays={visibleDays}
          sort={sort}
          onSort={setSort}
        ></ChecksView>
      )}
      {view === "counts" && (
        <CountsView
          data={data}
          unit={unit}
          entities={entities}
          cutoffIndex={cutoffIndex}
          sort={sort}
          onSort={setSort}
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

// 表の並び順。key は "total"（合計）、"name"（名前）、"team"（ユーザー単位のときの所属チーム）のほか、
// "second"（歩数の合計や 1 日平均）、"day:3"（日付の列）、"action:5"（アクションの列）のような列の名前
type SortState = { key: string; desc: boolean };

type SortProps = {
  sort: SortState;
  onSort: (sort: SortState) => void;
};

// 表の行を並べ替える。同じ値のものは名前順にして、押すたびに並びが揺れないようにする
function sortRows<
  T extends {
    entity: Entity;
    total: number;
    // 合計以外の、数字で並べ替えられる列の値
    sortValue?: (key: string) => number | undefined;
  },
>(rows: T[], sort: SortState, unit: Unit): T[] {
  const byName = (a: T, b: T) =>
    a.entity.name.localeCompare(b.entity.name, "ja");
  // チーム単位では「チーム」と「名前」は同じ意味になる
  const key = unit === "team" && sort.key === "team" ? "name" : sort.key;
  const direction = sort.desc ? -1 : 1;

  return [...rows].sort((a, b) => {
    let result = 0;
    if (key === "team") {
      result = (a.entity.note ?? "").localeCompare(b.entity.note ?? "", "ja");
    } else if (key === "name") {
      result = byName(a, b);
    } else {
      // その表に無い列が指定されているとき（別のタブで選んだ列など）は、合計で並べる
      const valueOf = (row: T) =>
        key === "total" ? row.total : (row.sortValue?.(key) ?? row.total);
      result = valueOf(a) - valueOf(b);
    }
    return result !== 0 ? result * direction : byName(a, b);
  });
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
  sort,
  onSort,
  selectedKeys: storedSelectedKeys,
  onSelectedKeysChange,
}: ViewProps &
  SortProps & {
    visibleDays: string[];
    metric: "points" | "steps";
    selectedKeys: string[] | null;
    onSelectedKeysChange: (keys: string[]) => void;
  }) {
  const [mode, setMode] = useState<"cumulative" | "daily">("cumulative");
  const pointSeries = useMemo(() => buildPointSeries(data, unit), [data, unit]);

  const isSteps = metric === "steps";
  const metricName = isSteps ? "歩数" : "ポイント";
  const unitLabel = isSteps ? "歩" : "pt";

  const rows = useMemo(
    () =>
      sortRows(
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
          .map((row) => ({
            ...row,
            sortValue: (key: string) => {
              if (key === "second") {
                // ポイントのタブでは歩数の合計、歩数のタブでは 1 日平均
                return isSteps
                  ? row.recordedDays === 0
                    ? 0
                    : row.steps / row.recordedDays
                  : row.steps;
              }
              if (key.startsWith("day:")) {
                return row.daily[Number(key.slice(4))];
              }
              return undefined;
            },
          })),
        sort,
        unit,
      ),
    [entities, pointSeries, cutoffIndex, isSteps, sort, unit],
  );

  // まだ選び直していないときにグラフへ出す対象。ポイントの合計が多い順に上限まで。
  // 歩数のタブでも同じ顔ぶれになるよう、ここは常にポイントで決める
  const defaultKeys = useMemo(
    () =>
      entities
        .map((entity) => ({
          key: entity.key,
          points: pointSeries.get(entity.key)?.cumulative[cutoffIndex] ?? 0,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, DEFAULT_SERIES)
        .map((item) => item.key),
    [entities, pointSeries, cutoffIndex],
  );
  const selectedKeys = storedSelectedKeys ?? defaultKeys;

  const toggle = (key: string) => {
    onSelectedKeysChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key],
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
        cutoffIndex + 1,
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
        action={
          <span className="inline-flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              グラフに表示: {selectedKeys.length}件
            </span>
            <button
              type="button"
              className="rounded border px-2 py-1 hover:bg-slate-100"
              onClick={() =>
                onSelectedKeysChange([
                  // すでに選んでいるものの順（色）は変えず、残りを表の並び順で足す
                  ...selectedKeys,
                  ...rows
                    .map((row) => row.entity.key)
                    .filter((key) => !selectedKeys.includes(key)),
                ])
              }
            >
              すべて選ぶ
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1 hover:bg-slate-100"
              onClick={() => onSelectedKeysChange([])}
            >
              すべて外す
            </button>
          </span>
        }
        note={
          isSteps
            ? "グラフに出す対象は、チェックボックスでいくつでも選べます。「1 日平均」は、記録のある日だけで割った値です。"
            : "グラフに出す対象は、チェックボックスでいくつでも選べます。ポイントはランキングと同じ計算です（アクションのポイント + 歩数の合計 1000 歩ごとに 1pt）。"
        }
      >
        <ScrollTable>
          <thead>
            <tr>
              <Th sticky>
                <EntitySortButtons
                  unit={unit}
                  sort={sort}
                  onSort={onSort}
                ></EntitySortButtons>
              </Th>
              <Th right>
                <SortButton
                  label={`${data.days[cutoffIndex]} までの合計`}
                  sortKey="total"
                  sort={sort}
                  onSort={onSort}
                ></SortButton>
              </Th>
              <Th right>
                <SortButton
                  label={isSteps ? "1 日平均" : "歩数の合計"}
                  sortKey="second"
                  sort={sort}
                  onSort={onSort}
                ></SortButton>
              </Th>
              {visibleDays.map((day, index) => (
                <Th key={day} right>
                  <SortButton
                    label={formatDay(day)}
                    sortKey={`day:${index}`}
                    sort={sort}
                    onSort={onSort}
                    compact
                  ></SortButton>
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
                        onChange={() => toggle(row.entity.key)}
                        aria-label={`${row.entity.name}をグラフに表示`}
                      />
                      {/* 選んでいない行も同じ幅を空けて、名前の位置をそろえる */}
                      <span className="inline-flex w-[22px] shrink-0">
                        {isSelected && (
                          <SeriesSwatch index={selectedIndex}></SeriesSwatch>
                        )}
                      </span>
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
                            row.steps / row.recordedDays,
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
  sort,
  onSort,
}: ViewProps & SortProps & { visibleDays: string[] }) {
  // "category:1" や "action:3" の形で、数える対象を持つ
  const [targetValue, setTargetValue] = useState(() =>
    data.categories[0]
      ? `category:${data.categories[0].id}`
      : data.actions[0]
        ? `action:${data.actions[0].id}`
        : "",
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
    [data, unit, target],
  );

  const rows = useMemo(
    () =>
      sortRows(
        entities.map((entity) => {
          const values: number[] = checkSeries.get(entity.key) ?? [];
          return {
            entity,
            values,
            total: sum(values, cutoffIndex),
            sortValue: (key: string) =>
              key.startsWith("day:")
                ? (values[Number(key.slice(4))] ?? 0)
                : undefined,
          };
        }),
        sort,
        unit,
      ),
    [entities, checkSeries, cutoffIndex, sort, unit],
  );

  const dailyTotals = visibleDays.map((_, index) =>
    rows.reduce((total, row) => total + (row.values[index] ?? 0), 0),
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
              <Th sticky>
                <EntitySortButtons
                  unit={unit}
                  sort={sort}
                  onSort={onSort}
                ></EntitySortButtons>
              </Th>
              <Th right>
                <SortButton
                  label={`${data.days[cutoffIndex]} までの合計`}
                  sortKey="total"
                  sort={sort}
                  onSort={onSort}
                ></SortButton>
              </Th>
              {visibleDays.map((day, index) => (
                <Th key={day} right>
                  <SortButton
                    label={formatDay(day)}
                    sortKey={`day:${index}`}
                    sort={sort}
                    onSort={onSort}
                    compact
                  ></SortButton>
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
function CountsView({
  data,
  unit,
  entities,
  cutoffIndex,
  sort,
  onSort,
}: ViewProps & SortProps) {
  const counts = useMemo(
    () => buildActionCounts(data, unit, cutoffIndex),
    [data, unit, cutoffIndex],
  );

  const rows = useMemo(
    () =>
      sortRows(
        entities.map((entity) => {
          const byAction = counts.get(entity.key) ?? new Map<number, number>();
          let total = 0;
          for (const value of byAction.values()) {
            total += value;
          }
          return {
            entity,
            byAction,
            total,
            sortValue: (key: string) =>
              key.startsWith("action:")
                ? (byAction.get(Number(key.slice(7))) ?? 0)
                : undefined,
          };
        }),
        sort,
        unit,
      ),
    [entities, counts, sort, unit],
  );

  const categoryNames = new Map(data.categories.map((c) => [c.id, c.name]));
  const actionTotals = data.actions.map((action) => ({
    key: String(action.id),
    label: action.name,
    note: categoryNames.get(action.categoryId),
    value: rows.reduce(
      (total, row) => total + (row.byAction.get(action.id) ?? 0),
      0,
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
                <EntitySortButtons
                  unit={unit}
                  sort={sort}
                  onSort={onSort}
                ></EntitySortButtons>
              </Th>
              <Th right rowSpan={2}>
                <SortButton
                  label="合計"
                  sortKey="total"
                  sort={sort}
                  onSort={onSort}
                ></SortButton>
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
                  <span className="block">
                    <SortButton
                      label="並べ替え"
                      sortKey={`action:${action.id}`}
                      sort={sort}
                      onSort={onSort}
                    ></SortButton>
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
    [data, unit, selectedKey],
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
                {e.period ? ` 入力期間 ${e.period}` : ""}
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
            cutoffIndex + 1,
          )}
          seriesName={
            chartMetric === "steps" ? "その日の歩数" : "その日のポイント"
          }
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

// 表の見出しに置く、並べ替えのボタン。並べ替え中の列には矢印を出す
function SortButton({
  label,
  sortKey,
  sort,
  onSort,
  compact = false,
}: SortProps & {
  label: string;
  sortKey: string;
  // 日付の列のように数が多いところでは、並べ替え中のときだけ矢印を出して幅を取らない
  compact?: boolean;
}) {
  const isActive = sort.key === sortKey;
  const isText = sortKey === "name" || sortKey === "team";
  return (
    <button
      type="button"
      title={`${label}で並べ替え`}
      aria-pressed={isActive}
      onClick={() =>
        onSort(
          isActive
            ? { key: sortKey, desc: !sort.desc }
            : // 数字の列は多い順、名前とチームは五十音順から始める
              { key: sortKey, desc: !isText },
        )
      }
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 -mx-1 hover:bg-slate-200",
        isActive && "text-foreground font-bold",
      )}
    >
      {label}
      {/* 矢印の文字は環境によって絵文字で表示されるため、アイコンを使う */}
      {isActive ? (
        sort.desc ? (
          <ArrowDown className="h-3 w-3" aria-hidden />
        ) : (
          <ArrowUp className="h-3 w-3" aria-hidden />
        )
      ) : (
        !compact && <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
      )}
    </button>
  );
}

// 1 列目の見出し。ユーザー単位のときは、名前と所属チームのどちらでも並べ替えられる
function EntitySortButtons({ unit, sort, onSort }: SortProps & { unit: Unit }) {
  if (unit === "team") {
    return (
      <SortButton
        label="チーム"
        sortKey="name"
        sort={sort.key === "team" ? { ...sort, key: "name" } : sort}
        onSort={onSort}
      ></SortButton>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <SortButton
        label="名前"
        sortKey="name"
        sort={sort}
        onSort={onSort}
      ></SortButton>
      <SortButton
        label="チーム"
        sortKey="team"
        sort={sort}
        onSort={onSort}
      ></SortButton>
    </span>
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
            value === option.value && "bg-background text-foreground shadow",
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
        sticky && "sticky left-0 z-[1]",
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
        muted && "text-slate-400",
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
      {entity.period && (
        <span
          className="ml-1 rounded border px-1 text-xs text-muted-foreground"
          title="このユーザーに設定された入力期間"
        >
          入力期間 {entity.period}
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
