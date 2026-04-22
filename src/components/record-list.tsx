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
            <th>インストラクター</th>
            <th>開始</th>
            <th>強度</th>
            <th>主観メモ</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td data-label="日付">
                <Link className="recordLink" href={`/records/${encodeURIComponent(record.id)}`}>
                  {record.date}
                </Link>
              </td>
              <td data-label="店舗">{record.studio}</td>
              <td data-label="プログラム">{record.program}</td>
              <td data-label="インストラクター">{record.instructorName || "未取得"}</td>
              <td data-label="開始">{record.startTime}</td>
              <td data-label="強度">
                <span className={`pill pill--${record.intensity || "low"}`}>{record.intensity || "none"}</span>
              </td>
              <td className="memoCell" data-label="主観メモ">{record.subjectiveMemo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
