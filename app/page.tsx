import Image from "next/image";
import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { StatBlock } from "@/components/stat-block";
import {
  getCurrentStreakText,
  getGroupedStats,
  getMonthlyStats,
  getRecentRecords,
  getRecentThreeMonthCount
} from "@/lib/records";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const monthly = await getMonthlyStats();
  const recent = await getRecentRecords(3);
  const studios = (await getGroupedStats("studio")).slice(0, 3);
  const programs = (await getGroupedStats("program")).slice(0, 3);
  const streakText = await getCurrentStreakText();
  const recentThreeMonthCount = await getRecentThreeMonthCount();
  const monthlyPreview = monthly.slice(0, 12);
  const maxMonthlyCount = Math.max(...monthlyPreview.map((item) => item.count), 1);

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
              <strong>575</strong>
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
        <StatBlock label="今の継続メモ" value={streakText} helper="細かい数値より先に習慣感を見る" />
      </section>

      <section className="dashboardGrid">
        <article className="panel chartPanel">
          <div className="panelHeader">
            <h2>月間の受講履歴</h2>
            <Link href="/records">記録一覧へ</Link>
          </div>
          <div className="chartCard">
            <div className="chartBars" aria-label="Monthly attendance chart" role="img">
              {monthlyPreview.slice().reverse().map((item) => (
                <div className="chartColumn" key={item.month}>
                  <span className="chartValue">{item.count}</span>
                  <div
                    className="chartBar"
                    style={{ height: `${Math.max((item.count / maxMonthlyCount) * 180, 16)}px` }}
                  />
                  <span className="chartLabel">{item.month.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel recentPanel">
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
                <p className="muted">{record.subjectiveMemo}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel visualPanel">
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

        <article className="panel">
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

        <article className="panel visualPanel">
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

        <article className="panel">
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
