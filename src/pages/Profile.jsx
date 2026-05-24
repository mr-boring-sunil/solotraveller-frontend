import { useState, useEffect }  from 'react'
import { useNavigate }          from 'react-router-dom'
import { motion }               from 'framer-motion'
import { useAuth }              from '../context/AuthContext'
import { userAPI }              from '../api'

const TEXT_FIELDS = [
  { key:'name',    label:'Full Name',    type:'text',   placeholder:'John Doe',           icon:'fa-user',        required:true },
  { key:'email',   label:'Email',        type:'email',  placeholder:'you@example.com',    icon:'fa-envelope',    required:true },
  { key:'age',     label:'Age',          type:'number', placeholder:'25',                 icon:'fa-calendar'      },
  { key:'place',   label:'Hometown',     type:'text',   placeholder:'Mumbai',             icon:'fa-map-pin'       },
  { key:'address', label:'Address',      type:'text',   placeholder:'Street, Area, City', icon:'fa-location-dot'  },
  { key:'phone',   label:'Phone',        type:'text',   placeholder:'+91 987654321',      icon:'fa-phone'         },
]
const SELECT_FIELDS = [
  { key:'tripType', label:'Travel Preference', icon:'fa-compass',  options:['Adventure','Culture','Relaxation','Food & Drink','Nature','Nightlife'] },
  { key:'food',     label:'Food Preference',   icon:'fa-utensils', options:['Vegetarian','Non-Veg','Vegan','Seafood Lover'] },
  { key:'pace',     label:'Travel Pace',       icon:'fa-gauge',    options:['Relaxed','Moderate','Fast-Paced'] },
]

const EMPTY_PROFILE = { name:'', email:'', age:'', place:'', address:'', phone:'', tripType:'', food:'', pace:'', budget:'' }

export default function Profile() {
  const navigate        = useNavigate()
  const { user, logout } = useAuth()

  const [profile,  setProfile]  = useState(EMPTY_PROFILE)
  const [draft,    setDraft]    = useState(EMPTY_PROFILE)
  const [editMode, setEditMode] = useState(false)
  const [loading,  setLoading]  = useState(true)    // initial fetch
  const [saving,   setSaving]   = useState(false)   // save in progress
  const [toast,    setToast]    = useState('')
  const [fetchErr, setFetchErr] = useState('')

  const initials = (profile.name || user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)

  // ── Fetch profile on mount ─────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await userAPI.getProfile()   // GET /api/user/profile
        setProfile(data.user)
        setDraft(data.user)
      } catch (err) {
        setFetchErr(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Save changes ───────────────────────────────────────────────
  async function save() {
    setSaving(true)
    try {
      const data = await userAPI.updateProfile(draft)  // PUT /api/user/profile
      setProfile(data.user)
      setDraft(data.user)
      setEditMode(false)
      setToast('Profile saved!')
      setTimeout(() => setToast(''), 2500)
    } catch (err) {
      setToast(`Error: ${err.message}`)
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ── Logout ─────────────────────────────────────────────────────
  async function handleLogout() {
    await logout()   // calls POST /api/auth/logout, clears token
    navigate('/login')
  }

  const inpStyle = {
    background:'var(--inp-bg)', border:'1px solid var(--border-2)',
    borderRadius:14, padding:'13px 16px', color:'var(--text)',
    fontFamily:'DM Sans', fontSize:14, width:'100%', outline:'none',
    transition:'border-color .2s, box-shadow .2s',
  }
  const focusIn  = e => { e.target.style.borderColor='rgba(124,106,255,.6)'; e.target.style.boxShadow='0 0 0 3px rgba(124,106,255,.1)' }
  const focusOut = e => { e.target.style.borderColor='var(--border-2)';       e.target.style.boxShadow='none' }

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner-border" style={{ color:'var(--violet)', width:32, height:32, borderWidth:2 }} />
    </div>
  )

  return (
    <div className="page">
      <div className="orb orb-1" style={{ opacity:.5 }} />
      <div className="page-body">

        {fetchErr && (
          <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:14, padding:'12px 16px', marginBottom:20, fontSize:13, color:'var(--rose)' }}>
            <i className="fa fa-triangle-exclamation me-2" />Failed to load profile: {fetchErr}
          </div>
        )}

        {/* Avatar header */}
        <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} className="text-center mb-4">
          <div className="avatar-lg mb-3">{initials}</div>
          <h1 className="t-h1" style={{ marginBottom:3 }}>{profile.name || 'Your Profile'}</h1>
          <p className="t-body" style={{ fontSize:13, marginBottom:12 }}>{profile.email}</p>

          {!editMode ? (
            <button className="btn-ghost" style={{ padding:'9px 22px', fontSize:13 }} onClick={() => { setDraft({...profile}); setEditMode(true) }}>
              <i className="fa fa-pen" /> Edit Profile
            </button>
          ) : (
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn-prime" style={{ padding:'9px 20px', fontSize:13 }} onClick={save} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm" /> Saving…</> : <><i className="fa fa-check" /> Save</>}
              </button>
              <button className="btn-ghost" style={{ padding:'9px 20px', fontSize:13 }} onClick={() => setEditMode(false)}>
                <i className="fa fa-xmark" /> Cancel
              </button>
            </div>
          )}
        </motion.div>

        <hr style={{ borderColor:'var(--border)', margin:'0 0 20px' }} />

        {/* Fields */}
        {!editMode ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}>
            {[...TEXT_FIELDS, { key:'budget', label:'Daily Budget', icon:'fa-indian-rupee-sign' }, ...SELECT_FIELDS].map(f => (
              <div key={f.key} className="info-row">
                <span className="info-lbl"><i className={`fa-solid ${f.icon} me-2`} />{f.label}</span>
                <span className="info-val">
                  {profile[f.key]
                    ? (f.key === 'budget' ? `₹${profile[f.key]}` : profile[f.key])
                    : <span className="t-small">—</span>}
                </span>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {TEXT_FIELDS.map(f => (
              <div key={f.key}>
                <label className="t-small" style={{ display:'block', marginBottom:6 }}><i className={`fa-solid ${f.icon} me-2`} />{f.label}</label>
                <input type={f.type} style={inpStyle} placeholder={f.placeholder} value={draft[f.key] || ''} onChange={e => setDraft(d => ({...d, [f.key]:e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}

            <div>
              <label className="t-small" style={{ display:'block', marginBottom:6 }}><i className="fa-solid fa-indian-rupee-sign me-2" />Daily Budget</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--violet-2)', fontWeight:700 }}>₹</span>
                <input type="number" style={{ ...inpStyle, paddingLeft:30 }} min={100} placeholder="3000" value={draft.budget || ''} onChange={e => setDraft(d => ({...d, budget:e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {SELECT_FIELDS.map(f => (
              <div key={f.key}>
                <label className="t-small" style={{ display:'block', marginBottom:6 }}><i className={`fa-solid ${f.icon} me-2`} />{f.label}</label>
                <select className="inp inp-select" value={draft[f.key] || ''} onChange={e => setDraft(d => ({...d, [f.key]:e.target.value}))} onFocus={e => e.target.style.borderColor='rgba(124,106,255,.6)'} onBlur={e => e.target.style.borderColor='var(--border-2)'}>
                  <option value="">Select…</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </motion.div>
        )}

        <hr style={{ borderColor:'var(--border)', margin:'24px 0 16px' }} />
        <button
          onClick={handleLogout}
          style={{ width:'100%', padding:14, borderRadius:16, background:'transparent', border:'1px solid rgba(251,113,133,0.25)', color:'var(--rose)', fontFamily:'DM Sans', fontWeight:600, fontSize:14, cursor:'pointer', transition:'background .2s' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(251,113,133,0.08)'}
          onMouseOut={e  => e.currentTarget.style.background='transparent'}
        >
          <i className="fa fa-arrow-right-from-bracket me-2" />Log Out
        </button>
      </div>

      {toast && (
        <motion.div
          className="toast"
          style={{ color: toast.startsWith('Error') ? 'var(--rose)' : 'var(--teal)', borderColor: toast.startsWith('Error') ? 'rgba(251,113,133,0.3)' : 'rgba(45,212,191,0.3)' }}
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
        >
          <i className={`fa ${toast.startsWith('Error') ? 'fa-circle-exclamation' : 'fa-circle-check'}`} /> {toast}
        </motion.div>
      )}
    </div>
  )
}
