import { useEffect, useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function ViewUsers(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function load(){
      try{
        setLoading(true)
        const res = await api.get(endpoints.users.root)
        if(mounted){
          const raw = Array.isArray(res.data) ? res.data : []
          setItems(raw)
        }
      }catch(err){
        if(mounted){ setError('Failed to load users.') }
      }finally{
        if(mounted){ setLoading(false) }
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = items.filter(u => {
    const t = (query||'').toLowerCase()
    return !t || [u.Name, u.Medical_history, u.City, u.State].filter(Boolean).some(v => String(v).toLowerCase().includes(t))
  })

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0" style={{color:'var(--brand-green)'}}>Users</h5>
          <input className="form-control" placeholder="Search..." style={{maxWidth:240}} value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="table-responsive">
          <table className="table table-hover align-middle small">
            <thead className="table-light">
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Medical Insurance</th>
              <th>Medical History</th>
              <th>Street</th>
              <th>City</th>
              <th>State</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-4 text-muted">No users found</td></tr>
            ) : (
              filtered.map((u, idx) => (
                <tr key={u.User_ID || idx}>
                  <td>{idx+1}</td>
                  <td>{u.User_ID}</td>
                  <td>{u.Name}</td>
                  <td>{u.Date_of_Birth}</td>
                  <td>{u.Medical_insurance ?? '-'}</td>
                  <td>{u.Medical_history ?? '-'}</td>
                  <td>{u.Street ?? '-'}</td>
                  <td>{u.City ?? '-'}</td>
                  <td>{u.State ?? '-'}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => alert(JSON.stringify(u,null,2))}>View</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => { if(!window.confirm('Delete user '+u.User_ID+'?')) return; try { await api.delete(`/users/${u.User_ID}`); const fresh = await api.get(endpoints.users.root); setItems(Array.isArray(fresh.data)? fresh.data: []);} catch(e){ alert('Delete failed'); } }}>Delete</button>
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
