/** New approved members per month. Plain HTML/CSS so labels stay readable on phones. */
export function GrowthChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((n, d) => n + d.count, 0);
  return (
    <figure className="space-y-3">
      <figcaption className="text-ink-muted text-sm">
        {total} new {total === 1 ? "member" : "members"} in the last {data.length} months
      </figcaption>
      <div className="flex h-44 items-end gap-1 sm:gap-2" aria-hidden>
        {data.map((d) => (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1">
            <span className="text-ink text-center text-xs font-semibold">{d.count || ""}</span>
            <div
              className="bg-brand-700 rounded-t-[4px]"
              style={{ height: `${Math.max(d.count ? 4 : 1, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
            />
            <span className="text-ink-muted text-center text-[11px]">{d.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>New approved members per month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">New members</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
