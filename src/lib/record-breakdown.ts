import type { GroupStat, HobbyRecord } from "@/types/record";

export const PIE_OTHER_THRESHOLD = 0.03;
export const INSTRUCTOR_LIMIT = 8;
export const THEME_PIE_LIMIT = 7;

export function buildOrderedStats(counts: Map<string, number>, order?: string[]): GroupStat[] {
  if (!order) {
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }));
  }

  const ordered = order
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((item) => item.count > 0);
  const extras = [...counts.entries()]
    .filter(([label]) => !order.includes(label))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));

  return [...ordered, ...extras];
}

export function buildProgramSeriesStats(records: HobbyRecord[]): GroupStat[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const label = record.programSeries || "未分類";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return buildOrderedStats(counts, ["BB1", "BB2", "BB3", "BSB", "BSW", "BSL", "BSBi", "BSWi"]);
}

export function buildStandardVariantStats(records: HobbyRecord[]): GroupStat[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (record.programFamily !== "standard") {
      continue;
    }

    const label = record.programVariant || "未分類";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return buildOrderedStats(counts);
}

export function collapseMinorStats(stats: GroupStat[], total: number): GroupStat[] {
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

export function buildTopInstructorStats(stats: GroupStat[]): GroupStat[] {
  const top = stats.slice(0, INSTRUCTOR_LIMIT);
  const remaining = stats.slice(INSTRUCTOR_LIMIT).reduce((sum, item) => sum + item.count, 0);

  if (remaining > 0) {
    top.push({ label: "その他", count: remaining });
  }

  return top;
}

export function collapseAfterLimit(stats: GroupStat[], limit: number): GroupStat[] {
  const visible = stats.slice(0, limit);
  const remaining = stats.slice(limit).reduce((sum, item) => sum + item.count, 0);

  if (remaining > 0) {
    visible.push({ label: "その他", count: remaining });
  }

  return visible;
}
