import { createClient } from "@supabase/supabase-js";

import type { GroupStat, HobbyRecord, MonthlyStat } from "@/types/record";

interface FeelcycleWorkoutRow {
  id: string;
  workout_date: string;
  studio: string;
  program: string;
  start_time: string;
  intensity: string | null;
  subjective_memo: string;
  condition_memo: string;
  created_at: string;
  updated_at: string;
}

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
    startTime: row.start_time.slice(0, 5),
    intensity: row.intensity ?? "",
    subjectiveMemo: row.subjective_memo,
    conditionMemo: row.condition_memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getAllRecords(): Promise<HobbyRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("feelcycle_workouts")
    .select("*")
    .order("workout_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRow(row as FeelcycleWorkoutRow));
}

export async function getRecord(id: string): Promise<HobbyRecord | undefined> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("feelcycle_workouts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapRow(data as FeelcycleWorkoutRow) : undefined;
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

  return (data ?? []).map((row) => mapRow(row as FeelcycleWorkoutRow));
}

export async function getMonthlyStats(): Promise<MonthlyStat[]> {
  const records = await getAllRecords();
  const counts = new Map<string, number>();

  for (const record of records) {
    const month = record.date.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, count]) => ({ month, count }));
}

export async function getGroupedStats(key: "studio" | "program"): Promise<GroupStat[]> {
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
