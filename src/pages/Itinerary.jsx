import { useState, useEffect }       from 'react'
import { useNavigate, useLocation }   from 'react-router-dom'
import { motion, AnimatePresence }    from 'framer-motion'
import { useTrip }                    from '../context/TripContext'

const ease = [0.22, 1, 0.36, 1]
const TYPE = {
  transport: { bg: 'rgba(124,106,255,0.15)', color: 'var(--violet-2)' },
  food:      { bg: 'rgba(251,191,36,0.15)',  color: 'var(--gold)'     },
  activity:  { bg: 'rgba(45,212,191,0.15)',  color: 'var(--teal)'     },
}

// ── Reusable timeline renderer ──────────────────────────────────
function Timeline({ schedule, trip }) {
  const [selDay,  setSelDay]  = useState(0)
  const [openIdx, setOpenIdx] = useState(null)

  const dayData  = schedule[selDay] || schedule[0]
  const dayTotal = dayData?.items?.reduce((s, i) => s + i.cost, 0) || 0
  const tripTotal= schedule.reduce((s, d) => s + (d.items?.reduce((ds,i)=>ds+i.cost,0)||0), 0)

  return (
    <>
      {/* Budget summary row */}
      <div className="itinerary-budget-grid">
        {[
          { label:'Daily Budget', val:`₹${Number(trip.budget).toLocaleString()}`, color:'var(--violet-2)' },
          { label:'Today Spend',  val:`₹${dayTotal.toLocaleString()}`,            color: dayTotal > trip.budget ? 'var(--rose)' : 'var(--teal)' },
          { label:'Trip Total',   val:`₹${tripTotal.toLocaleString()}`,            color:'var(--gold)' },
        ].map((b,i) => (
          <div key={i} className="itinerary-budget-card">
            <p style={{ fontFamily:'DM Mono', fontWeight:500, fontSize:13, color:b.color, margin:0 }}>{b.val}</p>
            <p style={{ fontSize:9, color:'var(--text-3)', margin:'3px 0 0', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{b.label}</p>
          </div>
        ))}
      </div>

      {/* Day chips */}
      <div className="days-strip" style={{ marginBottom:20 }}>
        {schedule.map((d, i) => (
          <button key={i} className={`day-chip${selDay===i?' on':''}`}
            onClick={() => { setSelDay(i); setOpenIdx(null) }}>
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selDay}
          initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-24 }} transition={{ duration:.25, ease }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h2 className="t-h2" style={{ marginBottom:3 }}>{dayData?.theme}</h2>
              <p className="t-small">{dayData?.items?.length} stops · est. ₹{dayTotal.toLocaleString()}</p>
            </div>
            <span className="pill pill-violet">Day {dayData?.day}</span>
          </div>

          {dayData?.items?.map((item, i) => {
            const s = TYPE[item.type] || TYPE.activity
            const isOpen = openIdx === i
            return (
              <div key={i} className="tl-wrap" onClick={() => setOpenIdx(isOpen ? null : i)}>
                <div className="tl-dot" style={{ background:s.bg }}>
                  <span>{item.emoji}</span>
                </div>
                <div className={`tl-body${isOpen?' open':''}`}>
                  <div className="tl-time">{item.time}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div className="tl-title">{item.title}</div>
                    <i className={`fa fa-chevron-${isOpen?'up':'down'}`}
                      style={{ fontSize:10, color:'var(--text-3)', marginLeft:8, flexShrink:0, marginTop:3 }} />
                  </div>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                      exit={{ opacity:0, height:0 }} transition={{ duration:.2 }}
                    >
                      <p className="tl-detail">{item.detail}</p>
                      <span className="cost-tag">
                        <i className="fa fa-indian-rupee-sign" style={{ fontSize:9 }} />
                        {item.cost > 0 ? item.cost.toLocaleString() : 'Free'}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Day summary */}
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(45,212,191,0.15)', borderRadius:18, padding:16, marginTop:4 }}>
            <p className="section-label" style={{ marginBottom:10 }}>Day {dayData?.day} Summary</p>
            {[
              { lbl:'Activities', val:dayData?.items?.length,                                     icon:'fa-location-dot', color:'var(--violet)' },
              { lbl:'Food Stops', val:dayData?.items?.filter(i=>i.type==='food').length,          icon:'fa-utensils',     color:'var(--gold)'   },
              { lbl:'Spend',      val:`₹${dayTotal.toLocaleString()}`,                            icon:'fa-wallet',       color:'var(--teal)'   },
              { lbl:'Budget',     val:dayTotal<=trip.budget ? '✅ Within' : '⚠️ Over',             icon:'fa-chart-line',   color: dayTotal<=trip.budget ? 'var(--green)' : 'var(--rose)' },
            ].map((r,i) => (
              <div key={i} className="info-row">
                <span style={{ fontSize:12, color:'var(--text-3)' }}>
                  <i className={`fa-solid ${r.icon} me-2`} style={{ color:r.color }} />{r.lbl}
                </span>
                <span style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--text)', fontWeight:500 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// ── Main Itinerary Page ──────────────────────────────────────────
export default function Itinerary() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    trips, tripsLoading,
    fetchItinerary, getTripItinerary,
    generateItinerary,
    hasUnsavedItinerary, getUnsavedDays,
    saveItinerary, discardItinerary,
    deleteTrip, updateTripStatus,
  } = useTrip()

  // Which trip is currently selected in the page
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [saving,         setSaving]          = useState(false)
  const [generating,     setGenerating]      = useState(false)
  const [deleting,       setDeleting]        = useState(null)
  const [confirmDelete,  setConfirmDelete]   = useState(null)
  const [saveError,      setSaveError]       = useState('')
  const [genError,       setGenError]        = useState('')
  const [saveSuccess,    setSaveSuccess]     = useState(false)
  const [updatingStatus, setUpdatingStatus]  = useState(false)

  async function handleUpdateStatus(newStatus) {
    if (!selectedTripId) return
    setUpdatingStatus(true)
    try {
      await updateTripStatus(selectedTripId, newStatus)
    } catch (err) {
      alert(`Failed to update status: ${err.message}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // ── Generate itinerary via Gemini ─────────────────────────────────
  async function handleGenerate() {
    if (!selectedTripId) return
    setGenerating(true)
    setGenError('')
    try {
      await generateItinerary(selectedTripId)  // POST /api/trips/:id/generate → sets preview
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  // Auto-select first trip on load
  useEffect(() => {
    if (location.state?.selectTripId) return // let the questionnaire state handler handle it
    if (trips.length && !selectedTripId) {
      setSelectedTripId(trips[0]._id || trips[0].id)
    }
  }, [trips, selectedTripId, location.state])

  // Fetch saved itinerary whenever selected trip changes
  useEffect(() => {
    if (selectedTripId) fetchItinerary(selectedTripId)
  }, [selectedTripId])

  // Handle auto-select and auto-generate from Questionnaire redirection
  useEffect(() => {
    if (location.state?.autoGenerate && location.state?.selectTripId) {
      const targetId = location.state.selectTripId
      setSelectedTripId(targetId)
      
      const saved = getTripItinerary(targetId)
      if (saved.length === 0 && !hasUnsavedItinerary(targetId) && !generating) {
        const doAutoGenerate = async () => {
          setGenerating(true)
          setGenError('')
          try {
            await generateItinerary(targetId)
          } catch (err) {
            setGenError(err.message)
          } finally {
            setGenerating(false)
          }
        }
        doAutoGenerate()
      }
      // Clear navigation state to prevent re-generating on reload/refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, selectedTripId, trips])

  const selectedTrip   = trips.find(t => (t._id || t.id) === selectedTripId)
  const hasActiveTrip  = trips.some(t => t.status === 'active')
  const savedDays      = getTripItinerary(selectedTripId)
  const isUnsaved      = hasUnsavedItinerary(selectedTripId)
  const previewDays    = getUnsavedDays(selectedTripId)

  // What to show in the timeline — unsaved preview takes priority
  const displayDays    = isUnsaved ? previewDays : savedDays
  const hasItinerary   = displayDays.length > 0

  // ── Save itinerary to DB ─────────────────────────────────────────
  async function handleSave() {
    if (!selectedTripId || !previewDays.length) return
    setSaving(true)
    setSaveError('')
    try {
      await saveItinerary(selectedTripId, previewDays)  // POST /api/trips/:id/itinerary
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete a trip ────────────────────────────────────────────────
  async function handleDelete(tripId) {
    setDeleting(tripId)
    try {
      await deleteTrip(tripId)   // DELETE /api/trips/:id
      setConfirmDelete(null)
      // Select next available trip
      const remaining = trips.filter(t => (t._id || t.id) !== tripId)
      setSelectedTripId(remaining.length ? (remaining[0]._id || remaining[0].id) : null)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeleting(null)
    }
  }

  // ── Loading state ────────────────────────────────────────────────
  if (tripsLoading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner-border" style={{ color:'var(--violet)', width:32, height:32, borderWidth:2 }} />
    </div>
  )

  // ── No trips at all ──────────────────────────────────────────────
  if (!trips.length) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🗺️</div>
        <h2 className="t-h2" style={{ marginBottom:8 }}>No trips yet</h2>
        <p className="t-body" style={{ marginBottom:20 }}>Plan your first adventure to get started.</p>
        <button className="btn-prime" onClick={() => navigate('/questionnaire')}>
          <i className="fa fa-plus" /> Plan a Trip
        </button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="orb orb-1" style={{ opacity:.5 }} />
      <div className="page-body-narrow">

        {/* ── Page title ── */}
        <motion.div initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, ease }}
          className="itinerary-header">
          <div>
            <p className="section-label">Your Trips</p>
            <h1 className="t-display" style={{ fontSize:26, marginBottom:0 }}>Itinerary</h1>
          </div>
          <button className="btn-prime" onClick={() => navigate('/questionnaire')} style={{ padding:'8px 14px', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
            <i className="fa fa-plus" style={{ fontSize:11 }} /> Plan New Trip
          </button>
        </motion.div>

        {/* ── Trip selector strip with delete buttons ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.08 }}>
          <div className="trip-selector-container">
            {trips.map((trip, i) => {
              const tid     = trip._id || trip.id
              const isActive = tid === selectedTripId
              const isDel    = deleting === tid
              const awaitCfm = confirmDelete === tid

              return (
                <motion.div
                  key={tid}
                  initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:.1 + i * .06, ease }}
                  className="trip-selector-card"
                  style={{
                    background: isActive ? 'rgba(124,106,255,0.1)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${isActive ? 'rgba(124,106,255,0.4)' : 'var(--border)'}`,
                  }}
                  onClick={() => { setSelectedTripId(tid); setConfirmDelete(null) }}
                >
                  {/* Emoji thumb */}
                  <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
                    background: trip.status==='active' ? 'rgba(45,212,191,0.14)' : trip.status==='upcoming' ? 'rgba(124,106,255,0.14)' : 'rgba(255,255,255,0.05)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                    {trip.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="t-h3" style={{ margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trip.destination}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
                      <p className="t-small" style={{ margin:0 }}>{trip.days}d · {trip.tripType}</p>
                      {getTripItinerary(tid).length > 0 && (
                        <span className="pill pill-teal" style={{ fontSize:8, padding:'1px 6px' }}>Saved</span>
                      )}
                      {hasUnsavedItinerary(tid) && (
                        <span className="pill pill-gold" style={{ fontSize:8, padding:'1px 6px' }}>Preview</span>
                      )}
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={`pill ${trip.status==='active'?'pill-teal':trip.status==='upcoming'?'pill-violet':'pill-dim'}`}
                    style={{ fontSize:9, flexShrink:0 }}>
                    {trip.status === 'active' ? 'ongoing' : trip.status === 'past' ? 'completed' : trip.status}
                  </span>

                  {/* Delete button / confirm */}
                  <div style={{ flexShrink:0 }} onClick={e => e.stopPropagation()}>
                    {!awaitCfm ? (
                      <button
                        onClick={() => setConfirmDelete(tid)}
                        style={{ width:32, height:32, borderRadius:9, background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.2)', color:'var(--rose)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(251,113,133,0.2)'}
                        onMouseOut={e  => e.currentTarget.style.background='rgba(251,113,133,0.1)'}
                        title="Delete trip"
                      >
                        <i className="fa fa-trash" style={{ fontSize:12 }} />
                      </button>
                    ) : (
                      <div style={{ display:'flex', gap:6 }}>
                        <button
                          onClick={() => handleDelete(tid)}
                          disabled={isDel}
                          style={{ padding:'4px 10px', borderRadius:8, background:'var(--rose)', border:'none', color:'#fff', fontSize:11, fontFamily:'Syne', fontWeight:700, cursor:'pointer' }}
                        >
                          {isDel ? '…' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{ padding:'4px 10px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-2)', color:'var(--text-2)', fontSize:11, fontFamily:'Syne', fontWeight:700, cursor:'pointer' }}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Selected trip itinerary panel ── */}
        <AnimatePresence mode="wait">
          {selectedTrip && (
            <motion.div
              key={selectedTripId}
              initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-12 }} transition={{ duration:.3, ease }}
            >
              {/* Trip hero header */}
              <div className="hero-card" style={{ marginBottom:20 }}>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <span className={`pill ${selectedTrip.status==='active'?'pill-teal':selectedTrip.status==='upcoming'?'pill-violet':'pill-dim'}`}>
                      <i className="fa fa-circle" style={{ fontSize:6 }} /> {
                        selectedTrip.status === 'active' ? 'ongoing' : selectedTrip.status === 'past' ? 'completed' : selectedTrip.status
                      }
                    </span>
                    <span style={{ fontSize:44, lineHeight:1 }}>{selectedTrip.emoji}</span>
                  </div>
                  <h2 className="t-h1" style={{ marginBottom:4 }}>{selectedTrip.destination}</h2>
                  <p className="t-body" style={{ marginBottom:12 }}>{selectedTrip.days} days · {selectedTrip.tripType} · {selectedTrip.pace}</p>
                  
                  {/* Status action buttons */}
                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    {selectedTrip.status === 'upcoming' && hasItinerary && !isUnsaved && (
                      <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start' }}>
                        <button
                          className="btn-prime"
                          onClick={() => handleUpdateStatus('active')}
                          disabled={updatingStatus || hasActiveTrip}
                          title={hasActiveTrip ? "Another trip is currently ongoing. Complete it first to start this one." : ""}
                          style={{ padding:'8px 16px', fontSize:13, borderRadius:'12px', display:'flex', alignItems:'center', gap:6 }}
                        >
                          🚀 Start Trip
                        </button>
                        {hasActiveTrip && (
                          <p style={{ margin:0, fontSize:11, color:'var(--rose)', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                            <i className="fa fa-triangle-exclamation" /> Another trip is currently ongoing. Complete it first to start this one.
                          </p>
                        )}
                      </div>
                    )}
                    {selectedTrip.status === 'active' && (
                      <button
                        className="btn-gradient"
                        onClick={() => handleUpdateStatus('past')}
                        disabled={updatingStatus}
                        style={{ padding:'8px 16px', fontSize:13, borderRadius:'12px', display:'flex', alignItems:'center', gap:6 }}
                      >
                        ✅ Complete Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Unsaved preview banner ── */}
              {isUnsaved && (
                <motion.div
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:16, padding:'14px 16px', marginBottom:16 }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <p style={{ fontFamily:'Syne', fontWeight:700, fontSize:13, color:'var(--gold)', margin:0 }}>
                        <i className="fa fa-sparkles me-2" />Itinerary Preview
                      </p>
                      <p style={{ fontSize:11, color:'var(--text-3)', margin:'3px 0 0' }}>
                        Generated but not saved yet — review and save when ready
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        onClick={discardItinerary}
                        className="btn-ghost"
                        style={{ padding:'7px 14px', fontSize:12 }}
                      >
                        <i className="fa fa-xmark" /> Discard
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-prime"
                        style={{ padding:'7px 16px', fontSize:12 }}
                      >
                        {saving
                          ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
                          : <><i className="fa fa-floppy-disk" /> Save Itinerary</>
                        }
                      </button>
                    </div>
                  </div>
                  {saveError && (
                    <p style={{ fontSize:12, color:'var(--rose)', marginTop:8, margin:'8px 0 0' }}>
                      <i className="fa fa-circle-exclamation me-1" />{saveError}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Save success toast ── */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }}
                  style={{ background:'rgba(45,212,191,0.1)', border:'1px solid rgba(45,212,191,0.3)', borderRadius:16, padding:'12px 16px', marginBottom:16 }}
                >
                  <p style={{ fontFamily:'Syne', fontWeight:700, fontSize:13, color:'var(--teal)', margin:0 }}>
                    <i className="fa fa-circle-check me-2" />Itinerary saved successfully!
                  </p>
                </motion.div>
              )}

              {/* ── Saved itinerary banner (already in DB) ── */}
              {!isUnsaved && savedDays.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16,
                  background:'rgba(45,212,191,0.07)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:14, padding:'10px 14px', flexWrap:'wrap', gap:10 }}>
                  <p style={{ fontSize:12, color:'var(--teal)', fontWeight:600, margin:0 }}>
                    <i className="fa fa-circle-check me-2" />Itinerary saved to your account
                  </p>
                  {selectedTrip.status === 'upcoming' && (
                    <button
                      className="btn-ghost"
                      onClick={handleGenerate}
                      disabled={generating}
                      style={{ padding:'6px 14px', fontSize:12 }}
                    >
                      {generating
                        ? <><span className="spinner-border spinner-border-sm" /> Generating…</>
                        : <><i className="fa fa-rotate" /> Regenerate</>
                      }
                    </button>
                  )}
                </div>
              )}

              {/* ── No itinerary at all — show Generate button ── */}
              {!hasItinerary && (
                <div style={{ textAlign:'center', padding:'40px 20px',
                  background:'rgba(255,255,255,0.02)', border:'1px dashed var(--border-2)',
                  borderRadius:20 }}>
                  <div style={{ fontSize:44, marginBottom:14 }}>🤖</div>
                  <h3 className="t-h3" style={{ marginBottom:6 }}>No itinerary yet</h3>
                  <p className="t-body" style={{ fontSize:12, marginBottom:20 }}>
                    Let Gemini AI generate a personalised day-by-day itinerary for this trip.
                  </p>

                  {genError && (
                    <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, color:'var(--rose)' }}>
                      <i className="fa fa-circle-exclamation me-2" />{genError}
                    </div>
                  )}

                  <button
                    className="btn-prime"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ fontSize:14 }}
                  >
                    {generating ? (
                      <><span className="spinner-border spinner-border-sm" /> Generating with Gemini…</>
                    ) : (
                      <><i className="fa fa-wand-magic-sparkles" /> Generate Itinerary with AI</>
                    )}
                  </button>

                  {generating && (
                    <p className="t-small" style={{ marginTop:12 }}>
                      This may take 10–20 seconds…
                    </p>
                  )}
                </div>
              )}

              {/* ── Timeline ── */}
              {hasItinerary && (
                <Timeline schedule={displayDays} trip={selectedTrip} />
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
