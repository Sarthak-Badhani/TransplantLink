import { useEffect, useState } from 'react'
import api from '../../../services/api'
import endpoints from '../../../services/endpoints'

export default function ManualMatching(){
  const [donors, setDonors] = useState([])
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState('')
  const [donorId, setDonorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load(){
      setLoading(true); setError(null)
      try {
        const [dRes, pRes] = await Promise.all([
          api.get(endpoints.donors.root),
          api.get(endpoints.patients.root)
        ])
        if(cancelled) return
        setDonors(dRes.data || [])
        setPatients(pRes.data || [])
      } catch (e){
        console.error(e)
        setError('Failed to load donors/patients')
      } finally {
        if(!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function onSubmit(e){
    e.preventDefault()
    setError(null); setSuccess(null)
    if(!patientId || !donorId){
      setError('Please select both patient and donor')
      return
    }
    // Local compatibility check
    const patient = patients.find(p => String(p.Patient_ID) === String(patientId))
    const donor = donors.find(d => String(d.Donor_ID) === String(donorId))
    const po = (patient?.organ_req || '').trim().toLowerCase()
    const do_ = (donor?.organ_donated || '').trim().toLowerCase()
    if(!po || !do_ || po !== do_){
      setError('Selected donor organ is not compatible with patient organ')
      return
    }
    setSubmitting(true)
    try{
      const body = { patient_id: Number(patientId), donor_id: Number(donorId) }
      const res = await api.post(endpoints.matching.manual, body)
      setSuccess(res?.data?.message || 'Match created successfully')
    }catch(e){
      console.error(e)
      setError(e?.response?.data?.error || 'Failed to create match')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3" style={{color:'var(--brand-green)'}}>Manual Matching</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
        {loading ? (
          <div className="text-muted">Loading options...</div>
        ) : (
          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Select Patient</label>
              <select className="form-select" value={patientId} onChange={e=>{ setPatientId(e.target.value); setDonorId(''); }}>
                <option value="">-- choose patient --</option>
                {patients.map(p => (
                  <option key={`${p.Patient_ID}-${p.organ_req || 'org'}`} value={p.Patient_ID}>
                    {p.Name || 'Unknown'} (#{p.Patient_ID}) – needs {p.organ_req}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Select Donor</label>
              <select className="form-select" value={donorId} onChange={e=>setDonorId(e.target.value)} disabled={!patientId}>
                <option value="">-- choose donor --</option>
                {donors
                  .filter(d => {
                    const p = patients.find(px => String(px.Patient_ID) === String(patientId))
                    if(!p) return false
                    const po = (p.organ_req || '').trim().toLowerCase()
                    const do_ = (d.organ_donated || '').trim().toLowerCase()
                    return po && do_ && po === do_
                  })
                  .map(d => (
                    <option key={d.Donor_ID} value={d.Donor_ID}>
                      {d.Name || 'Unknown'} (#{d.Donor_ID}) – {d.organ_donated}
                    </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-success" type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
