import { useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function RegisterDonor(){
  const [form, setForm] = useState({
    Donor_ID:'',
    organ_donated:'',
    reason_of_donation:'',
    Organization_ID:'',
    User_ID:''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(''); setError('')
    if(!form.Donor_ID || !form.organ_donated || !form.Organization_ID || !form.User_ID){
      setError('Donor_ID, organ_donated, Organization_ID and User_ID are required.')
      return
    }
    try{
      setLoading(true)
      await api.post(endpoints.donors.root, {
        ...form,
        reason_of_donation: form.reason_of_donation || null
      })
      setMessage('Donor registered successfully!')
      setForm({Donor_ID:'',organ_donated:'',reason_of_donation:'',Organization_ID:'',User_ID:''})
    }catch(err){
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to register donor.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Register Donor</h5>
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form className="row g-3" onSubmit={onSubmit}>
          <div className="col-md-4">
            <label className="form-label">Donor_ID</label>
            <input name="Donor_ID" className="form-control" value={form.Donor_ID} onChange={onChange} required />
          </div>
          <div className="col-md-8">
            <label className="form-label">organ_donated</label>
            <input name="organ_donated" className="form-control" value={form.organ_donated} onChange={onChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">reason_of_donation</label>
            <input name="reason_of_donation" className="form-control" value={form.reason_of_donation} onChange={onChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Organization_ID</label>
            <input name="Organization_ID" className="form-control" value={form.Organization_ID} onChange={onChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label">User_ID</label>
            <input name="User_ID" className="form-control" value={form.User_ID} onChange={onChange} required />
          </div>
          <div className="col-12">
            <button className="btn btn-success" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
