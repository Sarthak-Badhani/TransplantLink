import { useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function AutoMatching(){
  const [matches, setMatches] = useState([])
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generateAutoMatches(){
    setGenLoading(true); setError(null)
    try {
      const res = await api.get(endpoints.matching.auto)
      setMatches(res.data || [])
    } catch (e){
      console.error(e)
      setError(e?.response?.data?.error || 'Auto matching failed')
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0" style={{color:'var(--brand-green)'}}>Auto Matching</h5>
          <button className="btn btn-sm btn-success" disabled={genLoading} onClick={generateAutoMatches}>
            {genLoading ? 'Generating...' : 'Generate Matches'}
          </button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Patient Name</th>
                <th>Patient Organ</th>
                <th>Donor Name</th>
                <th>Donor Organ</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No matches yet. Click "Generate Matches".</td>
                </tr>
              )}
              {matches.map((m, i) => (
                <tr key={i}>
                  <td>{m.patient?.Name || '—'}</td>
                  <td>{m.patient?.organ_req || '—'}</td>
                  <td>{m.donor?.Name || '—'}</td>
                  <td>{m.donor?.organ_donated || '—'}</td>
                  <td><span className="badge bg-secondary">{m.status || 'generated'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
