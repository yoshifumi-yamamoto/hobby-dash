import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { InstructorBarCard, PieCard, getProgramPieColors, getStudioPieColors, getThemePieColors } from "@/components/records-summary";
import { filterRecords, getAllRecords } from "@/lib/records";
import { buildProgramSeriesStats, buildStandardVariantStats, buildTopInstructorStats, collapseMinorStats } from "@/lib/record-breakdown";
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
  const studioPieStats = collapseMinorStats(studioStats, records.length);
  const programSeriesPieStats = collapseMinorStats(programSeriesStats, records.length);
  const standardVariantPieStats = collapseMinorStats(
    standardVariantStats,
    standardVariantStats.reduce((sum, item) => sum + item.count, 0)
  );
  const instructorBarStats = buildTopInstructorStats(instructorStats);

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

        <div className="grid threeCol">
          <PieCard
            centerLabel="札幌優勢"
            centerValue={`${Math.round(((studioPieStats[0]?.count ?? 0) / Math.max(records.length, 1)) * 100)}%`}
            colors={getStudioPieColors()}
            stats={studioPieStats}
            summary="詳細一覧に入る前に、まず大枠の偏りを上段で確認できます。"
            title="店舗別"
          />
          <PieCard
            centerLabel="最多カテゴリ"
            centerValue={programSeriesPieStats[0] ? `${programSeriesPieStats[0].label} ${((programSeriesPieStats[0].count / Math.max(records.length, 1)) * 100).toFixed(0)}%` : "-"}
            colors={getProgramPieColors()}
            stats={programSeriesPieStats}
            summary="BB系・BS系の比率を一覧の前に視覚で把握できます。"
            title="プログラム別"
          />
          <InstructorBarCard stats={instructorBarStats} title="インストラクター別" />
          <PieCard
            centerLabel="最多テーマ"
            centerValue={standardVariantPieStats[0] ? `${standardVariantPieStats[0].label} ${((standardVariantPieStats[0].count / Math.max(standardVariantStats.reduce((sum, item) => sum + item.count, 0), 1)) * 100).toFixed(0)}%` : "-"}
            colors={getThemePieColors()}
            stats={standardVariantPieStats}
            summary="テーマやジャンルもプログラム別と同じドーナツ表現で揃えています。"
            title="テーマ・ジャンル別"
          />
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
