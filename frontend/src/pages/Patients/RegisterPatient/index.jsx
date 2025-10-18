import { useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function RegisterPatient(){
  const [form, setForm] = useState({
    Patient_ID:'',
    organ_req:'',
    reason_of_procurement:'',
    Doctor_ID:'',
    User_ID:''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(''); setError('')
    if(!form.Patient_ID || !form.organ_req || !form.Doctor_ID || !form.User_ID){
      setError('Patient_ID, organ_req, Doctor_ID and User_ID are required.')
      return
    }
    try{
      setLoading(true)
      await api.post(endpoints.patients.root, {
        ...form,
        reason_of_procurement: form.reason_of_procurement || null
      })
      setMessage('Patient registered successfully!')
      setForm({Patient_ID:'',organ_req:'',reason_of_procurement:'',Doctor_ID:'',User_ID:''})
    }catch(err){
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to register patient.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Register Patient</h5>
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form className="row g-3" onSubmit={onSubmit}>
          <div className="col-md-4">
            <label className="form-label">Patient_ID</label>
            <input name="Patient_ID" className="form-control" value={form.Patient_ID} onChange={onChange} required />
          </div>
          <div className="col-md-8">
            <label className="form-label">organ_req</label>
            <input name="organ_req" className="form-control" value={form.organ_req} onChange={onChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">reason_of_procurement</label>
            <input name="reason_of_procurement" className="form-control" value={form.reason_of_procurement} onChange={onChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Doctor_ID</label>
            <input name="Doctor_ID" className="form-control" value={form.Doctor_ID} onChange={onChange} required />
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
  )
}
