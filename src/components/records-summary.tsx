import Link from "next/link";

import type { GroupStat } from "@/types/record";

const STUDIO_PIE_COLORS = ["#88a8ff", "#5b6576", "#4a5361", "#3e4652"];
const PROGRAM_PIE_COLORS = ["#f2f6ff", "#c2d1ff", "#8fa8ff", "#6b83eb", "#5164be", "#465063", "#3a4350", "#2f3742"];
const THEME_PIE_COLORS = ["#b8cbff", "#8ea8ff", "#7087ee", "#596ace", "#d4b36e", "#8abcae", "#6d7788", "#596170"];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
}

export function PieCard(
  {
    title,
    stats,
    colors,
    centerLabel,
    centerValue,
    summary,
    detailHref
  }: {
    title: string;
    stats: GroupStat[];
    colors: string[];
    centerLabel: string;
    centerValue: string;
    summary?: string;
    detailHref?: string;
  }
) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);
  let startAngle = 0;

  return (
    <article className="panel piePanel">
      <div className="panelHeader">
        <div>
          <h2>{title}</h2>
          {summary ? <p className="muted chartSummary">{summary}</p> : null}
        </div>
        <div className="panelHeaderMeta">
          <strong className="chartTotal">{total}件</strong>
          {detailHref ? <Link className="textToggle" href={detailHref}>詳細を見る</Link> : null}
        </div>
      </div>
      <div className="pieLayout">
        <div className="pieChartWrap">
          <svg className="pieChart" viewBox="0 0 220 220" aria-label={title} role="img">
            {stats.map((item, index) => {
              const angle = total === 0 ? 0 : (item.count / total) * 360;
              const path = describeArc(110, 110, 88, startAngle, startAngle + angle);
              startAngle += angle;

              return (
                <path
                  key={item.label}
                  d={path}
                  fill={colors[index % colors.length]}
                  stroke="rgba(10, 10, 11, 0.92)"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="110" cy="110" fill="rgba(10, 10, 11, 0.94)" r="52" />
            <text className="pieCenterValue" x="110" y="102">{centerValue}</text>
            <text className="pieCenterLabel" x="110" y="123">{centerLabel}</text>
          </svg>
        </div>
        <div className="stack pieLegend">
          {stats.map((item, index) => {
            const percentage = total === 0 ? 0 : (item.count / total) * 100;
            return (
              <div className="row statRow pieLegendRow" key={item.label}>
                <span className="statRowLabel pieLegendLabel">
                  <span
                    className="pieSwatch"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  {item.label}
                </span>
                <strong className="statRowCount">{item.count}回 {percentage.toFixed(1)}%</strong>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function InstructorBarCard({ title, stats, detailHref }: { title: string; stats: GroupStat[]; detailHref?: string }) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(...stats.map((item) => item.count), 1);

  return (
    <article className="panel chartPanelRank">
      <div className="panelHeader">
        <div>
          <h2>{title}</h2>
          <p className="muted chartSummary">上位8名を表示し、残りはその他にまとめています。</p>
        </div>
        <div className="panelHeaderMeta">
          <strong className="chartTotal">{total}件</strong>
          {detailHref ? <Link className="textToggle" href={detailHref}>詳細を見る</Link> : null}
        </div>
      </div>
      <div className="stack rankStack">
        {stats.map((item, index) => {
          const percentage = total === 0 ? 0 : (item.count / total) * 100;
          return (
            <div className="rankRow" key={item.label}>
              <div className="rankMeta">
                <span className="rankName">{index + 1}. {item.label || "未取得"}</span>
                <strong className="rankValue">{item.count}回 {percentage.toFixed(1)}%</strong>
              </div>
              <div className="rankBarTrack">
                <div className="rankBarFill" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function getStudioPieColors() {
  return STUDIO_PIE_COLORS;
}

export function getProgramPieColors() {
  return PROGRAM_PIE_COLORS;
}

export function getThemePieColors() {
  return THEME_PIE_COLORS;
}
