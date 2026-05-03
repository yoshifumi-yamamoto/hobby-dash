"use client";

import { useMemo, useState } from "react";

import type { InstructorMonthlySeries } from "@/types/record";

const INSTRUCTOR_COLORS = ["#eef3ff", "#d1ddff", "#b7c8ff", "#94abff", "#758aee", "#5f70c7", "#49536a"];

function buildSparkline(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
}

export function InstructorTrendCard({ series }: { series: InstructorMonthlySeries[] }) {
  const [visible, setVisible] = useState<string[]>(series.slice(0, 4).map((item) => item.label));

  const monthLabels = series[0]?.points.map((point) => point.month.slice(2)) ?? [];
  const max = Math.max(...series.flatMap((item) => item.points.map((point) => point.count)), 1);

  const visibleSeries = useMemo(() => {
    if (visible.length === 0) {
      return series.slice(0, 1);
    }

    return series.filter((item) => visible.includes(item.label));
  }, [series, visible]);

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
          <p className="muted chartSummary">上位7名までを月単位で重ね、表示を切り替えながら好みの推移を追えます。</p>
        </div>
      </div>
      <div className="toggleGrid">
        {series.map((item, index) => {
          const active = visible.includes(item.label);
          return (
            <button
              className={`toggleChip${active ? " toggleChip--active" : ""}`}
              key={item.label}
              onClick={() => toggle(item.label)}
              type="button"
            >
              <span className="pieSwatch" style={{ backgroundColor: INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length] }} />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="stack instructorTrendStack">
        {visibleSeries.map((item, index) => {
          const points = item.points.map((point, pointIndex) => ({
            ...point,
            x: 16 + pointIndex * (item.points.length <= 1 ? 0 : 300 / (item.points.length - 1)),
            y: 82 - Math.round((point.count / max) * 54)
          }));
          const path = buildSparkline(points);
          const share = item.total / Math.max(series.reduce((sum, row) => sum + row.total, 0), 1);

          return (
            <div className="instructorTrendRow" key={item.label}>
              <div className="rankMeta">
                <span className="rankName">{item.label}</span>
                <strong className="rankValue">{item.total}回 {`${(share * 100).toFixed(1)}%`}</strong>
              </div>
              <svg className="instructorSparkline" viewBox="0 0 332 104" aria-label={`${item.label} monthly trend`} role="img">
                {[0, 1, 2].map((step) => (
                  <line className="chartGridLine" key={step} x1="12" x2="320" y1={20 + step * 24} y2={20 + step * 24} />
                ))}
                <path
                  d={path}
                  fill="none"
                  pathLength={1}
                  stroke={INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                />
                {points.map((point, pointIndex) => (
                  <g key={point.month}>
                    <circle cx={point.x} cy={point.y} fill={INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length]} r="4" />
                    {pointIndex === points.length - 1 ? (
                      <text className="chartPointValue" x={point.x} y={point.y - 10}>{point.count}</text>
                    ) : null}
                  </g>
                ))}
                {points.map((point, pointIndex) => (
                  <text className="chartAxisLabel" key={`${point.month}-label`} x={point.x} y="96">
                    {monthLabels[pointIndex]}
                  </text>
                ))}
              </svg>
            </div>
          );
        })}
      </div>
    </article>
  );
}
