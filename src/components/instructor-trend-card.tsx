"use client";

import { useMemo, useState } from "react";

import type { InstructorMonthlySeries } from "@/types/record";

const INSTRUCTOR_COLORS = ["#eef3ff", "#d1ddff", "#b7c8ff", "#94abff", "#758aee", "#5f70c7", "#49536a"];

function buildLine(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
}

export function InstructorTrendCard({ series }: { series: InstructorMonthlySeries[] }) {
  const [visible, setVisible] = useState<string[]>(series.slice(0, 4).map((item) => item.label));
  const monthLabels = series[0]?.points.map((point) => point.month.slice(2)) ?? [];

  const visibleSeries = useMemo(() => {
    if (visible.length === 0) {
      return series.slice(0, 1);
    }

    return series.filter((item) => visible.includes(item.label));
  }, [series, visible]);

  const max = Math.max(...visibleSeries.flatMap((item) => item.points.map((point) => point.count)), 1);
  const total = series.reduce((sum, item) => sum + item.total, 0);
  const yAxisTicks = [max, Math.max(Math.round(max * 0.66), 1), Math.max(Math.round(max * 0.33), 1), 0];

  function toggle(label: string) {
    setVisible((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  return (
    <article className="panel instructorTrendPanel">
      <div className="panelHeader">
        <div>
          <h2>インストラクター月次推移</h2>
          <p className="muted chartSummary">上位7名までを1つのグラフに重ね、表示を切り替えながら月ごとの偏りを比較できます。</p>
        </div>
      </div>
      <div className="toggleGrid">
        {series.map((item, index) => {
          const active = visible.includes(item.label);
          const share = item.total / Math.max(total, 1);

          return (
            <button
              className={`toggleChip${active ? " toggleChip--active" : ""}`}
              key={item.label}
              onClick={() => toggle(item.label)}
              type="button"
            >
              <span className="pieSwatch" style={{ backgroundColor: INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length] }} />
              <span>{item.label}</span>
              <strong className="toggleChipValue">{item.total}回 {`${(share * 100).toFixed(1)}%`}</strong>
            </button>
          );
        })}
      </div>
      <div className="chartCard instructorTrendChartCard">
        <svg className="lineChart" viewBox="0 0 680 250" aria-label="Instructor monthly trend" role="img">
          {yAxisTicks.map((tick, index) => (
            <g key={tick}>
              <line className="chartGridLine" x1="46" x2="656" y1={42 + index * 42} y2={42 + index * 42} />
              <text className="chartYAxisLabel" x="36" y={46 + index * 42}>{tick}</text>
            </g>
          ))}
          {visibleSeries.map((item, index) => {
            const color = INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length];
            const points = item.points.map((point, pointIndex) => ({
              ...point,
              x: 52 + pointIndex * (item.points.length <= 1 ? 0 : 590 / (item.points.length - 1)),
              y: 176 - Math.round((point.count / max) * 112)
            }));
            const path = buildLine(points);

            return (
              <g key={item.label}>
                <path
                  d={path}
                  fill="none"
                  opacity="0.2"
                  stroke={color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="10"
                />
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                />
                {points.map((point, pointIndex) => (
                  <g key={`${item.label}-${point.month}`}>
                    <circle cx={point.x} cy={point.y} fill={color} r="4.5" />
                    {pointIndex === points.length - 1 ? (
                      <>
                        <text className="chartSeriesLabel" x={point.x + 10} y={point.y - 8}>{item.label}</text>
                        <text className="chartSeriesValue" x={point.x + 10} y={point.y + 10}>{point.count}回</text>
                      </>
                    ) : null}
                  </g>
                ))}
              </g>
            );
          })}
          {monthLabels.map((label, index) => (
            <text
              className="chartAxisLabel"
              key={label}
              x={52 + index * (monthLabels.length <= 1 ? 0 : 590 / (monthLabels.length - 1))}
              y="226"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
}
