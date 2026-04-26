import { LayoutShell } from "@/components/layout-shell";
import { RecordList } from "@/components/record-list";
import { buildGroupStats, filterRecords, getAllRecords } from "@/lib/records";
import type { GroupStat, HobbyRecord } from "@/types/record";

export const dynamic = "force-dynamic";

interface RecordsPageProps {
  searchParams?: Promise<{
    q?: string;
    programPage?: string;
    monthPage?: string;
    studioExpanded?: string;
    instructorExpanded?: string;
  }>;
}

const PROGRAMS_PER_PAGE = 20;
const DEFAULT_GROUP_PREVIEW_COUNT = 8;
const PIE_OTHER_THRESHOLD = 0.03;
const PIE_COLORS = [
  "#e8efff",
  "#b6c8ff",
  "#8ea8ff",
  "#6f86f6",
  "#4f63d9",
  "#d7b56d",
  "#8ac7b8",
  "#7c8a9d",
  "#5a6573"
];

function categorizeProgram(program: string): string {
  const normalized = program.trim().toUpperCase();
  const categories = ["BSBI", "BSWI", "BB1", "BB2", "BB3", "BSB", "BSW", "BSL"];

  for (const category of categories) {
    if (normalized.startsWith(category)) {
      return category;
    }
  }

  return "その他";
}

function buildProgramCategoryStats(records: HobbyRecord[]): GroupStat[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const label = categorizeProgram(record.program);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const order = ["BB1", "BB2", "BB3", "BSB", "BSW", "BSL", "BSBI", "BSWI", "その他"];

  return order
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((item) => item.count > 0);
}

function collapseMinorStats(stats: GroupStat[], total: number): GroupStat[] {
  if (total === 0) {
    return [];
  }

  const major = stats.filter((item) => item.count / total >= PIE_OTHER_THRESHOLD);
  const minorTotal = stats
    .filter((item) => item.count / total < PIE_OTHER_THRESHOLD)
    .reduce((sum, item) => sum + item.count, 0);

  if (minorTotal > 0) {
    major.push({ label: "その他", count: minorTotal });
  }

  return major.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

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

function PieCard({ title, stats }: { title: string; stats: GroupStat[] }) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);
  let startAngle = 0;

  return (
    <article className="panel piePanel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span className="muted">{total}件</span>
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
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="rgba(10, 10, 11, 0.92)"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="110" cy="110" fill="rgba(10, 10, 11, 0.92)" r="46" />
            <text className="pieCenterValue" x="110" y="102">{total}</text>
            <text className="pieCenterLabel" x="110" y="123">records</text>
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
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  {item.label}
                </span>
                <strong className="statRowCount">{item.count}回 ({percentage.toFixed(1)}%)</strong>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function buildPageHref(
  query: string,
  programPage: number,
  monthPage: number,
  studioExpanded: boolean,
  instructorExpanded: boolean
): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (programPage > 1) {
    params.set("programPage", String(programPage));
  }
  if (monthPage > 1) {
    params.set("monthPage", String(monthPage));
  }
  if (studioExpanded) {
    params.set("studioExpanded", "1");
  }
  if (instructorExpanded) {
    params.set("instructorExpanded", "1");
  }

  const search = params.toString();
  return search ? `/records?${search}` : "/records";
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const programPage = Math.max(Number.parseInt(params.programPage ?? "1", 10) || 1, 1);
  const monthPage = Math.max(Number.parseInt(params.monthPage ?? "1", 10) || 1, 1);
  const studioExpanded = params.studioExpanded === "1";
  const instructorExpanded = params.instructorExpanded === "1";
  const records = await getAllRecords();
  const filteredRecords = filterRecords(records, query);
  const studioStats = buildGroupStats(filteredRecords, "studio");
  const programStats = buildProgramCategoryStats(filteredRecords);
  const instructorStats = buildGroupStats(filteredRecords, "instructorName");
  const studioPieStats = collapseMinorStats(studioStats, filteredRecords.length);
  const instructorPieStats = collapseMinorStats(instructorStats, filteredRecords.length);
  const visibleStudioStats = studioExpanded ? studioStats : studioStats.slice(0, DEFAULT_GROUP_PREVIEW_COUNT);
  const visibleInstructorStats = instructorExpanded
    ? instructorStats
    : instructorStats.slice(0, DEFAULT_GROUP_PREVIEW_COUNT);
  const availableMonths = [...new Set(filteredRecords.map((record) => record.date.slice(0, 7)))];
  const totalProgramPages = Math.max(Math.ceil(programStats.length / PROGRAMS_PER_PAGE), 1);
  const currentProgramPage = Math.min(programPage, totalProgramPages);
  const totalMonthPages = Math.max(availableMonths.length, 1);
  const currentMonthPage = Math.min(monthPage, totalMonthPages);
  const selectedMonth = availableMonths[currentMonthPage - 1] ?? "";
  const paginatedProgramStats = programStats.slice(
    (currentProgramPage - 1) * PROGRAMS_PER_PAGE,
    currentProgramPage * PROGRAMS_PER_PAGE
  );
  const monthScopedRecords = selectedMonth
    ? filteredRecords.filter((record) => record.date.startsWith(selectedMonth))
    : filteredRecords;

  return (
    <LayoutShell
      title="Records"
      description="日付、店舗、プログラム、メモで検索しながら、一覧と集計をまとめて見るページです。細かい比較もここで完結させます。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{filteredRecords.length}件の記録</strong>
          <p className="muted">
            {query ? `「${query}」で絞り込み中。` : ""}
            主観メモを含めて、あとから振り返りやすい並びにしています。
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

        <div className="grid threeCol">
          <PieCard stats={studioPieStats} title="店舗の割合" />
          <PieCard stats={instructorPieStats} title="インストラクターの割合" />

          <article className="panel">
            <div className="panelHeader">
              <h2>店舗ごとの回数</h2>
              {studioStats.length > DEFAULT_GROUP_PREVIEW_COUNT ? (
                <a
                  className="textToggle"
                  href={buildPageHref(query, currentProgramPage, currentMonthPage, !studioExpanded, instructorExpanded)}
                >
                  {studioExpanded ? "閉じる" : "もっと見る"}
                </a>
              ) : null}
            </div>
            <div className="stack">
              {visibleStudioStats.map((item) => (
                <div className="row statRow" key={item.label}>
                  <span className="statRowLabel">{item.label}</span>
                  <strong className="statRowCount">{item.count}回</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panelHeader">
              <h2>インストラクター別の回数</h2>
              {instructorStats.length > DEFAULT_GROUP_PREVIEW_COUNT ? (
                <a
                  className="textToggle"
                  href={buildPageHref(query, currentProgramPage, currentMonthPage, studioExpanded, !instructorExpanded)}
                >
                  {instructorExpanded ? "閉じる" : "もっと見る"}
                </a>
              ) : null}
            </div>
            <div className="stack">
              {visibleInstructorStats.map((item) => (
                <div className="row statRow" key={item.label}>
                  <span className="statRowLabel">{item.label || "未取得"}</span>
                  <strong className="statRowCount">{item.count}回</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panelHeader">
              <h2>プログラム分類ごとの回数</h2>
              <span className="muted">{currentProgramPage} / {totalProgramPages}</span>
            </div>
            <div className="stack">
              {paginatedProgramStats.map((item) => (
                <div className="row statRow" key={item.label}>
                  <span className="statRowLabel">{item.label}</span>
                  <strong className="statRowCount">{item.count}回</strong>
                </div>
              ))}
            </div>
            <div className="paginationRow">
              {currentProgramPage > 1 ? (
                <a
                  className="pagerLink"
                  href={buildPageHref(query, currentProgramPage - 1, currentMonthPage, studioExpanded, instructorExpanded)}
                >
                  ← 前へ
                </a>
              ) : <span className="pagerSpacer" />}
              <span className="muted">{currentProgramPage} / {totalProgramPages}</span>
              {currentProgramPage < totalProgramPages ? (
                <a
                  className="pagerLink"
                  href={buildPageHref(query, currentProgramPage + 1, currentMonthPage, studioExpanded, instructorExpanded)}
                >
                  次へ →
                </a>
              ) : <span className="pagerSpacer" />}
            </div>
          </article>
        </div>

        <article className="panel listSectionPanel">
          <div className="panelHeader">
            <h2>記録一覧</h2>
            <span className="muted">
              {selectedMonth || "全期間"} / {currentMonthPage} / {totalMonthPages}
            </span>
          </div>
          <div className="paginationRow monthPager">
            {currentMonthPage > 1 ? (
              <a
                className="pagerLink"
                href={buildPageHref(query, currentProgramPage, currentMonthPage - 1, studioExpanded, instructorExpanded)}
              >
                ← 前月の一覧
              </a>
            ) : <span className="pagerSpacer" />}
            {currentMonthPage < totalMonthPages ? (
              <a
                className="pagerLink"
                href={buildPageHref(query, currentProgramPage, currentMonthPage + 1, studioExpanded, instructorExpanded)}
              >
                次月の一覧 →
              </a>
            ) : <span className="pagerSpacer" />}
          </div>
          <RecordList framed={false} records={monthScopedRecords} />
        </article>
      </section>
    </LayoutShell>
  );
}
