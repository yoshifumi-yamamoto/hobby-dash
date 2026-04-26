import Image from "next/image";
import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { StatBlock } from "@/components/stat-block";
import {
  getAllRecords,
  getCurrentStreakText,
  getGroupedStats,
  getMonthlyStats,
  getRecentRecords,
  getRecentThreeMonthCount
} from "@/lib/records";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allRecords = await getAllRecords();
  const monthly = await getMonthlyStats();
  const recent = await getRecentRecords(3);
  const studios = (await getGroupedStats("studio")).slice(0, 3);
  const programs = (await getGroupedStats("program")).slice(0, 3);
  const streakText = await getCurrentStreakText();
  const recentThreeMonthCount = await getRecentThreeMonthCount();
  const monthlyPreview = monthly.slice(0, 12);
  const maxMonthlyCount = Math.max(...monthlyPreview.map((item) => item.count), 1);
  const monthlySeries = monthlyPreview.slice().reverse();
  const monthlyGraphPoints = monthlySeries.map((item, index) => ({
    month: item.month,
    count: item.count,
    x: 24 + index * 62,
    y: 188 - Math.round((item.count / maxMonthlyCount) * 132)
  }));
  const monthlyGraphPath = monthlyGraphPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`)
    .join(" ");
  const rhythmPoints = monthlyPreview.slice(-8).map((item, index) => ({
    x: index * 48,
    y: 92 - Math.round((item.count / maxMonthlyCount) * 54)
  }));
  const rhythmPath = rhythmPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`)
    .join(" ");

  return (
    <LayoutShell
      title="Overview"
      description="分析より先に、最近動けているか、どこで続いているか、どんなメモが残っているかを軽く見返すための入口です。"
    >
      <section className="heroVisual panel">
        <div className="heroVisualMedia">
          <Image
            alt="Dark indoor cycling studio"
            className="coverImage"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 60vw"
            src="/hero-cycling-dark.png"
          />
        </div>
        <div className="heroVisualCopy">
          <p className="eyebrow">Feelcycle Inspired</p>
          <h2>Rhythm, record, repeat.</h2>
          <p className="copy">
            暗いスタジオの熱量を残したまま、受講履歴、継続、よく乗るプログラムを一画面で追えるようにした個人用ビューです。
          </p>
          <div className="heroVisualMeta">
            <div>
              <span className="metaLabel">Total records</span>
              <strong>{allRecords.length}</strong>
            </div>
            <div>
              <span className="metaLabel">Current streak</span>
              <strong>{streakText}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid statsGrid">
        <StatBlock label="直近3か月の記録数" value={recentThreeMonthCount} helper="積み上がり感をまず確認" />
        <article className="panel statBlock pulseStat">
          <div className="panelHeader">
            <p className="statLabel">Rhythm pulse</p>
            <span className="metaLabel">live</span>
          </div>
          <div className="pulseLayout">
            <div>
              <h2>{streakText}</h2>
              <p className="muted">活動頻度と継続感をひとつの鼓動として見る補助メーターです。</p>
            </div>
            <div className="rhythmMini">
              <svg viewBox="0 0 336 110" aria-label="Rhythm visualization" role="img">
                <defs>
                  <linearGradient id="pulse-line" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(226,234,255,0.98)" />
                    <stop offset="100%" stopColor="rgba(116,129,255,0.72)" />
                  </linearGradient>
                </defs>
                <path className="rhythmShadow" d={rhythmPath} pathLength={1} />
                <path className="rhythmLine" d={rhythmPath} pathLength={1} />
              </svg>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboardGrid">
        <article className="panel chartPanel spotlightPanel">
          <div className="panelHeader">
            <h2>月間の受講履歴</h2>
            <Link href="/records">記録一覧へ</Link>
          </div>
          <div className="chartCard">
            <svg className="lineChart" viewBox="0 0 730 240" aria-label="Monthly attendance chart" role="img">
              <defs>
                <linearGradient id="monthly-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(232,239,255,1)" />
                  <stop offset="100%" stopColor="rgba(116,129,255,0.86)" />
                </linearGradient>
                <linearGradient id="monthly-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(146,172,255,0.32)" />
                  <stop offset="100%" stopColor="rgba(146,172,255,0.02)" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((step) => (
                <line
                  className="chartGridLine"
                  key={step}
                  x1="16"
                  x2="714"
                  y1={32 + step * 52}
                  y2={32 + step * 52}
                />
              ))}
              <path
                className="chartArea"
                d={`${monthlyGraphPath} L ${monthlyGraphPoints.at(-1)?.x ?? 24},214 L ${monthlyGraphPoints[0]?.x ?? 24},214 Z`}
              />
              <path className="chartLineGlow" d={monthlyGraphPath} pathLength={1} />
              <path className="chartLineMain" d={monthlyGraphPath} pathLength={1} />
              {monthlyGraphPoints.map((point) => (
                <g key={point.month}>
                  <circle className="chartPointHalo" cx={point.x} cy={point.y} r="9" />
                  <circle className="chartPoint" cx={point.x} cy={point.y} r="4.5" />
                  <text className="chartPointValue" x={point.x} y={point.y - 14}>{point.count}</text>
                  <text className="chartAxisLabel" x={point.x} y="232">{point.month.slice(2)}</text>
                </g>
              ))}
            </svg>
          </div>
        </article>

        <article className="panel recentPanel tallPanel">
          <div className="panelHeader">
            <h2>直近の記録</h2>
          </div>
          <div className="stack">
            {recent.map((record) => (
              <Link className="cardLink" href={`/records/${encodeURIComponent(record.id)}`} key={record.id}>
                <div className="row">
                  <strong>{record.date}</strong>
                  <span className={`pill pill--${record.intensity || "low"}`}>{record.intensity || "none"}</span>
                </div>
                <h3>{record.program}</h3>
                <p>{record.studio} / {record.startTime}</p>
                <p className="metaLine">{record.instructorName || "インストラクター未取得"}</p>
                <p className="muted">{record.subjectiveMemo}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel visualPanel widePanel">
          <div className="visualCard">
            <Image
              alt="Indoor cycling studio lights"
              className="coverImage"
              fill
              sizes="(max-width: 800px) 100vw, 40vw"
              src="/visual-studio-lights.png"
            />
          </div>
          <div className="visualCaption">
            <span className="metaLabel">Studio mood</span>
            <p>ライブ感のある暗闇空間を、補助ビジュアルとしてページ全体の温度に使います。</p>
          </div>
        </article>

        <article className="panel compactPanel">
          <h2>店舗別の回数</h2>
          <div className="stack">
            {studios.map((item) => (
              <div className="row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.count}回</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel visualPanel compactVisualPanel">
          <div className="visualCard">
            <Image
              alt="Close-up rider on bike"
              className="coverImage"
              fill
              sizes="(max-width: 800px) 100vw, 40vw"
              src="/visual-rider-closeup.png"
            />
          </div>
          <div className="visualCaption">
            <span className="metaLabel">Intensity</span>
            <p>ライダー単体の近接カットは、detail 側にも拡張できる補助素材として使えます。</p>
          </div>
        </article>

        <article className="panel compactPanel">
          <h2>プログラム別の回数</h2>
          <div className="stack">
            {programs.map((item) => (
              <div className="row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.count}回</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </LayoutShell>
  );
}
