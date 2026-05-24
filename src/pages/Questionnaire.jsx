import { useState, useEffect }   from 'react'
import { useNavigate }           from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import questions                 from '../data/questions'
import ProgressBar               from '../components/ProgressBar'
import QuestionCard              from '../components/QuestionCard'
import SummaryScreen             from '../components/SummaryScreen'
import { useTrip }               from '../context/TripContext'
import { userAPI, tripsAPI }       from '../api'

function isAnswered(q, val) {
  if (val === null || val === undefined) return false
  if (q.type === 'input') return String(val).trim() !== ''
  return Boolean(val)
}

export default function Questionnaire() {
  const navigate    = useNavigate()
  const { createTrip } = useTrip()

  const [step,      setStep]    = useState(0)
  const [answers,   setAnswers] = useState(Array(questions.length).fill(null))
  const [direction, setDir]     = useState(1)
  const [done,      setDone]    = useState(false)
  const [saving,    setSaving]  = useState(false)
  const [saveError, setSaveError] = useState('')
  const [createdTripId, setCreatedTripId] = useState(null)
  const [profileDefaults, setProfileDefaults] = useState(null)

  // Places selector states
  const [showCustomize, setShowCustomize] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [selectedRecs, setSelectedRecs] = useState([])
  const [customPlaces, setCustomPlaces] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [recError, setRecError] = useState('')
  const [manualInput, setManualInput] = useState('')

  useEffect(() => {
    async function loadDefaults() {
      try {
        const data = await userAPI.getProfile()
        const prof = data.user
        if (prof) {
          setProfileDefaults(prof)
          setAnswers(prev => {
            const updated = [...prev]
            if (prof.pace) updated[3] = prof.pace
            if (prof.budget) updated[4] = Number(prof.budget) || prof.budget
            if (prof.tripType) updated[5] = prof.tripType
            if (prof.food) updated[6] = prof.food
            return updated
          })
        }
      } catch (err) {
        console.error('Failed to load user profile for questionnaire defaults:', err)
      }
    }
    loadDefaults()
  }, [])

  // Fetch recommended places when entering customization step
  useEffect(() => {
    if (!showCustomize) return

    async function fetchRecommendations() {
      setLoadingRecs(true)
      setRecError('')
      try {
        const payload = {
          source: answers[0],
          destination: answers[1],
          days: Number(answers[2]) || 3,
          tripType: answers[5] || 'Adventure'
        }
        const data = await tripsAPI.recommendPlaces(payload)
        setRecommendations(data.places || [])
        setSelectedRecs(data.places ? data.places.map(p => p.name) : [])
      } catch (err) {
        setRecError(err.message)
      } finally {
        setLoadingRecs(false)
      }
    }

    fetchRecommendations()
  }, [showCustomize])

  const total   = questions.length
  const current = questions[step]
  const answer  = answers[step]
  const canNext = isAnswered(current, answer)

  function handleSelect(val) {
    const updated = [...answers]
    updated[step] = val
    setAnswers(updated)
  }

  function handleNext() {
    if (!canNext) return
    if (step < total - 1) { 
      setDir(1)
      setStep(s => s + 1) 
    } else {
      setShowCustomize(true)
    }
  }

  function handleBack() {
    if (showCustomize) {
      setShowCustomize(false)
    } else if (step > 0) {
      setDir(-1)
      setStep(s => s - 1)
    } else {
      navigate('/dashboard')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canNext && current.type === 'input') handleNext()
  }

  function toggleRecommend(placeName) {
    if (selectedRecs.includes(placeName)) {
      setSelectedRecs(prev => prev.filter(name => name !== placeName))
    } else {
      setSelectedRecs(prev => [...prev, placeName])
    }
  }

  function handleAddManualPlace() {
    const val = manualInput.trim()
    if (!val) return
    if (!customPlaces.includes(val) && !selectedRecs.includes(val)) {
      setCustomPlaces(prev => [...prev, val])
    }
    setManualInput('')
  }

  function handleRemovePlace(placeName) {
    if (selectedRecs.includes(placeName)) {
      setSelectedRecs(prev => prev.filter(name => name !== placeName))
    }
    if (customPlaces.includes(placeName)) {
      setCustomPlaces(prev => prev.filter(name => name !== placeName))
    }
  }

  async function submitAnswers(placesList) {
    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        source:      answers[0],
        destination: answers[1],
        days:        Number(answers[2]),
        pace:        answers[3],
        budget:      Number(answers[4]),
        tripType:    answers[5],
        food:        answers[6],
        places:      placesList || [],
      }
      const newTrip = await createTrip(payload)
      setCreatedTripId(newTrip.id || newTrip._id)
      setDone(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleRestart() {
    const freshAnswers = Array(total).fill(null)
    if (profileDefaults) {
      if (profileDefaults.pace) freshAnswers[3] = profileDefaults.pace
      if (profileDefaults.budget) freshAnswers[4] = Number(profileDefaults.budget) || profileDefaults.budget
      if (profileDefaults.tripType) freshAnswers[5] = profileDefaults.tripType
      if (profileDefaults.food) freshAnswers[6] = profileDefaults.food
    }
    setAnswers(freshAnswers)
    setStep(0)
    setDir(1)
    setDone(false)
    setSaveError('')
    setCreatedTripId(null)
    setShowCustomize(false)
    setRecommendations([])
    setSelectedRecs([])
    setCustomPlaces([])
    setManualInput('')
  }

  const isCustomizeMode = showCustomize && !done;

  return (
    <div className="page" onKeyDown={handleKeyDown}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="page-center">
        <motion.div
          className="quest-card"
          style={{ 
            maxWidth: isCustomizeMode ? '880px' : '500px', 
            width: '100%', 
            transition: 'max-width 0.4s cubic-bezier(0.22, 1, 0.36, 1), padding 0.4s ease' 
          }}
          initial={{ opacity:0, y:24 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.45, ease:[.22,1,.36,1] }}
        >
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>✈️</span>
              <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:14, color:'var(--text-2)' }}>SoloTraveller</span>
            </div>
            {!done && <span className="pill pill-violet">Trip Planner</span>}
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="summary" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}>
                <SummaryScreen answers={answers} onRestart={handleRestart} tripId={createdTripId} />
              </motion.div>
            ) : showCustomize ? (
              <motion.div key="customize" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:.3 }}>
                <div className="text-center mb-4">
                  <p className="t-label" style={{ marginBottom:5 }}>Customise Stops</p>
                  <h2 className="t-h1" style={{ fontSize:'clamp(20px,4.5vw,25px)' }}>Select Attractions & Stops</h2>
                  <p className="t-body" style={{ fontSize:12, marginTop:6 }}>Choose recommended places along your route or add custom ones manually.</p>
                </div>

                {loadingRecs ? (
                  <div style={{ textAlign:'center', padding:'60px 0' }}>
                    <div className="spinner-border" style={{ color:'var(--violet)', width:32, height:32, borderWidth:2 }} />
                    <p className="t-body" style={{ marginTop:14, fontSize:13, color:'var(--text-3)' }}>Curating stops from {answers[0]} to {answers[1]}...</p>
                  </div>
                ) : (
                  <>
                    {recError && (
                      <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, color:'var(--rose)' }}>
                        <i className="fa fa-circle-exclamation me-2" />Failed to load suggestions: {recError}
                      </div>
                    )}

                    {/* TWO-COLUMN LAYOUT */}
                    <div className="cust-grid">
                      
                      {/* Left Column: Manual addition and recommendation list */}
                      <div className="cust-left">
                        {/* Manual stop input */}
                        <div>
                          <label className="t-small" style={{ display:'block', marginBottom:6, fontWeight:600 }}><i className="fa fa-plus me-1" style={{ color:'var(--violet-2)' }} /> Add Custom Stop</label>
                          <div style={{ display:'flex', gap:8 }}>
                            <input 
                              type="text" 
                              className="inp" 
                              placeholder="e.g. Baga Beach or Dudhsagar Falls" 
                              value={manualInput} 
                              onChange={e => setManualInput(e.target.value)} 
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddManualPlace() } }}
                              style={{ flex:1, height:42, fontSize:13 }}
                            />
                            <button type="button" className="btn-prime" onClick={handleAddManualPlace} style={{ padding:'0 16px', height:42, borderRadius:12, fontSize:13 }}>Add</button>
                          </div>
                        </div>

                        {/* Recommended places chip group */}
                        {recommendations.length > 0 && (
                          <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
                            <label className="t-small" style={{ display:'block', marginBottom:8, fontWeight:600 }}><i className="fa fa-wand-magic-sparkles me-1" style={{ color:'var(--teal)' }} /> Recommended Sights (Tap to select)</label>
                            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:290, overflowY:'auto', paddingRight:4 }}>
                              {recommendations.map((rec) => {
                                const isSel = selectedRecs.includes(rec.name)
                                return (
                                  <div 
                                    key={rec.name}
                                    onClick={() => toggleRecommend(rec.name)}
                                    style={{ 
                                      display:'flex', alignItems:'center', gap:10, padding:11, borderRadius:12, 
                                      background: isSel ? 'rgba(124,106,255,0.08)' : 'rgba(255,255,255,0.015)',
                                      border: `1.5px solid ${isSel ? 'rgba(124,106,255,0.45)' : 'var(--border)'}`,
                                      cursor:'pointer', transition:'all 0.2s',
                                      textAlign:'left'
                                    }}
                                  >
                                    <span style={{ fontSize:18 }}>{rec.emoji}</span>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <h4 style={{ margin:0, fontSize:12, fontWeight:700, color: isSel ? 'var(--violet-2)' : 'var(--text)' }}>{rec.name}</h4>
                                      <p style={{ margin:'2px 0 0', fontSize:10, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rec.description}</p>
                                    </div>
                                    <div style={{ 
                                      width:18, height:18, borderRadius:6, border:`1px solid ${isSel ? 'var(--violet)' : 'var(--border-2)'}`, 
                                      display:'flex', alignItems:'center', justifyContent:'center', background: isSel ? 'var(--violet)' : 'transparent',
                                      color:'#fff', fontSize:9
                                    }}>
                                      {isSel && <i className="fa fa-check" />}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Selected Route stops and Visual Path */}
                      <div className="cust-right">
                        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:16, padding:16, height:'100%', display:'flex', flexDirection:'column' }}>
                          <label className="t-small" style={{ display:'block', marginBottom:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--violet-2)' }}>
                            <i className="fa fa-route me-1" /> Your Route stops ({selectedRecs.length + customPlaces.length})
                          </label>
                          
                          <div style={{ display:'flex', flexDirection:'column', gap:0, flex:1, overflowY:'auto', paddingRight:4 }}>
                            {/* Start point */}
                            <div style={{ display:'flex', gap:10, position:'relative', paddingBottom:12 }}>
                              <div style={{ position:'absolute', left:8, top:16, bottom:0, width:2, background:'linear-gradient(to bottom, var(--teal), var(--border-2))' }} />
                              <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#000', zIndex:1 }}>🏠</div>
                              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2 }}>
                                <span className="t-small" style={{ fontWeight:700, color:'var(--teal)' }}>START</span>
                                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{answers[0]}</span>
                              </div>
                            </div>

                            {/* Selected stops */}
                            {[...selectedRecs, ...customPlaces].map((place, idx) => (
                              <div key={idx} style={{ display:'flex', gap:10, position:'relative', paddingBottom:12 }}>
                                <div style={{ position:'absolute', left:8, top:16, bottom:0, width:2, background:'var(--border-2)' }} />
                                <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--violet)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', zIndex:1 }}>🚗</div>
                                <div style={{ flex:1, minWidth:0, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-2)', borderRadius:12, padding:'6px 12px' }}>
                                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Stop {idx + 1}: {place}</span>
                                  <button 
                                    onClick={() => handleRemovePlace(place)} 
                                    style={{ background:'transparent', border:'none', color:'var(--rose)', cursor:'pointer', padding:'2px 4px', fontSize:11 }}
                                    title="Remove stop"
                                  >
                                    <i className="fa fa-trash-can" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* End point */}
                            <div style={{ display:'flex', gap:10, position:'relative', paddingBottom:4 }}>
                              <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--violet-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', zIndex:1 }}>🌍</div>
                              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:2 }}>
                                <span className="t-small" style={{ fontWeight:700, color:'var(--violet-2)' }}>END</span>
                                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{answers[1]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </>
                )}

                {saveError && (
                  <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:12, padding:'9px 14px', marginTop:14, fontSize:13, color:'var(--rose)' }}>
                    <i className="fa fa-circle-exclamation me-2" />{saveError}
                  </div>
                )}

                {/* Navigation actions */}
                <div style={{ display:'flex', gap:12, marginTop:24, borderTop:'1px solid var(--border)', paddingTop:16 }}>
                  <button className="btn-ghost" onClick={handleBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px' }}>
                    <i className="fa fa-chevron-left" style={{ fontSize:11 }} /> Back
                  </button>
                  <button
                    className="btn-gradient"
                    onClick={() => submitAnswers([...selectedRecs, ...customPlaces])}
                    disabled={saving || loadingRecs}
                    style={{ flex:1, justifyContent:'center', display:'flex', alignItems:'center', gap:8 }}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
                      : <><i className="fa fa-wand-magic-sparkles" /> Generate Itinerary</>
                    }
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="quiz" initial={{ opacity:1 }} exit={{ opacity:0 }}>
                <ProgressBar current={step + 1} total={total} />

                <QuestionCard
                  question={current}
                  answer={answer}
                  onSelect={handleSelect}
                  direction={direction}
                  stepKey={step}
                />

                {saveError && (
                  <div style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:12, padding:'9px 14px', marginTop:14, fontSize:13, color:'var(--rose)' }}>
                    <i className="fa fa-circle-exclamation me-2" />{saveError}
                  </div>
                )}

                <div style={{ display:'flex', gap:12, marginTop:24 }}>
                  <button className="btn-ghost" onClick={handleBack} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <i className="fa fa-chevron-left" style={{ fontSize:11 }} /> Back
                  </button>
                  <button
                    className="btn-gradient"
                    onClick={handleNext}
                    disabled={!canNext || saving}
                    style={{ flex:1, justifyContent:'center', display:'flex', alignItems:'center', gap:6 }}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
                      : <>{step < total - 1 ? 'Continue' : 'Customize Stops'}{canNext && <i className="fa fa-chevron-right" style={{ fontSize:11 }} />}</>
                    }
                  </button>
                </div>

                {!canNext && (
                  <p style={{ textAlign:'center', marginTop:12, fontSize:12, color:'var(--text-3)' }}>
                    {current.type === 'input' ? 'Type your answer to continue' : 'Select an option to continue'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
