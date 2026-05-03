import Link from "next/link";

import type { MonthlySeriesPoint } from "@/types/record";

const PERIOD_OPTIONS = [
  { value: "6", label: "6M" },
  { value: "12", label: "12M" },
  { value: "24", label: "24M" },
  { value: "all", label: "ALL" }
];

function buildTrendPath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
}

function buildPeriodHref(baseHref: string, period: string) {
  const params = new URLSearchParams(baseHref.split("?")[1] ?? "");
  params.set("period", period);
  const path = baseHref.split("?")[0] ?? baseHref;
  return `${path}?${params.toString()}`;
}

export function MonthlyTrendCard(
  {
    title,
    summary,
    stats,
    period,
    baseHref,
    detailHref
  }: {
    title: string;
    summary: string;
    stats: MonthlySeriesPoint[];
    period: string;
    baseHref: string;
    detailHref?: string;
  }
) {
  const max = Math.max(...stats.map((item) => item.count), 1);
  const chartPoints = stats.map((item, index) => ({
    ...item,
    x: 28 + index * (stats.length <= 1 ? 0 : 620 / (stats.length - 1)),
    y: 176 - Math.round((item.count / max) * 116)
  }));
  const path = buildTrendPath(chartPoints);
  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="panel monthlyTrendPanel">
      <div className="panelHeader">
        <div>
          <h2>{title}</h2>
          <p className="muted chartSummary">{summary}</p>
        </div>
        <div className="panelHeaderMeta">
          <strong className="chartTotal">{total}件</strong>
          {detailHref ? <Link className="textToggle" href={detailHref}>詳細を見る</Link> : null}
        </div>
      </div>
      <div className="periodTabs" role="tablist" aria-label={`${title} period`}>
        {PERIOD_OPTIONS.map((option) => (
          <Link
            aria-selected={period === option.value}
            className={`periodTab${period === option.value ? " periodTab--active" : ""}`}
            href={buildPeriodHref(baseHref, option.value)}
            key={option.value}
          >
            {option.label}
          </Link>
        ))}
      </div>
      <div className="chartCard monthlyTrendCard">
        <svg className="lineChart" viewBox="0 0 680 230" aria-label={title} role="img">
          <defs>
            <linearGradient id="records-monthly-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(232,239,255,1)" />
              <stop offset="100%" stopColor="rgba(116,129,255,0.86)" />
            </linearGradient>
            <linearGradient id="records-monthly-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(146,172,255,0.32)" />
              <stop offset="100%" stopColor="rgba(146,172,255,0.02)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((step) => (
            <line className="chartGridLine" key={step} x1="20" x2="660" y1={34 + step * 44} y2={34 + step * 44} />
          ))}
          {chartPoints.length > 0 ? (
            <>
              <path
                className="chartArea"
                d={`${path} L ${chartPoints.at(-1)?.x ?? 28},196 L ${chartPoints[0]?.x ?? 28},196 Z`}
                fill="url(#records-monthly-area)"
              />
              <path className="chartLineGlow" d={path} pathLength={1} />
              <path className="chartLineMain" d={path} pathLength={1} stroke="url(#records-monthly-line)" />
            </>
          ) : null}
          {chartPoints.map((point) => (
            <g key={point.month}>
              <circle className="chartPointHalo" cx={point.x} cy={point.y} r="8" />
              <circle className="chartPoint" cx={point.x} cy={point.y} r="4.5" />
              <text className="chartPointValue" x={point.x} y={point.y - 14}>{point.count}</text>
              <text className="chartAxisLabel" x={point.x} y="216">{point.month.slice(2)}</text>
            </g>
          ))}
        </svg>
      </div>
    </article>
  );
}
