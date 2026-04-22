export interface HobbyRecord {
  id: string;
  date: string;
  studio: string;
  program: string;
  startTime: string;
  intensity: "low" | "medium" | "high";
  subjectiveMemo: string;
  conditionMemo: string;
}

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface GroupStat {
  label: string;
  count: number;
}
