export function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
