import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { isAuthed, clearToken } from '../auth';

export default function ProtectedRoute(){
  const [status, setStatus] = useState(isAuthed() ? 'checking' : 'no-token');

  useEffect(() => {
    if(status !== 'checking') return;
    let active = true;
    (async () => {
      try {
        await api.get('/auth/me');
        if(active) setStatus('ok');
      } catch (e) {
        clearToken();
        if(active) setStatus('unauthed');
      }
    })();
    return () => { active = false };
  }, [status]);

  if(status === 'no-token' || status === 'unauthed') return <Navigate to="/login" replace />;
  if(status === 'checking') return <div style={{padding:32}}>Checking session…</div>;
  return <Outlet />;
}
