import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion }      from 'framer-motion'
import { useAuth }     from '../context/AuthContext'
import { useTrip }     from '../context/TripContext'

const ease = [0.22, 1, 0.36, 1]
const f = (d = 0) => ({ initial:{ opacity:0, y:16 }, animate:{ opacity:1, y:0 }, transition:{ duration:0.4, delay:d, ease } })

function parseTime(timeStr) {
  if (!timeStr) return 0
  const cleaned = timeStr.trim().toUpperCase()
  const ampmMatch = cleaned.match(/^(\d+):(\d+)\s*(AM|PM)$/)
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10)
    const minutes = parseInt(ampmMatch[2], 10)
    const ampm = ampmMatch[3]
    if (ampm === 'PM' && hours < 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }
  const standardMatch = cleaned.match(/^(\d+):(\d+)$/)
  if (standardMatch) {
    const hours = parseInt(standardMatch[1], 10)
    const minutes = parseInt(standardMatch[2], 10)
    return hours * 60 + minutes
  }
  return 0
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trips, tripsLoading, tripsError, getActiveTrip, fetchItinerary, getTripItinerary } = useTrip()

  const active      = getActiveTrip()
  const firstName   = user?.name?.split(' ')[0] || 'Explorer'
  const initials    = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  const hour        = new Date().getHours()
  const greet       = hour < 12 ? '☀️ Morning' : hour < 17 ? '🌤️ Afternoon' : '🌙 Evening'
  const totalDays   = trips.reduce((s, t) => s + t.days, 0)
  const totalBudget = trips.reduce((s, t) => s + Number(t.budget) * t.days, 0)

  let heroPillLabel = 'Ongoing Trip'
  let heroPillClass = 'pill-teal'
  let heroProgressLabel = 'Day 1 of 1'
  let heroProgressPercent = 0
  let heroProgressColor = 'linear-gradient(90deg,var(--violet),var(--teal))'

  // Live Guide variables
  let currentStop = null
  let nextStop = null
  let statusMessage = ""
  const schedule = active ? getTripItinerary(active._id || active.id) : []

  useEffect(() => {
    if (active) {
      fetchItinerary(active._id || active.id)
    }
  }, [active, fetchItinerary])

  if (active) {
    if (active.status === 'active') {
      heroPillLabel = 'Ongoing Trip'
      heroPillClass = 'pill-teal'
      let currentDay = 1
      if (active.startDate) {
        const today = new Date()
        today.setHours(0,0,0,0)
        const start = new Date(active.startDate)
        start.setHours(0,0,0,0)
        const diffTime = today - start
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
        currentDay = Math.max(1, Math.min(diffDays, active.days))
      }
      heroProgressLabel = `Day ${currentDay} of ${active.days}`
      heroProgressPercent = Math.round((currentDay / active.days) * 100)
      heroProgressColor = 'linear-gradient(90deg,var(--violet),var(--teal))'

      // Calculate live stops
      if (schedule && schedule.length > 0) {
        const dayData = schedule.find(d => d.day === currentDay) || schedule[currentDay - 1]
        if (dayData && dayData.items && dayData.items.length > 0) {
          const now = new Date()
          const currentMinutes = now.getHours() * 60 + now.getMinutes()
          const sortedItems = [...dayData.items].sort((a, b) => parseTime(a.time) - parseTime(b.time))
          
          let currentStopIndex = -1
          for (let i = sortedItems.length - 1; i >= 0; i--) {
            if (parseTime(sortedItems[i].time) <= currentMinutes) {
              currentStopIndex = i
              break
            }
          }
          
          if (currentStopIndex === -1) {
            nextStop = sortedItems[0]
            statusMessage = `Starting soon! Your first stop is at ${nextStop.time}.`
          } else {
            currentStop = sortedItems[currentStopIndex]
            if (currentStopIndex + 1 < sortedItems.length) {
              nextStop = sortedItems[currentStopIndex + 1]
              statusMessage = `You should be at ${currentStop.title} right now. Next up: ${nextStop.title} at ${nextStop.time}.`
            } else {
              const nextDayData = schedule.find(d => d.day === currentDay + 1)
              if (nextDayData && nextDayData.items && nextDayData.items.length > 0) {
                const tomorrowFirst = nextDayData.items[0]
                statusMessage = `Done with Day ${currentDay} schedule! Tomorrow's first stop: ${tomorrowFirst.title} at ${tomorrowFirst.time}.`
              } else {
                statusMessage = "You've finished your itinerary schedule for the trip! Hope you had an amazing time!"
              }
            }
          }
        }
      }
    } else if (active.status === 'past') {
      heroPillLabel = 'Completed'
      heroPillClass = 'pill-dim'
      heroProgressLabel = 'Trip Finished'
      heroProgressPercent = 100
      heroProgressColor = 'var(--text-3)'
      statusMessage = "Trip completed! Where are we going next?"
    } else { // upcoming
      heroPillLabel = 'Upcoming Trip'
      heroPillClass = 'pill-violet'
      heroProgressLabel = active.startDate ? `Starts: ${active.startDate}` : 'Not started yet'
      heroProgressPercent = 0
      heroProgressColor = 'var(--border-2)'
      statusMessage = active.startDate ? `Your trip starts on ${active.startDate}. Get ready!` : "No start date set yet. Tap View Itinerary to set one."
    }
  }

  return (
    <div className="page">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <div className="page-body">

        {/* ── Header ── */}
        <motion.div {...f(0)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <p className="t-label" style={{ marginBottom:5 }}>{greet}</p>
            <h1 className="t-display">
              Hey, <span className="grad-main">{firstName}</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale:1.08 }} whileTap={{ scale:.93 }}
            onClick={() => navigate('/profile')}
            className="avatar-lg"
            style={{ width:46, height:46, fontSize:15, flexShrink:0, cursor:'pointer' }}
          >{initials}</motion.button>
        </motion.div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        {tripsLoading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div className="spinner-border" style={{ color:'var(--violet)', width:32, height:32, borderWidth:2 }} />
            <p className="t-body" style={{ marginTop:14 }}>Loading your trips…</p>
          </div>
        ) : tripsError ? (
          <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:16, padding:'16px 20px', marginBottom:20, fontSize:13, color:'var(--rose)' }}>
            <i className="fa fa-triangle-exclamation me-2" />Failed to load trips: {tripsError}
          </div>
        ) : (
        <div className="dash-layout">

          {/* ════ LEFT COLUMN — main content ════ */}
          <div className="dash-left">

            {/* Active trip hero */}
            {active && (
              <motion.div {...f(0.07)} style={{ marginBottom:16, cursor:'pointer' }} onClick={() => navigate('/itinerary')}>
                <div className="hero-card">
                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <span className={`pill ${heroPillClass}`}>
                        <i className="fa fa-circle" style={{ fontSize:6 }} /> {heroPillLabel}
                      </span>
                      <span style={{ fontSize:42, lineHeight:1 }}>{active.emoji}</span>
                    </div>
                    <h2 className="t-h1" style={{ marginBottom:5 }}>{active.destination}</h2>
                    <p className="t-body" style={{ marginBottom:16 }}>
                      {active.days} days · {active.tripType} · ₹{Number(active.budget).toLocaleString()}/day
                    </p>
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span className="t-small">{heroProgressLabel}</span>
                        <span style={{ fontFamily:'DM Mono', fontSize:11, color: active.status === 'active' ? 'var(--teal)' : 'var(--text-3)' }}>{heroProgressPercent}%</span>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:3, overflow:'hidden' }}>
                        <motion.div
                          initial={{ width:0 }} animate={{ width:`${heroProgressPercent}%` }}
                          transition={{ duration:1.1, delay:0.5, ease }}
                          style={{ height:'100%', borderRadius:99, background: heroProgressColor }}
                        />
                      </div>
                    </div>

                    {/* Live Guide widget */}
                    {active.status === 'active' && (
                      <div 
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          padding: '14px',
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="live-dot" />
                          <span style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)' }}>
                            Live Guide
                          </span>
                        </div>

                        {!schedule || schedule.length === 0 ? (
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-3)' }}>
                            No itinerary saved yet. Click below to generate and plan your stops!
                          </p>
                        ) : (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {currentStop ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{currentStop.emoji || '📍'}</span>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: '9px', color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Current Stop</p>
                                    <p className="t-h3" style={{ margin: 0, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                      {currentStop.title}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '20px', flexShrink: 0 }}>🏁</span>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: '9px', color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status</p>
                                    <p className="t-h3" style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                                      Ready to start your day!
                                    </p>
                                  </div>
                                </div>
                              )}

                              {nextStop && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{nextStop.emoji || '➡️'}</span>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: '9px', color: 'var(--text-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Next Stop ({nextStop.time})</p>
                                    <p className="t-body" style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {nextStop.title}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-3)', fontStyle: 'italic', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                              {statusMessage}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <button className="btn-prime" style={{ padding:'9px 18px', fontSize:13 }}>
                      <i className="fa fa-map" /> View Itinerary
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats row — 3 equal columns */}
            <motion.div {...f(0.12)} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { emoji:'✈️', val:trips.length,   lbl:'Trips',  bg:'rgba(124,106,255,0.14)', bdr:'rgba(124,106,255,0.2)', cls:'grad-violet' },
                { emoji:'📅', val:totalDays,       lbl:'Days',   bg:'rgba(45,212,191,0.11)',  bdr:'rgba(45,212,191,0.2)',  cls:'grad-teal' },
                { emoji:'💰', val:`₹${(totalBudget/1000).toFixed(0)}k`, lbl:'Budget', bg:'rgba(251,191,36,0.11)', bdr:'rgba(251,191,36,0.2)', cls:'grad-gold' },
              ].map((s,i) => (
                <div key={i} className="stat-cell" style={{ background:s.bg, border:`1px solid ${s.bdr}` }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{s.emoji}</div>
                  <div className={`stat-num ${s.cls}`}>{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </motion.div>

            {/* Quick actions — 4 tiles in a row */}
            <motion.div {...f(0.17)}>
              <span className="section-label">Quick Actions</span>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {[
                  { icon:'fa-plus',          label:'New Trip',  color:'var(--violet)', bg:'rgba(124,106,255,0.14)', action:()=>navigate('/questionnaire') },
                  { icon:'fa-shield-halved', label:'Safety',    color:'var(--rose)',   bg:'rgba(251,113,133,0.14)', action:()=>navigate('/safety') },
                  { icon:'fa-map',           label:'Itinerary', color:'var(--teal)',   bg:'rgba(45,212,191,0.14)',  action:()=>navigate('/itinerary') },
                  { icon:'fa-circle-user',   label:'Profile',   color:'var(--gold)',   bg:'rgba(251,191,36,0.14)',  action:()=>navigate('/profile') },
                ].map((a,i) => (
                  <motion.div key={i} whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }} onClick={a.action} style={{ cursor:'pointer' }}>
                    <div className="qa-tile">
                      <div className="qa-icon" style={{ background:a.bg }}>
                        <i className={`fa-solid ${a.icon}`} style={{ color:a.color }} />
                      </div>
                      <span style={{ fontSize:10, fontFamily:'Syne', fontWeight:700, color:'var(--text-2)', letterSpacing:'0.04em' }}>{a.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ════ RIGHT COLUMN — trip history ════ */}
          <div className="dash-right">
            <motion.div {...f(0.1)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span className="section-label" style={{ marginBottom:0 }}>Trip History</span>
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="pill pill-violet"
                  style={{ cursor:'pointer' }}
                >
                  <i className="fa fa-plus" /> New
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:0.18 + i*0.07, ease }}
                    className="trip-row"
                    onClick={() => navigate('/itinerary')}
                  >
                    <div className="trip-thumb" style={{
                      background: trip.status==='active'
                        ? 'rgba(45,212,191,0.14)'
                        : trip.status==='upcoming'
                        ? 'rgba(124,106,255,0.14)'
                        : 'rgba(255,255,255,0.05)'
                    }}>
                      {trip.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="t-h3" style={{ marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {trip.destination}
                      </p>
                      <p className="t-small">{trip.days}d · {trip.tripType}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--teal)', margin:'0 0 3px' }}>
                        ₹{Number(trip.budget).toLocaleString()}
                      </p>
                      <span className={`pill ${trip.status==='active'?'pill-teal':trip.status==='upcoming'?'pill-violet':'pill-dim'}`}
                        style={{ fontSize:9, padding:'2px 7px' }}>
                        {trip.status === 'active' ? 'ongoing' : trip.status === 'past' ? 'completed' : trip.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          {/* end two-col */}
        </div>
        )} {/* end tripsLoading ternary */}
      </div>
    </div>
  )
}
