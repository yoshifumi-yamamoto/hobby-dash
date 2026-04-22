import { LayoutShell } from "@/components/layout-shell";
import { RecordList } from "@/components/record-list";
import { buildGroupStats, filterRecords, getAllRecords } from "@/lib/records";

export const dynamic = "force-dynamic";

interface RecordsPageProps {
  searchParams?: Promise<{
    q?: string;
    programPage?: string;
    monthPage?: string;
  }>;
}

const PROGRAMS_PER_PAGE = 20;

function buildPageHref(query: string, programPage: number, monthPage: number): string {
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

  const search = params.toString();
  return search ? `/records?${search}` : "/records";
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const programPage = Math.max(Number.parseInt(params.programPage ?? "1", 10) || 1, 1);
  const monthPage = Math.max(Number.parseInt(params.monthPage ?? "1", 10) || 1, 1);
  const records = await getAllRecords();
  const filteredRecords = filterRecords(records, query);
  const studioStats = buildGroupStats(filteredRecords, "studio");
  const programStats = buildGroupStats(filteredRecords, "program");
  const instructorStats = buildGroupStats(filteredRecords, "instructorName");
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
          <article className="panel">
            <h2>店舗ごとの回数</h2>
            <div className="stack">
              {studioStats.map((item) => (
                <div className="row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}回</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h2>インストラクター別の回数</h2>
            <div className="stack">
              {instructorStats.map((item) => (
                <div className="row" key={item.label}>
                  <span>{item.label || "未取得"}</span>
                  <strong>{item.count}回</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panelHeader">
              <h2>プログラム別の回数</h2>
              <span className="muted">{currentProgramPage} / {totalProgramPages}</span>
            </div>
            <div className="stack">
              {paginatedProgramStats.map((item) => (
                <div className="row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}回</strong>
                </div>
              ))}
            </div>
            <div className="paginationRow">
              {currentProgramPage > 1 ? (
                <a className="pagerLink" href={buildPageHref(query, currentProgramPage - 1, currentMonthPage)}>← 前へ</a>
              ) : <span />}
              {currentProgramPage < totalProgramPages ? (
                <a className="pagerLink" href={buildPageHref(query, currentProgramPage + 1, currentMonthPage)}>次へ →</a>
              ) : null}
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
              <a className="pagerLink" href={buildPageHref(query, currentProgramPage, currentMonthPage - 1)}>← 前月の一覧</a>
            ) : <span />}
            {currentMonthPage < totalMonthPages ? (
              <a className="pagerLink" href={buildPageHref(query, currentProgramPage, currentMonthPage + 1)}>次月の一覧 →</a>
            ) : null}
          </div>
          <RecordList framed={false} records={monthScopedRecords} />
        </article>
      </section>
    </LayoutShell>
  );
}
