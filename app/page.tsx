import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { StatBlock } from "@/components/stat-block";
import { getCurrentStreakText, getGroupedStats, getMonthlyStats, getRecentRecords } from "@/lib/records";

export default function HomePage() {
  const monthly = getMonthlyStats();
  const recent = getRecentRecords(3);
  const studios = getGroupedStats("studio").slice(0, 3);
  const programs = getGroupedStats("program").slice(0, 3);

  return (
    <LayoutShell
      title="Overview"
      description="分析より先に、最近動けているか、どこで続いているか、どんなメモが残っているかを軽く見返すための入口です。"
    >
      <section className="grid statsGrid">
        <StatBlock label="直近3か月の記録数" value={monthly.reduce((sum, item) => sum + item.count, 0)} helper="積み上がり感をまず確認" />
        <StatBlock label="今の継続メモ" value={getCurrentStreakText()} helper="細かい数値より先に習慣感を見る" />
      </section>

      <section className="grid twoCol">
        <article className="panel">
          <div className="panelHeader">
            <h2>月ごとの実施回数</h2>
            <Link href="/records">記録一覧へ</Link>
          </div>
          <div className="stack">
            {monthly.map((item) => (
              <div className="row" key={item.month}>
                <span>{item.month}</span>
                <strong>{item.count}回</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panelHeader">
            <h2>直近の記録</h2>
          </div>
          <div className="stack">
            {recent.map((record) => (
              <Link className="cardLink" href={`/records/${record.id}`} key={record.id}>
                <div className="row">
                  <strong>{record.date}</strong>
                  <span className={`pill pill--${record.intensity}`}>{record.intensity}</span>
                </div>
                <h3>{record.program}</h3>
                <p>{record.studio} / {record.startTime}</p>
                <p className="muted">{record.subjectiveMemo}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid twoCol">
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
