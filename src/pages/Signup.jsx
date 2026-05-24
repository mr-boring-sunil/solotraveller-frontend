import { useState }            from 'react'
import { useNavigate, Link }   from 'react-router-dom'
import { motion }              from 'framer-motion'
import { useAuth }             from '../context/AuthContext'

function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)            s++
  if (/[A-Z]/.test(pw))          s++
  if (/[0-9!@#$%^&*]/.test(pw))  s++
  return s
}
const S_COLOR = ['', 'var(--rose)', 'var(--gold)', 'var(--teal)']
const S_LABEL = ['', 'Weak', 'Medium', 'Strong']

export default function Signup() {
  const navigate    = useNavigate()
  const { signup }  = useAuth()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const strength = getStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    if (strength < 2)         return setError('Password is too weak')
    setLoading(true)
    try {
      // Calls POST /api/auth/signup — see src/api.js authAPI.signup()
      await signup(name, email, password)
      navigate('/questionnaire')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Top-Left Corner Branding Logo */}
      <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 24 }}>✈️</span>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>SoloTraveller</span>
      </div>

      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-wrap">
        <motion.div
          className="auth-card"
          initial={{ opacity:0, y:28 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.5, ease:[.22,1,.36,1] }}
        >
          <div className="text-center mb-4">
            <h2 className="t-h1" style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Create Account</h2>
            <p className="t-body" style={{ marginTop: 6 }}>Start your solo adventure</p>
          </div>

          {error && (
            <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:14, padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--rose)', display:'flex', alignItems:'center', gap:8 }}>
              <i className="fa fa-circle-exclamation" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom:14 }}>
              <label className="t-small" style={{ display:'block', marginBottom:7 }}>Full Name</label>
              <div style={{ position:'relative' }}>
                <i className="fa fa-user" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13 }} />
                <input type="text" className="inp" style={{ paddingLeft:42 }} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label className="t-small" style={{ display:'block', marginBottom:7 }}>Email</label>
              <div style={{ position:'relative' }}>
                <i className="fa fa-envelope" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13 }} />
                <input type="email" className="inp" style={{ paddingLeft:42 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:4 }}>
              <label className="t-small" style={{ display:'block', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <i className="fa fa-lock" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13 }} />
                <input
                  type={showPass ? 'text' : 'password'} className="inp"
                  style={{ paddingLeft:42, paddingRight:46 }}
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer' }}>
                  <i className={`fa ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:3, overflow:'hidden', marginTop:6 }}>
                  <div className="strength-bar" style={{ width:`${(strength/3)*100}%`, background:S_COLOR[strength] }} />
                </div>
                <p style={{ fontSize:11, color:S_COLOR[strength], marginTop:4, fontWeight:600 }}>{S_LABEL[strength]}</p>
              </div>
            )}

            {/* Confirm Password */}
            <div style={{ marginBottom:22 }}>
              <label className="t-small" style={{ display:'block', marginBottom:7 }}>Confirm Password</label>
              <div style={{ position:'relative' }}>
                <i className="fa fa-lock" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:13 }} />
                <input type="password" className="inp" style={{ paddingLeft:42 }} value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
            </div>

            <button type="submit" className="btn-prime w-100" style={{ justifyContent:'center' }} disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Creating Account…</>
                : <><i className="fa fa-user-plus" /> Create Account</>
              }
            </button>
          </form>

          <p className="text-center mt-4 t-small">
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--violet-2)', fontWeight:600 }}>Log In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
