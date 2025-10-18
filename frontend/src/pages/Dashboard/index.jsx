import { useEffect, useState } from 'react'
import DashboardCard from '../../components/common/DashboardCard'
import api from '../../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ users:null, donors:null, patients:null, matches:null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get('/stats/summary')
        if(active) setStats(res.data)
      } catch (e) {
        if(active) setError('Failed to load statistics')
      } finally {
        if(active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <>
  <h4 className="mb-2 text-center" style={{ color: 'var(--brand-green)' }}>Transplant Link Dashboard</h4>
  <p className="text-muted mb-4 mx-auto" style={{maxWidth:760, textAlign:'center'}}>
        This portal lets you register users, donors and patients, link them through organizations and doctors, and track organ donation transactions
        ("matches"). Use the sidebar to navigate: add or list records, and manage the data lifecycle.
      </p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3"><DashboardCard title="Users" value={loading? '…' : stats.users} desc="Registered user profiles" /></div>
        <div className="col-sm-6 col-lg-3"><DashboardCard title="Donors" value={loading? '…' : stats.donors} desc="Active donor records" /></div>
        <div className="col-sm-6 col-lg-3"><DashboardCard title="Patients" value={loading? '…' : stats.patients} desc="Patients awaiting / recorded" /></div>
        <div className="col-sm-6 col-lg-3"><DashboardCard title="Matches" value={loading? '…' : stats.matches} desc="Transactions recorded" /></div>
      </div>
    </>
  );
}
