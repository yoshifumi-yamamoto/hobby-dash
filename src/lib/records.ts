import { createClient } from "@supabase/supabase-js";

import type {
  GroupStat,
  HobbyRecord,
  InstructorMonthlySeries,
  MonthlySeriesPoint,
  MonthlyStat,
  RecordFilterOptions
} from "@/types/record";

interface FeelcycleWorkoutRow {
  id: string;
  workout_date: string;
  studio: string;
  program: string;
  raw_program_name: string | null;
  lesson_kind: string | null;
  program_family: string | null;
  program_series: string | null;
  program_variant: string | null;
  program_version: number | null;
  parse_rule: string | null;
  instructor_name: string | null;
  start_time: string;
  intensity: string | null;
  subjective_memo: string;
  condition_memo: string;
  created_at: string;
  updated_at: string;
}

const SUPABASE_PAGE_SIZE = 500;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are required");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function mapRow(row: FeelcycleWorkoutRow): HobbyRecord {
  return {
    id: row.id,
    date: row.workout_date,
    studio: row.studio,
    program: row.program,
    rawProgramName: row.raw_program_name ?? row.program,
    lessonKind: row.lesson_kind ?? "unknown",
    programFamily: row.program_family ?? "unknown",
    programSeries: row.program_series ?? "",
    programVariant: row.program_variant ?? "",
    programVersion: row.program_version ?? undefined,
    parseRule: row.parse_rule ?? "unclassified",
    instructorName: row.instructor_name ?? "",
    startTime: row.start_time.slice(0, 5),
    intensity: row.intensity ?? "",
    subjectiveMemo: row.subjective_memo,
    conditionMemo: row.condition_memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function buildNaturalKey(record: Pick<HobbyRecord, "date" | "startTime" | "studio" | "program">): string {
  return [record.date, record.startTime, record.studio, record.program]
    .map((value) => value.trim().toLowerCase())
    .join("::");
}

function normalizeSegment(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function matchesLegacyId(record: HobbyRecord, id: string): boolean {
  const segments = id.split(":");
  if (segments.length < 4 || segments[0] !== "feelcycle") {
    return false;
  }

  const date = segments[1] ?? "";
  const startTime = segments[2] ?? "";
  const trailing = segments.slice(3);

  if (record.date !== date || record.startTime !== startTime) {
    return false;
  }

  const expectedProgram = normalizeSegment(record.program);
  const expectedStudio = normalizeSegment(record.studio);

  if (trailing.length === 1) {
    return trailing[0] === expectedProgram;
  }

  if (trailing.length >= 2) {
    const studio = trailing[0] ?? "";
    const program = trailing.slice(1).join(":");
    return studio === expectedStudio && program === expectedProgram;
  }

  return false;
}

function dedupeRecords(records: HobbyRecord[]): HobbyRecord[] {
  const deduped = new Map<string, HobbyRecord>();

  for (const record of records) {
    const key = buildNaturalKey(record);
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, record);
      continue;
    }

    const existingUpdatedAt = existing.updatedAt ?? existing.createdAt ?? "";
    const nextUpdatedAt = record.updatedAt ?? record.createdAt ?? "";
    if (nextUpdatedAt > existingUpdatedAt) {
      deduped.set(key, record);
    }
  }

  return [...deduped.values()].sort((a, b) =>
    `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`)
  );
}

export async function getAllRecords(): Promise<HobbyRecord[]> {
  const client = getSupabaseClient();
  const rows: FeelcycleWorkoutRow[] = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await client
      .from("feelcycle_workouts")
      .select("*")
      .order("workout_date", { ascending: false })
      .order("start_time", { ascending: false })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const page = (data ?? []) as FeelcycleWorkoutRow[];
    rows.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) {
      break;
    }
  }

  return dedupeRecords(rows.map((row) => mapRow(row)));
}

export async function getRecord(id: string): Promise<HobbyRecord | undefined> {
  const records = await getAllRecords();
  const decodedId = decodeURIComponent(id);

  return records.find((record) => record.id === decodedId || matchesLegacyId(record, decodedId));
}

export async function getRecentRecords(limit = 4): Promise<HobbyRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("feelcycle_workouts")
    .select("*")
    .order("workout_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return dedupeRecords((data ?? []).map((row) => mapRow(row as FeelcycleWorkoutRow))).slice(0, limit);
}

export async function getMonthlyStats(): Promise<MonthlyStat[]> {
  return buildMonthlyStats(await getAllRecords());
}

export async function getRecentThreeMonthCount(): Promise<number> {
  const records = await getAllRecords();
  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));

  return records.filter((record) => {
    const recordDate = new Date(`${record.date}T00:00:00Z`);
    return recordDate >= startMonth;
  }).length;
}

export async function getGroupedStats(key: "studio" | "program" | "instructorName"): Promise<GroupStat[]> {
  const records = await getAllRecords();
  const counts = new Map<string, number>();

  for (const record of records) {
    const label = record[key];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

export async function getCurrentStreakText(): Promise<string> {
  const records = await getAllRecords();
  if (records.length === 0) {
    return "まだ記録がありません";
  }

  const uniqueDates = [...new Set(records.map((record) => record.date))].sort((a, b) => b.localeCompare(a));
  let streak = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = new Date(`${uniqueDates[index - 1]}T00:00:00+09:00`);
    const current = new Date(`${uniqueDates[index]}T00:00:00+09:00`);
    const diffDays = Math.round((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return `${streak}日連続で記録`;
}

export function filterRecords(records: HobbyRecord[], query: string): HobbyRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) =>
    [
      record.date,
      record.studio,
      record.program,
      record.instructorName,
      record.startTime,
      record.subjectiveMemo,
      record.conditionMemo
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export function applyRecordFilters(records: HobbyRecord[], filters: RecordFilterOptions): HobbyRecord[] {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return records.filter((record) => {
    if (query) {
      const matched = [
        record.date,
        record.studio,
        record.program,
        record.rawProgramName,
        record.programSeries,
        record.programVariant,
        record.instructorName,
        record.startTime,
        record.subjectiveMemo,
        record.conditionMemo
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      if (!matched) {
        return false;
      }
    }

    if (filters.studio && record.studio !== filters.studio) {
      return false;
    }

    if (filters.instructor && record.instructorName !== filters.instructor) {
      return false;
    }

    if (filters.programSeries && record.programSeries !== filters.programSeries) {
      return false;
    }

    if (filters.programVariant && record.programVariant !== filters.programVariant) {
      return false;
    }

    if (filters.lessonKind && record.lessonKind !== filters.lessonKind) {
      return false;
    }

    if (filters.dateFrom && record.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && record.date > filters.dateTo) {
      return false;
    }

    return true;
  });
}

export function buildGroupStats(
  records: HobbyRecord[],
  key: "studio" | "program" | "instructorName"
): GroupStat[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const label = record[key];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

export function buildMonthlyStats(records: HobbyRecord[]): MonthlyStat[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const month = record.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, count]) => ({ month, count }));
}

export function trimMonthlyStats(stats: MonthlyStat[], period: string): MonthlyStat[] {
  if (period === "all") {
    return stats;
  }

  const limit = Number.parseInt(period, 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    return stats.slice(0, 12);
  }

  return stats.slice(0, limit);
}

function toAscendingSeries(stats: MonthlyStat[]): MonthlySeriesPoint[] {
  return stats
    .slice()
    .reverse()
    .map((item) => ({ month: item.month, count: item.count }));
}

export function buildMonthlySeries(records: HobbyRecord[], period: string): MonthlySeriesPoint[] {
  return toAscendingSeries(trimMonthlyStats(buildMonthlyStats(records), period));
}

export function buildInstructorMonthlySeries(
  records: HobbyRecord[],
  period: string,
  limit = 7
): InstructorMonthlySeries[] {
  const monthlyStats = trimMonthlyStats(buildMonthlyStats(records), period);
  const monthsAscending = monthlyStats.slice().reverse().map((item) => item.month);
  const totals = new Map<string, number>();

  for (const record of records) {
    const name = record.instructorName || "未取得";
    totals.set(name, (totals.get(name) ?? 0) + 1);
  }

  const topInstructors = [...totals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  return topInstructors.map(([label, total]) => {
    const counts = new Map<string, number>();

    for (const record of records) {
      const name = record.instructorName || "未取得";
      if (name !== label) {
        continue;
      }

      const month = record.date.slice(0, 7);
      if (!monthsAscending.includes(month)) {
        continue;
      }

      counts.set(month, (counts.get(month) ?? 0) + 1);
    }

    return {
      label,
      total,
      points: monthsAscending.map((month) => ({
        month,
        count: counts.get(month) ?? 0
      }))
    };
  });
}

export function buildFilterOptions(records: HobbyRecord[]) {
  const studios = new Set<string>();
  const instructors = new Set<string>();
  const programSeries = new Set<string>();
  const programVariants = new Set<string>();
  const lessonKinds = new Set<string>();

  for (const record of records) {
    if (record.studio) {
      studios.add(record.studio);
    }
    if (record.instructorName) {
      instructors.add(record.instructorName);
    }
    if (record.programSeries) {
      programSeries.add(record.programSeries);
    }
    if (record.programVariant) {
      programVariants.add(record.programVariant);
    }
    if (record.lessonKind) {
      lessonKinds.add(record.lessonKind);
    }
  }

  const sort = (values: Set<string>) => [...values].sort((a, b) => a.localeCompare(b));

  return {
    studios: sort(studios),
    instructors: sort(instructors),
    programSeries: sort(programSeries),
    programVariants: sort(programVariants),
    lessonKinds: sort(lessonKinds)
  };
}
