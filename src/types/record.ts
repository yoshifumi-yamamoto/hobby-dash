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
