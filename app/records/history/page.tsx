import { LayoutShell } from "@/components/layout-shell";
import { RecordList } from "@/components/record-list";
import { filterRecords, getAllRecords } from "@/lib/records";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const records = filterRecords(await getAllRecords(), query);

  return (
    <LayoutShell
      title="History"
      description="全件を時系列で確認するための記録一覧ページです。サマリーとは分けて閲覧できます。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{records.length}件の記録</strong>
          <p className="muted">{query ? `「${query}」で絞り込み中。` : ""}一覧専用ページです。</p>
        </div>

        <form className="panel searchPanel" action="/records/history">
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

        <RecordList records={records} />
      </section>
    </LayoutShell>
  );
}
