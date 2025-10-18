import { useEffect, useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function DonorList(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function load(){
      try{
        setLoading(true)
        const res = await api.get(endpoints.donors.root)
        if(mounted){
          const raw = Array.isArray(res.data) ? res.data : []
          setItems(raw)
        }
      }catch(err){
        if(mounted){ setError('Failed to load donors.') }
      }finally{
        if(mounted){ setLoading(false) }
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = items.filter(d => {
    const t = (query||'').toLowerCase()
    return !t || [d.organ_donated, d.reason_of_donation, d.Organization_ID, d.User_ID].filter(Boolean).some(v => String(v).toLowerCase().includes(t))
  })

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0" style={{color:'var(--brand-green)'}}>Donors</h5>
          <input className="form-control" placeholder="Search..." style={{maxWidth:240}} value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="table-responsive">
          <table className="table table-hover align-middle small">
            <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Donor_ID</th>
              <th>organ_donated</th>
              <th>reason_of_donation</th>
              <th>Organization_ID</th>
              <th>User_ID</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">No donors found</td></tr>
            ) : (
              filtered.map((d, idx) => (
                <tr key={d.Donor_ID || idx}>
                  <td>{idx+1}</td>
                  <td>{d.Donor_ID}</td>
                  <td>{d.organ_donated}</td>
                  <td>{d.reason_of_donation ?? '-'}</td>
                  <td>{d.Organization_ID}</td>
                  <td>{d.User_ID}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => alert(JSON.stringify(d,null,2))}>View</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => { if(!window.confirm('Delete donor '+d.Donor_ID+'?')) return; try { await api.delete(`/donors/${d.Donor_ID}`); const fresh = await api.get(endpoints.donors.root); setItems(Array.isArray(fresh.data)? fresh.data: []);} catch(e){ alert('Delete failed'); } }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
