import { sampleRecords } from "@/data/sampleRecords";
import type { GroupStat, HobbyRecord, MonthlyStat } from "@/types/record";

export function getAllRecords(): HobbyRecord[] {
  return [...sampleRecords].sort((a, b) =>
    `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`)
  );
}

export function getRecord(id: string): HobbyRecord | undefined {
  return sampleRecords.find((record) => record.id === id);
}

export function getRecentRecords(limit = 4): HobbyRecord[] {
  return getAllRecords().slice(0, limit);
}

export function getMonthlyStats(): MonthlyStat[] {
  const counts = new Map<string, number>();
  for (const record of sampleRecords) {
    const month = record.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, count]) => ({ month, count }));
}

export function getGroupedStats(key: "studio" | "program"): GroupStat[] {
  const counts = new Map<string, number>();
  for (const record of sampleRecords) {
    const label = record[key];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

export function getCurrentStreakText(): string {
  return "3回連続で今月ペースを維持";
}
