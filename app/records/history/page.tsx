import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { RecordFiltersForm } from "@/components/record-filters-form";
import { RecordList } from "@/components/record-list";
import { applyRecordFilters, buildFilterOptions, getAllRecords } from "@/lib/records";
import type { RecordFilterOptions } from "@/types/record";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
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

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const rawParams = (await searchParams) ?? {};
  const filters = readFilters(rawParams);
  const allRecords = await getAllRecords();
  const records = applyRecordFilters(allRecords, filters);
  const options = buildFilterOptions(allRecords);

  return (
    <LayoutShell
      title="History"
      description="全件を時系列で確認するための記録一覧ページです。必要な条件で絞った結果もそのまま追えます。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{records.length}件の記録</strong>
          <p className="muted">
            一覧専用ページです。<Link className="textToggle" href="/records">サマリーに戻る</Link>
          </p>
        </div>

        <RecordFiltersForm action="/records/history" filters={filters} options={options} />

        <RecordList records={records} />
      </section>
    </LayoutShell>
  );
}
