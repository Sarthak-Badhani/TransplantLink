import { useEffect, useState } from 'react'
import api from '../../services/api'
import endpoints from '../../services/endpoints'
import DashboardCard from '../../components/common/DashboardCard'

export default function Reports(){
  const [summary, setSummary] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function normalizeStatus(raw){
    if (raw === 1 || raw === '1' || raw === true) return 'confirmed'
    if (raw === 0 || raw === '0' || raw === false) return 'pending'
    if (typeof raw === 'string') {
      const s = raw.toLowerCase()
      if (s === 'generated') return 'pending'
      return s
    }
    return 'generated'
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const [sumRes, mRes] = await Promise.all([
          api.get(endpoints.reports.summary),
          api.get(endpoints.reports.matches)
        ])
        if(cancelled) return
        setSummary(sumRes.data || {})
        setMatches(mRes.data || [])
      } catch (e){
        console.error(e)
        setError('Failed to load reports data')
      } finally {
        if(!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function refreshReports(){
    setLoading(true); setError(null)
    try {
      const [sumRes, mRes] = await Promise.all([
        api.get(endpoints.reports.summary),
        api.get(endpoints.reports.matches)
      ])
      setSummary(sumRes.data || {})
      setMatches(mRes.data || [])
    } catch (e){
      console.error(e)
      setError('Failed to refresh reports')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1" style={{color:'var(--brand-green)'}}>Reports & Analytics</h5>
              <p className="text-muted mb-0">Summary statistics and historical match records.</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={refreshReports} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading && <div className="text-muted">Loading...</div>}
      {!loading && summary && (
        <div className="row g-3">
          <div className="col-md-3">
            <DashboardCard title="Patients" value={summary.patients} desc="Total registered patients" />
          </div>
            <div className="col-md-3">
            <DashboardCard title="Donors" value={summary.donors} desc="Total registered donors" />
          </div>
          <div className="col-md-3">
            <DashboardCard title="Confirmed" value={summary.confirmed} desc="Total confirmed matches" />
          </div>
          <div className="col-md-3">
            <DashboardCard title="Pending" value={summary.pending} desc="Pending match proposals" />
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0" style={{color:'var(--brand-green)'}}>Match History</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Donor</th>
                  <th>Organ</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {matches?.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted">No match records</td></tr>
                )}
                {matches.map((m, i) => (
                  <tr key={i}>
                    <td>{m.patient_name || '—'}</td>
                    <td>{m.donor_name || '—'}</td>
                    <td>{m.organ || '—'}</td>
                    {(() => {
                      const status = normalizeStatus(m.Status)
                      const variant = (status === 'manual' || status === 'confirmed') ? 'success' : (status === 'pending' ? 'warning' : 'secondary')
                      return (
                        <td><span className={`badge bg-${variant}`}>{status}</span></td>
                      )
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
