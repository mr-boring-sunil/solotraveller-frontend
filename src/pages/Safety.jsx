import { useState }            from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrip }             from '../context/TripContext'
import { safetyAPI }           from '../api'

const ease = [0.22,1,0.36,1]

const CATS = [
  { id:'night_stay',        icon:'🏨', title:'Night Stay Safety',      sub:'Accommodation & overnight security',       level:'caution', bg:'rgba(251,191,36,0.12)',    bdr:'rgba(251,191,36,0.25)',
    tips:['Verify hostel reviews on multiple platforms before booking.','Request a room above the ground floor — 2nd to 5th is ideal.','Use door chain and deadbolt every night without exception.','Store passport and valuables in the in-room safe or locker.','Share your accommodation address with a trusted person back home.','Confirm windows and balcony doors have working locks before settling in.'] },
  { id:'public_transport',  icon:'🚌', title:'Public Transport',        sub:'Buses, trains, autos & shared rides',       level:'caution', bg:'rgba(124,106,255,0.12)', bdr:'rgba(124,106,255,0.25)',
    tips:['Use official app-based cabs (Ola/Uber) — avoid unmarked taxis.','Share your live location when taking long bus or train journeys.','Hold your bag in front of you in crowded stations and markets.','Avoid travelling alone late at night on unfamiliar routes.','Photograph the cab or auto number plate before boarding.','Trust your instincts — if something feels wrong, exit and find another option.','Split your cash across multiple locations — never keep it all together.','Travel with at least 2 payment methods: UPI + card + some cash.'] },
  { id:'food_water',        icon:'🍽️', title:'Food & Water Safety',     sub:'Eating and drinking safely on the road',     level:'safe',    bg:'rgba(45,212,191,0.12)',  bdr:'rgba(45,212,191,0.25)',
    tips:['Drink only sealed bottled water or use a UV purifier / LifeStraw.','Eat at busy local restaurants — high turnover means fresher food.','Avoid raw salads and cut fruit sold by roadside stalls.','Carry ORS sachets and basic stomach medication at all times.','Be cautious with street seafood in non-coastal areas.','Check for visible kitchen cleanliness before ordering.'] },
  { id:'adventure_outdoor', icon:'🏔️', title:'Adventure & Outdoors',    sub:'Trekking, water sports & outdoor activities', level:'caution', bg:'rgba(251,191,36,0.12)',  bdr:'rgba(251,191,36,0.25)',
    tips:['Hire certified, licensed guides for trekking and water sports only.','Check weather forecasts 48 hours before any outdoor activity.','Tell someone your exact trail route and expected return time.','Carry at least 500 ml of water per hour of trekking.','Never swim at beaches with red flags or after sunset.','Confirm your activity is covered under your travel insurance policy.','Beware of "too-good-to-be-true" tour packages offered by strangers.','Acclimatise gradually when travelling to high-altitude destinations.'] },
  { id:'solo_women',        icon:'👩', title:'Solo Women Safety',        sub:'Extra precautions for solo female travellers',level:'caution', bg:'rgba(236,72,153,0.12)',  bdr:'rgba(236,72,153,0.25)',
    tips:['Research cultural norms around dress code before visiting a region.','Stay in well-reviewed female-friendly hostels or women-only dorms.','Send daily check-in updates to at least one trusted contact.','Download safety apps like bSafe or local emergency alert apps.','Avoid displaying expensive jewellery or gadgets in public.','You have every right to leave any situation that feels unsafe.'] },
]

const LEVEL_PILL = { safe:'pill-teal', caution:'pill-gold', danger:'pill-rose' }
const LEVEL_LABEL = { safe:'Low Risk', caution:'Moderate', danger:'High Alert' }

export default function Safety() {
  const { trips, checklist, toggleChecklist } = useTrip()
  const [open, setOpen]  = useState(null)
  const [sosLoading, setSosLoading] = useState(false)

  const dest      = trips[0]?.destination || 'your destination'
  const totalTips = CATS.reduce((s,c) => s+c.tips.length, 0)
  const doneCount = Object.values(checklist).filter(Boolean).length
  const score     = Math.round((doneCount/totalTips)*100)
  const scoreColor = score > 70 ? 'var(--teal)' : score > 40 ? 'var(--gold)' : 'var(--rose)'

  // Calls PATCH /api/safety/checklist via TripContext.toggleChecklist()
  function toggle(catId, ti) {
    const k = `${catId}_${ti}`
    toggleChecklist(k)
  }

  async function handleSOS() {
    if (!window.confirm("🚨 WARNING: Are you sure you want to trigger the SOS alert? This will send your live GPS coordinates to your emergency contacts.")) {
      return
    }
    setSosLoading(true)
    try {
      if (!navigator.geolocation) {
        // Calls POST /api/safety/sos without coordinates
        await safetyAPI.sendSOS(null, null)
      } else {
        navigator.geolocation.getCurrentPosition(
          async pos => {
            // Calls POST /api/safety/sos with live GPS coordinates
            await safetyAPI.sendSOS(pos.coords.latitude, pos.coords.longitude)
            alert('✅ Emergency alert sent to your contacts with location.')
          },
          async () => {
            await safetyAPI.sendSOS(null, null)
            alert('✅ Emergency alert sent (location unavailable).')
          }
        )
      }
    } catch (err) {
      alert(`SOS failed: ${err.message}`)
    } finally {
      setSosLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="orb orb-1" style={{ opacity:.45 }} />
      <div className="orb orb-2" style={{ opacity:.4 }} />
      <div className="page-body pt-5">

        {/* ─── Header ─── */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, ease }}>
          <p className="section-label">SoloTraveller</p>
          <h1 className="t-display" style={{ marginBottom:4 }}>Safety <span className="grad-main">Hub</span></h1>
          <p className="t-body" style={{ marginBottom:24 }}>Smart guidelines for {dest}</p>
        </motion.div>

        {/* ─── Score bento card ─── */}
        <motion.div initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.1, ease }}>
          <div style={{ background:'linear-gradient(135deg,rgba(124,106,255,0.12),rgba(45,212,191,0.08))', border:'1px solid rgba(124,106,255,0.2)', borderRadius:'var(--r-xl)', padding:22, marginBottom:20 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="section-label" style={{ marginBottom:4 }}>Safety Checklist Score</p>
                <p className="t-h2" style={{ marginBottom:0 }}>{doneCount} <span className="t-body" style={{ fontSize:14 }}>of {totalTips} tips acknowledged</span></p>
              </div>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`${scoreColor}18`, border:`2px solid ${scoreColor}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'DM Mono', fontWeight:500, fontSize:18, color:scoreColor }}>{score}%</span>
              </div>
            </div>
            <div className="prog-track">
              <motion.div initial={{ width:0 }} animate={{ width:`${score}%` }} transition={{ duration:1.2, delay:.3, ease }} className="prog-fill" />
            </div>
          </div>
        </motion.div>

        {/* ─── SOS ─── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.18 }} style={{ marginBottom:20 }}>
          <button className="sos-btn" onClick={handleSOS} disabled={sosLoading}>
            {sosLoading
              ? <><span className="spinner-border spinner-border-sm" /> Sending…</>
              : <><i className="fa fa-triangle-exclamation" style={{ fontSize:22 }} /> SOS — Emergency Alert</>
            }
          </button>
          <p className="t-small" style={{ textAlign:'center', marginTop:8 }}>Sends your live location to all emergency contacts</p>
        </motion.div>

        {/* ─── Emergency numbers ─── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.22 }} style={{ marginBottom:24 }}>
          <p className="section-label" style={{ marginBottom:12 }}>Emergency Numbers</p>
          <div className="row g-2">
            {[
              { lbl:'Police',    num:'100',          icon:'fa-shield',        color:'var(--violet)' },
              { lbl:'Ambulance', num:'108',           icon:'fa-truck-medical', color:'var(--teal)'   },
              { lbl:'Women',     num:'1091',          icon:'fa-person-dress',  color:'var(--rose)'   },
              { lbl:'Tourist',   num:'1800-111-363',  icon:'fa-plane',         color:'var(--gold)'   },
            ].map((c,i) => (
              <div key={i} className="col-6">
                <a href={`tel:${c.num}`} className="em-tile">
                  <div className="em-icon" style={{ background: c.color+'20' }}>
                    <i className={`fa-solid ${c.icon}`} style={{ color:c.color }} />
                  </div>
                  <div>
                    <p className="t-h3" style={{ margin:0 }}>{c.lbl}</p>
                    <p style={{ fontFamily:'DM Mono', fontSize:12, color:c.color, margin:0, fontWeight:500 }}>{c.num}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Safety categories ─── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.28 }}>
          <p className="section-label" style={{ marginBottom:14 }}>Safety Guidelines</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {CATS.map((cat, idx) => {
              const isOpen     = open === cat.id
              const catDone    = cat.tips.filter((_,ti) => checklist[`${cat.id}_${ti}`]).length
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity:0, y:18 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:.3+idx*.05, ease }}
                  className={`s-card${isOpen?' open':''}`}
                  style={{ borderColor: isOpen ? cat.bdr : undefined, background: isOpen ? cat.bg : undefined }}
                >
                  <div className="d-flex align-items-center gap-3" onClick={() => setOpen(isOpen ? null : cat.id)}>
                    <div className="s-icon-box" style={{ background:cat.bg }}>{cat.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="s-title" style={{ margin:0 }}>{cat.title}</p>
                      <p className="s-sub">{cat.sub}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                      <span className={`pill ${LEVEL_PILL[cat.level]}`} style={{ fontSize:9 }}>{LEVEL_LABEL[cat.level]}</span>
                      <span className="t-small">{catDone}/{cat.tips.length}</span>
                      <i className={`fa fa-chevron-${isOpen?'up':'down'}`} style={{ fontSize:10, color:'var(--text-3)' }} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity:0, height:0 }}
                        animate={{ opacity:1, height:'auto' }}
                        exit={{ opacity:0, height:0 }}
                        transition={{ duration:.25 }}
                        style={{ overflow:'hidden' }}
                      >
                        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${cat.bdr}` }}>
                          {cat.tips.map((tip, ti) => {
                            const k    = `${cat.id}_${ti}`
                            const done = !!checklist[k]
                            return (
                              <div key={ti} className="tip-row" onClick={() => toggle(cat.id, ti)} style={{ cursor:'pointer' }}>
                                <div className={`tip-chk${done?' done':''}`}>
                                  {done && <i className="fa fa-check" style={{ fontSize:8, color:'#fff' }} />}
                                </div>
                                <span className={`tip-txt${done?' done':''}`}>{tip}</span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
          <div style={{ height:8 }} />
        </motion.div>
      </div>
    </div>
  )
}
