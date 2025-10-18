import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(()=> localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const login = (tok) => {
    localStorage.setItem('token', tok)
    setToken(tok)
  }
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  // optional future: validate token
  useEffect(()=>{ /* could ping /api/auth/me */ }, [])

  return <AuthContext.Provider value={{ token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth(){
  return useContext(AuthContext)
}
