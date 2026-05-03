import Link from "next/link";

import { InstructorTrendCard } from "@/components/instructor-trend-card";
import { LayoutShell } from "@/components/layout-shell";
import { MonthlyTrendCard } from "@/components/monthly-trend-card";
import { InstructorBarCard, PieCard, getProgramPieColors, getStudioPieColors, getThemePieColors } from "@/components/records-summary";
import {
  applyRecordFilters,
  buildFilterOptions,
  buildInstructorMonthlySeries,
  buildMonthlySeries,
  getAllRecords
} from "@/lib/records";
import {
  THEME_PIE_LIMIT,
  buildProgramSeriesStats,
  buildStandardVariantStats,
  buildTopInstructorStats,
  collapseAfterLimit,
  collapseMinorStats
} from "@/lib/record-breakdown";
import type { RecordFilterOptions } from "@/types/record";

export const dynamic = "force-dynamic";

interface RecordsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingle(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readFilters(params: Record<string, string | string[] | undefined>): RecordFilterOptions {
  return {
    query: getSingle(params, "query")?.trim() ?? "",
    studio: getSingle(params, "studio")?.trim() ?? "",
    instructor: getSingle(params, "instructor")?.trim() ?? "",
    programSeries: getSingle(params, "programSeries")?.trim() ?? "",
    programVariant: getSingle(params, "programVariant")?.trim() ?? "",
    lessonKind: getSingle(params, "lessonKind")?.trim() ?? "",
    dateFrom: getSingle(params, "dateFrom")?.trim() ?? "",
    dateTo: getSingle(params, "dateTo")?.trim() ?? ""
  };
}

function buildHref(path: string, params: URLSearchParams, extras?: Record<string, string>) {
  const next = new URLSearchParams(params.toString());
  Object.entries(extras ?? {}).forEach(([key, value]) => {
    if (value) {
      next.set(key, value);
      return;
    }

    next.delete(key);
  });
  const search = next.toString();
  return search ? `${path}?${search}` : path;
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const rawParams = (await searchParams) ?? {};
  const filters = readFilters(rawParams);
  const period = getSingle(rawParams, "period")?.trim() || "12";
  const records = await getAllRecords();
  const filteredRecords = applyRecordFilters(records, filters);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const studioCounts = new Map<string, number>();
  const instructorCounts = new Map<string, number>();
  for (const record of filteredRecords) {
    studioCounts.set(record.studio, (studioCounts.get(record.studio) ?? 0) + 1);
    instructorCounts.set(record.instructorName || "未取得", (instructorCounts.get(record.instructorName || "未取得") ?? 0) + 1);
  }

  const studioStats = [...studioCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
  const instructorStats = [...instructorCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));

  const programSeriesStats = buildProgramSeriesStats(filteredRecords);
  const standardVariantStats = buildStandardVariantStats(filteredRecords);
  const instructorBarStats = buildTopInstructorStats(instructorStats);
  const studioPieStats = collapseMinorStats(studioStats, filteredRecords.length);
  const programSeriesPieStats = collapseMinorStats(programSeriesStats, filteredRecords.length);
  const standardVariantPieStats = collapseAfterLimit(standardVariantStats, THEME_PIE_LIMIT);
  const leadingTheme = standardVariantStats.find((item) => item.label !== "その他") ?? standardVariantPieStats[0];
  const monthlySeries = buildMonthlySeries(filteredRecords, period);
  const instructorMonthlySeries = buildInstructorMonthlySeries(filteredRecords, period, 7);

  const currentParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      currentParams.set(key, value);
    }
  });
  currentParams.set("period", period);

  const breakdownHref = buildHref("/records/breakdown", currentParams);
  const searchHref = buildHref("/records/search", currentParams);
  const historyHref = buildHref("/records/history", currentParams);
  const filterOptions = buildFilterOptions(records);

  return (
    <LayoutShell
      title="Records"
      description="サマリーで傾向を掴み、月間推移とインストラクター推移を並べて変化まで見返すためのページです。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{filteredRecords.length}件の記録</strong>
          <p className="muted">
            {activeFilterCount > 0 ? `${activeFilterCount}条件で絞り込み中。` : "全件表示です。"}
            月次推移は下段、細かい条件検索は別画面に分けています。
          </p>
        </div>

        <div className="panel quickNavPanel">
          <div className="quickNavRow">
            <Link className="searchButton" href={searchHref}>条件検索へ</Link>
            <Link className="searchButton" href={breakdownHref}>集計一覧へ</Link>
            <Link className="searchButton" href={historyHref}>全件履歴へ</Link>
          </div>
          <div className="filterPills">
            {filters.studio ? <span className="filterPill">店舗: {filters.studio}</span> : null}
            {filters.instructor ? <span className="filterPill">講師: {filters.instructor}</span> : null}
            {filters.programSeries ? <span className="filterPill">プログラム: {filters.programSeries}</span> : null}
            {filters.programVariant ? <span className="filterPill">テーマ: {filters.programVariant}</span> : null}
            {filters.query ? <span className="filterPill">検索: {filters.query}</span> : null}
            {filters.lessonKind ? <span className="filterPill">種別: {filters.lessonKind}</span> : null}
            {filters.dateFrom || filters.dateTo ? (
              <span className="filterPill">期間: {filters.dateFrom || "..." } - {filters.dateTo || "..."}</span>
            ) : null}
            {activeFilterCount === 0 ? <span className="filterPill">フィルタなし</span> : null}
          </div>
          <div className="filterHint muted">
            候補数: 店舗 {filterOptions.studios.length} / インストラクター {filterOptions.instructors.length} / プログラム {filterOptions.programSeries.length}
          </div>
        </div>

        <div className="grid recordsSummaryGrid">
          <PieCard
            centerLabel="札幌優勢"
            centerValue={`${Math.round(((studioPieStats[0]?.count ?? 0) / Math.max(filteredRecords.length, 1)) * 100)}%`}
            colors={getStudioPieColors()}
            detailHref={breakdownHref}
            stats={studioPieStats}
            summary="札幌を基準に、他店舗の広がりだけがすぐ分かる配色にしています。"
            title="店舗の割合"
          />
          <PieCard
            centerLabel="最多カテゴリ"
            centerValue={programSeriesPieStats[0] ? `${programSeriesPieStats[0].label} ${((programSeriesPieStats[0].count / Math.max(filteredRecords.length, 1)) * 100).toFixed(0)}%` : "-"}
            colors={getProgramPieColors()}
            detailHref={breakdownHref}
            stats={programSeriesPieStats}
            summary="BB系・BS系の大枠を見て、どのシリーズに偏っているかを一瞬で把握します。"
            title="プログラム別"
          />
          <PieCard
            centerLabel="最多テーマ"
            centerValue={leadingTheme ? `${leadingTheme.label} ${((leadingTheme.count / Math.max(standardVariantStats.reduce((sum, item) => sum + item.count, 0), 1)) * 100).toFixed(0)}%` : "-"}
            colors={getThemePieColors()}
            detailHref={breakdownHref}
            stats={standardVariantPieStats}
            summary="通常プログラムだけを対象に、テーマやジャンルの偏りを比較しやすくしています。"
            title="テーマ・ジャンル別"
          />
          <InstructorBarCard detailHref={breakdownHref} stats={instructorBarStats} title="インストラクター別" />
        </div>

        <div className="grid twoCol">
          <MonthlyTrendCard
            baseHref={buildHref("/records", currentParams, { })}
            detailHref={historyHref}
            period={period}
            stats={monthlySeries}
            summary="dashboard の月間履歴を records にも持ち込み、期間を変えながら濃淡を見比べられるようにしています。"
            title="月間の受講履歴"
          />
          <InstructorTrendCard series={instructorMonthlySeries} />
        </div>
      </section>
    </LayoutShell>
  );
}
