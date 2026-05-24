import { useState }            from 'react'
import { useNavigate, Link }   from 'react-router-dom'
import { motion }              from 'framer-motion'
import { useAuth }             from '../context/AuthContext'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Calls POST /api/auth/login — see src/api.js authAPI.login()
      await login(email, password, remember)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Top-Left Corner Branding Logo */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 24 }}>✈️</span>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>SoloTraveller</span>
      </div>

      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-wrap">
        <div className="auth-split-container">
          
          {/* Left Side: Website Description */}
          <motion.div
            className="auth-desc-side"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [.22, 1, .36, 1] }}
          >
            <span className="pill pill-violet" style={{ marginBottom: 16 }}>
              ✨ AI Travel Companion
            </span>
            <h1 className="t-display grad-main" style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              Explore the World on Your Own Terms.
            </h1>
            <p className="t-body" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 32, color: 'var(--text-2)' }}>
              Embark on solo journeys with peace of mind. Plan, structure, and explore while staying safe, organized, and connected with our travel features.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div className="desc-feature-item">
                <div style={{ background: 'rgba(124, 106, 255, 0.12)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-2)', fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-map-location-dot" />
                </div>
                <div>
                  <h3 className="t-h3" style={{ color: 'var(--text)', margin: '0 0 4px', fontSize: 14 }}>Tailored Itineraries</h3>
                  <p className="t-small" style={{ margin: 0, lineHeight: 1.4 }}>Create a complete day-by-day itinerary structured around your pace, preferences, and daily budget.</p>
                </div>
              </div>

              <div className="desc-feature-item">
                <div style={{ background: 'rgba(45, 212, 191, 0.12)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-shield-heart" />
                </div>
                <div>
                  <h3 className="t-h3" style={{ color: 'var(--text)', margin: '0 0 4px', fontSize: 14 }}>Safety Checklists</h3>
                  <p className="t-small" style={{ margin: 0, lineHeight: 1.4 }}>Stay prepared with safety recommendations tailored specifically for solo travel scenarios.</p>
                </div>
              </div>

              <div className="desc-feature-item">
                <div style={{ background: 'rgba(251, 113, 133, 0.12)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)', fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-circle-exclamation" />
                </div>
                <div>
                  <h3 className="t-h3" style={{ color: 'var(--text)', margin: '0 0 4px', fontSize: 14 }}>One-Tap Emergency SOS</h3>
                  <p className="t-small" style={{ margin: 0, lineHeight: 1.4 }}>Instantly share your real-time GPS location with your emergency contacts when in need.</p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Side: Login Box */}
          <div className="auth-form-side">
            <motion.div
              className="auth-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [.22, 1, .36, 1] }}
            >
              <div className="text-center mb-4">
                <h2 className="t-h1" style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Welcome Back</h2>
                <p className="t-body" style={{ marginTop: 6 }}>Log in to your explorer account</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 14, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa fa-circle-exclamation" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label className="t-small" style={{ display: 'block', marginBottom: 7 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa fa-envelope" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 13 }} />
                    <input
                      type="email" className="inp" style={{ paddingLeft: 42 }}
                      placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required autoComplete="email"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="t-small" style={{ display: 'block', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa fa-lock" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 13 }} />
                    <input
                      type={showPass ? 'text' : 'password'} className="inp"
                      style={{ paddingLeft: 42, paddingRight: 46 }}
                      placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                    >
                      <i className={`fa ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                  <input
                    type="checkbox" id="rem"
                    checked={remember} onChange={e => setRemember(e.target.checked)}
                    style={{ accentColor: 'var(--violet)', width: 15, height: 15 }}
                  />
                  <label htmlFor="rem" className="t-small" style={{ cursor: 'pointer' }}>Remember me</label>
                </div>

                <button type="submit" className="btn-prime w-100" style={{ justifyContent: 'center' }} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm" /> Logging in…</>
                    : <><i className="fa fa-arrow-right-to-bracket" /> Log In</>
                  }
                </button>
              </form>

              <p className="text-center mt-4 t-small">
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: 'var(--violet-2)', fontWeight: 600 }}>Sign Up</Link>
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
