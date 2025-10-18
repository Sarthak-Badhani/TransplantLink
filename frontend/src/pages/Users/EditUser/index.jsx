import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function EditUser(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', role:'Staff' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function load(){
      try{
  const res = await api.get(endpoints.users.byId(id))
        const u = res.data || {}
        if(mounted){ setForm({ name:u.name || '', email:u.email || '', role:u.role || 'Staff' }) }
      }catch(err){
        if(mounted){ setError('Failed to load user.') }
      }finally{
        if(mounted){ setLoading(false) }
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    if(!form.name || !form.email){ setError('Name and email are required.'); return }
    try{
      setSaving(true)
      // Prefer PATCH if backend supports partial updates
  await api.put(endpoints.users.byId(id), form)
      setMessage('User updated!')
      setTimeout(() => navigate('/users'), 600)
    }catch(err){
      setError(err?.response?.data?.message || 'Failed to update user.')
    }finally{
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Edit User</h5>
        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form className="row g-3" onSubmit={onSubmit}>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input name="name" className="form-control" value={form.name} onChange={onChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" value={form.email} onChange={onChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Role</label>
                <select name="role" className="form-select" value={form.role} onChange={onChange}>
                  <option>Admin</option>
                  <option>Staff</option>
                </select>
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-success" disabled={saving}>{saving ? 'Updating…' : 'Update'}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={()=>navigate('/users')}>Cancel</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
