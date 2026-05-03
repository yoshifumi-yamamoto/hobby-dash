import type { RecordFilterOptions } from "@/types/record";

interface FilterOptionSets {
  studios: string[];
  instructors: string[];
  programSeries: string[];
  programVariants: string[];
  lessonKinds: string[];
}

function SelectField(
  {
    id,
    label,
    value,
    options
  }: {
    id: string;
    label: string;
    value?: string;
    options: string[];
  }
) {
  return (
    <label className="filterField" htmlFor={id}>
      <span className="searchLabel">{label}</span>
      <select className="searchInput" defaultValue={value ?? ""} id={id} name={id}>
        <option value="">すべて</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function RecordFiltersForm(
  {
    action,
    filters,
    options
  }: {
    action: string;
    filters: RecordFilterOptions;
    options: FilterOptionSets;
  }
) {
    return (
      <form action={action} className="panel searchPanel">
        <div className="filterGrid">
          <label className="filterField" htmlFor="query">
            <span className="searchLabel">キーワード</span>
            <input
              className="searchInput"
              defaultValue={filters.query ?? ""}
              id="query"
              name="query"
              placeholder="日付、店舗、プログラム、メモ"
              type="search"
            />
          </label>
          <SelectField id="studio" label="店舗" options={options.studios} value={filters.studio} />
          <SelectField id="instructor" label="インストラクター" options={options.instructors} value={filters.instructor} />
          <SelectField id="programSeries" label="プログラム別" options={options.programSeries} value={filters.programSeries} />
          <SelectField id="programVariant" label="テーマ・ジャンル別" options={options.programVariants} value={filters.programVariant} />
          <SelectField id="lessonKind" label="レッスン種別" options={options.lessonKinds} value={filters.lessonKind} />
          <label className="filterField" htmlFor="dateFrom">
            <span className="searchLabel">開始日</span>
            <input className="searchInput" defaultValue={filters.dateFrom ?? ""} id="dateFrom" name="dateFrom" type="date" />
          </label>
          <label className="filterField" htmlFor="dateTo">
            <span className="searchLabel">終了日</span>
            <input className="searchInput" defaultValue={filters.dateTo ?? ""} id="dateTo" name="dateTo" type="date" />
          </label>
        </div>
        <div className="searchRow">
          <button className="searchButton" type="submit">条件で集計する</button>
        </div>
      </form>
    );
}
