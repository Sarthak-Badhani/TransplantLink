import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import endpoints from '../../services/endpoints'
import { setToken } from '../../auth'

export default function Login(){
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if(!form.username || !form.password){
      setError('Please enter username and password.')
      return
    }
    try{
      setLoading(true)
      // TODO: adjust endpoint to your Flask route
  const res = await api.post(endpoints.auth.login, form)
  const token = res?.data?.token || 'session'
  setToken(token)
      navigate('/')
    }catch(err){
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Login failed. Please check your credentials.'
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight:'100vh', background:'#f8f9fa'}}>
      <div style={{maxWidth:460, width:'100%'}}>
        <div className="text-center mb-4">
          <h2 style={{color:'var(--brand-green)', fontWeight:600, marginBottom:8}}>Transplant Link</h2>
          <p className="text-muted mb-0" style={{fontSize:14}}>A simplified organ donation and transplantation management portal for users, donors and patients.</p>
        </div>
      <div className="card shadow-sm mx-auto" style={{width:380}}>
        <div className="card-body">
          <h5 className="card-title mb-3" style={{color:'var(--brand-green)'}}>Sign in</h5>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="username"
                value={form.username}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
