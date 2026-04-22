import Link from "next/link";
import { notFound } from "next/navigation";

import { LayoutShell } from "@/components/layout-shell";
import { getRecord } from "@/lib/records";

interface RecordDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function RecordDetailPage({ params }: RecordDetailPageProps) {
  const { id } = await params;
  const record = await getRecord(id);

  if (!record) {
    notFound();
  }

  return (
    <LayoutShell
      title={`${record.program} / ${record.date}`}
      description="1件の記録を落ち着いて見返すための詳細画面です。運動内容より、当時の主観と体調を思い出せることを重視しています。"
    >
      <div className="backLink">
        <Link href="/records">← 一覧へ戻る</Link>
      </div>

      <section className="grid detailGrid">
        <article className="panel">
          <div className="detailHeader">
            <span className={`pill pill--${record.intensity || "low"}`}>{record.intensity || "none"}</span>
            <strong>{record.date}</strong>
          </div>
          <dl className="detailList">
            <div>
              <dt>店舗</dt>
              <dd>{record.studio}</dd>
            </div>
            <div>
              <dt>プログラム</dt>
              <dd>{record.program}</dd>
            </div>
            <div>
              <dt>インストラクター</dt>
              <dd>{record.instructorName || "未取得"}</dd>
            </div>
            <div>
              <dt>開始時刻</dt>
              <dd>{record.startTime}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <h2>主観メモ</h2>
          <p className="copy">{record.subjectiveMemo}</p>
        </article>

        <article className="panel">
          <h2>体調メモ</h2>
          <p className="copy">{record.conditionMemo}</p>
        </article>
      </section>
    </LayoutShell>
  );
}
