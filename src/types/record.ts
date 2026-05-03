export interface HobbyRecord {
  id: string;
  date: string;
  studio: string;
  program: string;
  rawProgramName: string;
  lessonKind: string;
  programFamily: string;
  programSeries: string;
  programVariant: string;
  programVersion?: number;
  parseRule: string;
  instructorName: string;
  startTime: string;
  intensity: string;
  subjectiveMemo: string;
  conditionMemo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface GroupStat {
  label: string;
  count: number;
}

export interface RecordFilterOptions {
  query?: string;
  studio?: string;
  instructor?: string;
  programSeries?: string;
  programVariant?: string;
  lessonKind?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MonthlySeriesPoint {
  month: string;
  count: number;
}

export interface InstructorMonthlySeries {
  label: string;
  total: number;
  points: MonthlySeriesPoint[];
}
