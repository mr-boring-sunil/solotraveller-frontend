import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, saveToken, clearToken, getToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true) // true while checking saved token on mount

  // ── On first load: try to restore session from saved JWT token ──
  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) { setLoading(false); return }
      try {
        const data = await authAPI.me()   // GET /api/auth/me
        setUser(data.user)
      } catch {
        clearToken()                      // token expired or invalid — clear it
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  // ── Login: POST /api/auth/login ──────────────────────────────────
  async function login(email, password, remember) {
    const data = await authAPI.login(email, password, remember)
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }

  // ── Signup: POST /api/auth/signup ────────────────────────────────
  async function signup(name, email, password) {
    const data = await authAPI.signup(name, email, password)
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }

  // ── Logout: POST /api/auth/logout ────────────────────────────────
  async function logout() {
    try { await authAPI.logout() } catch { /* ignore network errors on logout */ }
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
