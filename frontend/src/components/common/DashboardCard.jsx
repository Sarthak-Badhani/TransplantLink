export default function DashboardCard({ title, value, desc }) {
  return (
    <div className="card p-3 h-100">
      <div className="text-muted small mb-1">{title}</div>
      <div className="fs-4 fw-bold">{value ?? '—'}</div>
      {desc && <div className="text-muted small mt-1" style={{lineHeight:1.2}}>{desc}</div>}
    </div>
  )
}
