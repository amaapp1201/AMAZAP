"use client";

import { useState } from "react";
import { formatDay } from "./aggregate";

// グラフの配色。系列の色は順番を固定し、対象が変わっても並び順で色が決まる。
// 文字は系列の色を使わず、通常の文字色で書く
export const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
const SINGLE_COLOR = "#2a78d6";
const GRID_COLOR = "#e5e5e3";
const AXIS_TEXT = "#6b6a66";

// グラフに同時に出せる系列の上限
export const MAX_SERIES = SERIES_COLORS.length;

const WIDTH = 760;
const HEIGHT = 260;
// 左は、歩数の合計のような 6〜7 桁の目盛りが収まる幅にする
const MARGIN = { top: 16, right: 16, bottom: 28, left: 64 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

// 目盛りを、きりのよい数（1, 2, 5 × 10^n）で 4 本前後にする
function niceTicks(max: number) {
  if (max <= 0) {
    return [0, 1];
  }
  const rough = max / 4;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const step =
    [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? power * 10;
  const roundedStep = Math.max(1, Math.round(step));
  const ticks: number[] = [];
  for (let value = 0; value < max + roundedStep; value += roundedStep) {
    ticks.push(value);
  }
  return ticks;
}

// 横軸の日付ラベルが重ならないよう、間引く間隔を決める
function labelEvery(count: number) {
  return Math.max(1, Math.ceil(count / 10));
}

function YAxis({ ticks, yOf }: { ticks: number[]; yOf: (v: number) => number }) {
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={yOf(tick)}
            y2={yOf(tick)}
            stroke={GRID_COLOR}
            strokeWidth={1}
          />
          <text
            x={MARGIN.left - 8}
            y={yOf(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill={AXIS_TEXT}
          >
            {tick.toLocaleString()}
          </text>
        </g>
      ))}
    </g>
  );
}

function XAxis({ days, xOf }: { days: string[]; xOf: (i: number) => number }) {
  const every = labelEvery(days.length);
  return (
    <g>
      {days.map((day, index) =>
        index % every === 0 ? (
          <text
            key={day}
            x={xOf(index)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize={11}
            fill={AXIS_TEXT}
          >
            {formatDay(day)}
          </text>
        ) : null
      )}
    </g>
  );
}

function Tooltip({
  leftPercent,
  title,
  rows,
}: {
  leftPercent: number;
  title: string;
  rows: { color?: string; label: string; value: string }[];
}) {
  // 右端ではみ出さないよう、右半分では左側に出す
  const alignRight = leftPercent > 55;
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 rounded-md border bg-white px-3 py-2 text-xs shadow-md"
      style={
        alignRight
          ? { right: `${100 - leftPercent + 2}%` }
          : { left: `${leftPercent + 2}%` }
      }
    >
      <div className="font-bold mb-1 whitespace-nowrap">{title}</div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {row.color && (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: row.color }}
            ></span>
          )}
          <span className="text-muted-foreground">{row.label}</span>
          <span className="ml-auto font-bold tabular-nums">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// 日ごとの推移を、対象ごとの折れ線で比べるグラフ（系列は MAX_SERIES 本まで）
export function LineChart({
  days,
  series,
  unitLabel,
}: {
  days: string[];
  series: { key: string; name: string; values: number[] }[];
  unitLabel: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const shown = series.slice(0, MAX_SERIES);
  const max = Math.max(0, ...shown.flatMap((s) => s.values));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];

  const xOf = (index: number) =>
    MARGIN.left +
    (days.length <= 1
      ? PLOT_WIDTH / 2
      : (index / (days.length - 1)) * PLOT_WIDTH);
  const yOf = (value: number) =>
    MARGIN.top + PLOT_HEIGHT - (value / top) * PLOT_HEIGHT;

  if (shown.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        グラフに表示する対象を、下の表のチェックボックスで選んでください。
      </div>
    );
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
        {shown.map((s, index) => (
          <li key={s.key} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[index] }}
            ></span>
            <span>{s.name}</span>
          </li>
        ))}
      </ul>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          role="img"
          aria-label={`${unitLabel}の日ごとの推移`}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
            const ratio = (x - MARGIN.left) / PLOT_WIDTH;
            const index = Math.round(ratio * (days.length - 1));
            setHoverIndex(Math.min(days.length - 1, Math.max(0, index)));
          }}
        >
          <YAxis ticks={ticks} yOf={yOf} />
          <XAxis days={days} xOf={xOf} />
          {hoverIndex !== null && (
            <line
              x1={xOf(hoverIndex)}
              x2={xOf(hoverIndex)}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_HEIGHT}
              stroke={AXIS_TEXT}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {shown.map((s, seriesIndex) => (
            <g key={s.key}>
              <polyline
                fill="none"
                stroke={SERIES_COLORS[seriesIndex]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={s.values
                  .map((value, index) => `${xOf(index)},${yOf(value)}`)
                  .join(" ")}
              />
              {/* 点は、日数が少ないときと、マウスを乗せた日だけ出す */}
              {s.values.map((value, index) =>
                days.length <= 14 || index === hoverIndex ? (
                  <circle
                    key={index}
                    cx={xOf(index)}
                    cy={yOf(value)}
                    r={4}
                    fill={SERIES_COLORS[seriesIndex]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ) : null
              )}
            </g>
          ))}
        </svg>
        {hoverIndex !== null && (
          <Tooltip
            leftPercent={(xOf(hoverIndex) / WIDTH) * 100}
            title={days[hoverIndex]}
            rows={shown.map((s, index) => ({
              color: SERIES_COLORS[index],
              label: s.name,
              value: `${s.values[hoverIndex].toLocaleString()}${unitLabel}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}

// 日ごとの値を、1 系列の縦棒で見せるグラフ
export function ColumnChart({
  days,
  values,
  seriesName,
  unitLabel,
}: {
  days: string[];
  values: number[];
  seriesName: string;
  unitLabel: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(0, ...values);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];

  const band = PLOT_WIDTH / Math.max(1, days.length);
  const barWidth = Math.max(2, Math.min(36, band - 2));
  const xOf = (index: number) => MARGIN.left + band * index + band / 2;
  const yOf = (value: number) =>
    MARGIN.top + PLOT_HEIGHT - (value / top) * PLOT_HEIGHT;
  const baseline = yOf(0);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${seriesName}の日ごとの値`}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <YAxis ticks={ticks} yOf={yOf} />
        <XAxis days={days} xOf={xOf} />
        {values.map((value, index) => {
          const height = baseline - yOf(value);
          const radius = Math.min(4, barWidth / 2, height);
          const x = xOf(index) - barWidth / 2;
          const y = yOf(value);
          return (
            <g key={index}>
              {value > 0 && (
                // 上の角だけを丸め、下は基準線にそろえる
                <path
                  d={`M${x},${baseline} V${y + radius} Q${x},${y} ${
                    x + radius
                  },${y} H${x + barWidth - radius} Q${x + barWidth},${y} ${
                    x + barWidth
                  },${y + radius} V${baseline} Z`}
                  fill={SINGLE_COLOR}
                  opacity={hoverIndex === null || hoverIndex === index ? 1 : 0.5}
                />
              )}
              {/* 棒より広い範囲でマウスを受け取る */}
              <rect
                x={xOf(index) - band / 2}
                y={MARGIN.top}
                width={band}
                height={PLOT_HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(index)}
              />
            </g>
          );
        })}
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={baseline}
          y2={baseline}
          stroke={AXIS_TEXT}
          strokeWidth={1}
        />
      </svg>
      {hoverIndex !== null && (
        <Tooltip
          leftPercent={(xOf(hoverIndex) / WIDTH) * 100}
          title={days[hoverIndex]}
          rows={[
            {
              label: seriesName,
              value: `${values[hoverIndex].toLocaleString()}${unitLabel}`,
            },
          ]}
        />
      )}
    </div>
  );
}

// 項目を値の大きい順に並べた横棒グラフ。棒の右に値を書く
export function RankedBars({
  items,
  unitLabel,
}: {
  items: { key: string; label: string; note?: string; value: number }[];
  unitLabel: string;
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((item) => item.value));

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">表示する項目がありません</div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {sorted.map((item) => (
        <li
          key={item.key}
          className="grid grid-cols-[minmax(0,14rem)_minmax(0,1fr)_4.5rem] items-center gap-2 text-sm"
          title={`${item.label}: ${item.value.toLocaleString()}${unitLabel}`}
        >
          <span className="truncate">
            {item.label}
            {item.note && (
              <span className="text-xs text-muted-foreground ml-1">
                {item.note}
              </span>
            )}
          </span>
          <span className="h-4 bg-slate-100 rounded-sm overflow-hidden">
            <span
              className="block h-full rounded-r"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: SINGLE_COLOR,
              }}
            ></span>
          </span>
          <span className="text-right tabular-nums">
            {item.value.toLocaleString()}
            {unitLabel}
          </span>
        </li>
      ))}
    </ul>
  );
}
