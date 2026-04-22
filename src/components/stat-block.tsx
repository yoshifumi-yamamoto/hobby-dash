interface StatBlockProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function StatBlock({ label, value, helper }: StatBlockProps) {
  return (
    <article className="panel statBlock">
      <p className="statLabel">{label}</p>
      <h2>{value}</h2>
      {helper ? <p className="muted">{helper}</p> : null}
    </article>
  );
}
