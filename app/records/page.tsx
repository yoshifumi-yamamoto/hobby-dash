import { LayoutShell } from "@/components/layout-shell";
import { RecordList } from "@/components/record-list";
import { getAllRecords } from "@/lib/records";

export default function RecordsPage() {
  const records = getAllRecords();

  return (
    <LayoutShell
      title="Records"
      description="一覧で日付、店舗、プログラム、主観メモを見返すページです。MVP では絞り込みより、まず素直に積み上がりを確認できることを優先しています。"
    >
      <section className="grid">
        <div className="listMeta panel">
          <strong>{records.length}件の記録</strong>
          <p className="muted">主観メモを含めて、あとから振り返りやすい並びにしています。</p>
        </div>
        <RecordList records={records} />
      </section>
    </LayoutShell>
  );
}
