import { useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'
import FormInput from '../../../components/forms/FormInput'

export default function AddUser(){
  const [form, setForm] = useState({
    User_ID:'',
    Name:'',
    Date_of_Birth:'',
    Medical_insurance:'',
    Medical_history:'',
    Street:'',
    City:'',
    State:''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage(''); setError('')
    if(!form.User_ID || !form.Name || !form.Date_of_Birth){
      setError('User_ID, Name and Date_of_Birth are required.')
      return
    }
    try{
      setLoading(true)
      await api.post(endpoints.users.root, {
        ...form,
        Medical_insurance: form.Medical_insurance || null,
        Medical_history: form.Medical_history || null,
        Street: form.Street || null,
        City: form.City || null,
        State: form.State || null,
      })
      setMessage('User created successfully!')
      setForm({User_ID:'',Name:'',Date_of_Birth:'',Medical_insurance:'',Medical_history:'',Street:'',City:'',State:''})
    }catch(err){
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create user.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title" style={{color:'var(--brand-green)'}}>Add User</h5>
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form className="row g-3" onSubmit={onSubmit}>
          <div className="col-md-4"><FormInput label="User_ID" name="User_ID" value={form.User_ID} onChange={onChange} required /></div>
          <div className="col-md-8"><FormInput label="Name" name="Name" value={form.Name} onChange={onChange} required /></div>
          <div className="col-md-6">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="Date_of_Birth" className="form-control" value={form.Date_of_Birth} onChange={onChange} required />
          </div>
          <div className="col-md-6"><FormInput label="Medical insurance" name="Medical_insurance" value={form.Medical_insurance} onChange={onChange} /></div>
          <div className="col-md-6"><FormInput label="Medical history" name="Medical_history" value={form.Medical_history} onChange={onChange} /></div>
          <div className="col-md-6"><FormInput label="Street" name="Street" value={form.Street} onChange={onChange} /></div>
          <div className="col-md-4"><FormInput label="City" name="City" value={form.City} onChange={onChange} /></div>
            <div className="col-md-4"><FormInput label="State" name="State" value={form.State} onChange={onChange} /></div>
          <div className="col-12">
            <button className="btn btn-success" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
