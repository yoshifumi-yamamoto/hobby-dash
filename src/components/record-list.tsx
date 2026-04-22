import Link from "next/link";

import type { HobbyRecord } from "@/types/record";

export function RecordList({ records }: { records: HobbyRecord[] }) {
  return (
    <div className="panel tablePanel">
      <table className="recordTable">
        <thead>
          <tr>
            <th>日付</th>
            <th>店舗</th>
            <th>プログラム</th>
            <th>開始</th>
            <th>強度</th>
            <th>主観メモ</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <Link className="recordLink" href={`/records/${record.id}`}>
                  {record.date}
                </Link>
              </td>
              <td>{record.studio}</td>
              <td>{record.program}</td>
              <td>{record.startTime}</td>
              <td>
                <span className={`pill pill--${record.intensity || "low"}`}>{record.intensity || "none"}</span>
              </td>
              <td className="memoCell">{record.subjectiveMemo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
