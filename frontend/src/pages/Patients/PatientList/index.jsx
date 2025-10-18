import { useEffect, useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function PatientList(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function load(){
      try{
        setLoading(true)
        const res = await api.get(endpoints.patients.root)
        if(mounted){
          const raw = Array.isArray(res.data) ? res.data : []
          setItems(raw)
        }
      }catch(err){
        if(mounted){ setError('Failed to load patients.') }
      }finally{
        if(mounted){ setLoading(false) }
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = items.filter(p => {
    const t = (query||'').toLowerCase()
    return !t || [p.organ_req, p.reason_of_procurement, p.Doctor_ID, p.User_ID].filter(Boolean).some(v => String(v).toLowerCase().includes(t))
  })

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0" style={{color:'var(--brand-green)'}}>Patients</h5>
          <input className="form-control" placeholder="Search..." style={{maxWidth:240}} value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="table-responsive">
          <table className="table table-hover align-middle small">
            <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Patient_ID</th>
              <th>organ_req</th>
              <th>reason_of_procurement</th>
              <th>Doctor_ID</th>
              <th>User_ID</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">No patients found</td></tr>
            ) : (
              filtered.map((p, idx) => (
                <tr key={`${p.Patient_ID}-${p.organ_req}` || idx}>
                  <td>{idx+1}</td>
                  <td>{p.Patient_ID}</td>
                  <td>{p.organ_req}</td>
                  <td>{p.reason_of_procurement ?? '-'}</td>
                  <td>{p.Doctor_ID}</td>
                  <td>{p.User_ID}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => alert(JSON.stringify(p,null,2))}>View</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => { if(!window.confirm('Delete patient '+p.Patient_ID+' / '+p.organ_req+'?')) return; try { await api.delete(`/patients/${p.Patient_ID}/${encodeURIComponent(p.organ_req)}`); const fresh = await api.get(endpoints.patients.root); setItems(Array.isArray(fresh.data)? fresh.data: []);} catch(e){ alert('Delete failed'); } }}>Delete</button>
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
