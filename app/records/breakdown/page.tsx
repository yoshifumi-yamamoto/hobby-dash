import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { filterRecords, getAllRecords } from "@/lib/records";
import { buildProgramSeriesStats, buildStandardVariantStats } from "@/lib/record-breakdown";
import type { GroupStat } from "@/types/record";

export const dynamic = "force-dynamic";

interface BreakdownPageProps {
  searchParams?: Promise<{
    q?: string;
    section?: string;
  }>;
}

function buildStats(records: Awaited<ReturnType<typeof getAllRecords>>) {
  const studioCounts = new Map<string, number>();
  const instructorCounts = new Map<string, number>();

  for (const record of records) {
    studioCounts.set(record.studio, (studioCounts.get(record.studio) ?? 0) + 1);
    instructorCounts.set(record.instructorName || "未取得", (instructorCounts.get(record.instructorName || "未取得") ?? 0) + 1);
  }

  const studioStats = [...studioCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
  const instructorStats = [...instructorCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));

  return {
    studioStats,
    programSeriesStats: buildProgramSeriesStats(records),
    standardVariantStats: buildStandardVariantStats(records),
    instructorStats
  };
}

function SectionTable({ title, stats }: { title: string; stats: GroupStat[] }) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="panel breakdownPanel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <strong className="chartTotal">{total}件</strong>
      </div>
      <div className="stack breakdownTable">
        {stats.map((item) => {
          const percentage = total === 0 ? 0 : (item.count / total) * 100;
          return (
            <div className="row statRow breakdownRow" key={item.label}>
              <span className="statRowLabel">{item.label}</span>
              <strong className="statRowCount">{item.count}回 {percentage.toFixed(1)}%</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default async function BreakdownPage({ searchParams }: BreakdownPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const records = filterRecords(await getAllRecords(), query);
  const { studioStats, programSeriesStats, standardVariantStats, instructorStats } = buildStats(records);

  return (
    <LayoutShell
      title="Breakdown"
      description="サマリーから掘り下げて、件数が少ない内訳まで順番に確認するための集計一覧ページです。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{records.length}件の集計対象</strong>
          <p className="muted">
            {query ? `「${query}」で絞り込み中。` : ""}
            <Link className="textToggle" href={query ? `/records?q=${encodeURIComponent(query)}` : "/records"}>サマリーに戻る</Link>
          </p>
        </div>

        <div className="grid twoCol">
          <SectionTable stats={studioStats} title="店舗別" />
          <SectionTable stats={programSeriesStats} title="プログラム別" />
          <SectionTable stats={standardVariantStats} title="テーマ・ジャンル別" />
          <SectionTable stats={instructorStats} title="インストラクター別" />
        </div>
      </section>
    </LayoutShell>
  );
}
