import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function DeleteUser(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDelete = async () => {
    setError('')
    try{
      setLoading(true)
  await api.delete(endpoints.users.byId(id))
      navigate('/users')
    }catch(err){
      setError(err?.response?.data?.message || 'Failed to delete user.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Delete User</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <p>Are you sure you want to delete this user?</p>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={()=>navigate('/users')} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onDelete} disabled={loading}>{loading ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
