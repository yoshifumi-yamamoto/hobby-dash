import { LayoutShell } from "@/components/layout-shell";
import { InstructorBarCard, PieCard, getProgramPieColors, getStudioPieColors, getThemePieColors } from "@/components/records-summary";
import { filterRecords, getAllRecords } from "@/lib/records";
import { THEME_PIE_LIMIT, buildProgramSeriesStats, buildStandardVariantStats, buildTopInstructorStats, collapseAfterLimit, collapseMinorStats } from "@/lib/record-breakdown";

export const dynamic = "force-dynamic";

interface RecordsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

function buildBreakdownHref(query: string, section?: string): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (section) {
    params.set("section", section);
  }
  const search = params.toString();
  return search ? `/records/breakdown?${search}` : "/records/breakdown";
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const records = await getAllRecords();
  const filteredRecords = filterRecords(records, query);

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

  return (
    <LayoutShell
      title="Records"
      description="集計の傾向を最初に見て、必要なときだけ詳細ページへ掘り下げるためのサマリーページです。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{filteredRecords.length}件の記録</strong>
          <p className="muted">
            {query ? `「${query}」で絞り込み中。` : ""}
            この画面は傾向把握を優先し、細かい内訳は別ページで確認できる構成にしています。
          </p>
        </div>

        <form className="panel searchPanel" action="/records">
          <label className="searchLabel" htmlFor="q">検索</label>
          <div className="searchRow">
            <input
              className="searchInput"
              defaultValue={query}
              id="q"
              name="q"
              placeholder="日付、店舗、プログラム、インストラクター、メモで検索"
              type="search"
            />
            <button className="searchButton" type="submit">絞り込む</button>
          </div>
        </form>

        <div className="grid recordsSummaryGrid">
          <PieCard
            centerLabel="札幌優勢"
            centerValue={`${Math.round(((studioPieStats[0]?.count ?? 0) / Math.max(filteredRecords.length, 1)) * 100)}%`}
            colors={getStudioPieColors()}
            detailHref={buildBreakdownHref(query, "studio")}
            stats={studioPieStats}
            summary="札幌を基準に、他店舗の広がりだけがすぐ分かる配色にしています。"
            title="店舗の割合"
          />
          <PieCard
            centerLabel="最多カテゴリ"
            centerValue={programSeriesPieStats[0] ? `${programSeriesPieStats[0].label} ${((programSeriesPieStats[0].count / Math.max(filteredRecords.length, 1)) * 100).toFixed(0)}%` : "-"}
            colors={getProgramPieColors()}
            detailHref={buildBreakdownHref(query, "program")}
            stats={programSeriesPieStats}
            summary="BB系・BS系の大枠を見て、どのシリーズに偏っているかを一瞬で把握します。"
            title="プログラム別"
          />
          <PieCard
            centerLabel="最多テーマ"
            centerValue={leadingTheme ? `${leadingTheme.label} ${((leadingTheme.count / Math.max(standardVariantStats.reduce((sum, item) => sum + item.count, 0), 1)) * 100).toFixed(0)}%` : "-"}
            colors={getThemePieColors()}
            detailHref={buildBreakdownHref(query, "theme")}
            stats={standardVariantPieStats}
            summary="通常プログラムだけを対象に、テーマやジャンルの偏りを比較しやすくしています。"
            title="テーマ・ジャンル別"
          />
          <InstructorBarCard detailHref={buildBreakdownHref(query, "instructor")} stats={instructorBarStats} title="インストラクター別" />
        </div>
      </section>
    </LayoutShell>
  );
}
