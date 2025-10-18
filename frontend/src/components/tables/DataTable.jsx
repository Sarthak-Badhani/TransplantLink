export default function DataTable({ columns = [], data = [], loading, emptyText='No data' }){
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            {columns.map((c, i) => <th key={i}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-4">Loading…</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-4 text-muted">{emptyText}</td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((c, i) => (
                  <td key={i}>{typeof c.cell === 'function' ? c.cell(row, idx) : row[c.accessor]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
