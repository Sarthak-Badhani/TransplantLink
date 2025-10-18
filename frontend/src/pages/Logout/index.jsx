import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import endpoints from '../../services/endpoints'
import { clearToken } from '../../auth'

export default function Logout(){
  const navigate = useNavigate()
  useEffect(() => {
    // Clear token and any user session info
    (async () => {
      try { await api.post(endpoints.auth.logout); } catch(e) { /* ignore */ }
      clearToken();
    })();
    // Could also clear other keys if you add them later
    const timer = setTimeout(()=> navigate('/login', { replace:true }), 300)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Logging out…</h5>
        <p className="text-muted mb-0">Clearing your session and redirecting.</p>
      </div>
    </div>
  );
}
