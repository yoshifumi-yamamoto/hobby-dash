import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { RecordFiltersForm } from "@/components/record-filters-form";
import { RecordList } from "@/components/record-list";
import {
  applyRecordFilters,
  buildFilterOptions,
  buildGroupStats,
  getAllRecords
} from "@/lib/records";
import type { RecordFilterOptions } from "@/types/record";

export const dynamic = "force-dynamic";

interface SearchPageProps {
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

function SearchStatSection({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <article className="panel breakdownPanel">
      <div className="panelHeader">
        <h2>{title}</h2>
      </div>
      <div className="stack breakdownTable">
        {items.slice(0, 8).map((item) => (
          <div className="row statRow breakdownRow" key={item.label}>
            <span className="statRowLabel">{item.label}</span>
            <strong className="statRowCount">{item.count}回</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawParams = (await searchParams) ?? {};
  const filters = readFilters(rawParams);
  const records = await getAllRecords();
  const filteredRecords = applyRecordFilters(records, filters);
  const options = buildFilterOptions(records);

  const studioStats = buildGroupStats(filteredRecords, "studio");
  const programStats = buildGroupStats(filteredRecords, "program");
  const instructorStats = buildGroupStats(filteredRecords, "instructorName");

  return (
    <LayoutShell
      title="Search"
      description="条件を組み合わせて抽出し、そのまま集計と一覧を同時に見返すための検索ページです。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{filteredRecords.length}件ヒット</strong>
          <p className="muted">
            まず条件で絞り込み、その結果の店舗・プログラム・インストラクター偏りを同じ画面で確認できます。
          </p>
        </div>

        <RecordFiltersForm action="/records/search" filters={filters} options={options} />

        <div className="panel quickNavPanel">
          <div className="quickNavRow">
            <Link className="searchButton" href="/records">サマリーへ戻る</Link>
            <Link className="searchButton" href="/records/breakdown">集計一覧へ</Link>
            <Link className="searchButton" href="/records/history">全件履歴へ</Link>
          </div>
        </div>

        <div className="grid recordsSummaryGrid">
          <SearchStatSection items={studioStats} title="店舗の上位" />
          <SearchStatSection items={programStats} title="プログラムの上位" />
          <SearchStatSection items={instructorStats} title="インストラクターの上位" />
        </div>

        <RecordList records={filteredRecords} />
      </section>
    </LayoutShell>
  );
}
