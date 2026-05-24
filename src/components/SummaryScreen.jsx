import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import questions from '../data/questions'

export default function SummaryScreen({ answers, onRestart, tripId }) {
  const navigate = useNavigate()

  function getDisplay(q, val) {
    if (!val && val !== 0) return null
    if (q.type === 'input') {
      return { emoji: q.icon, text: q.prefix ? `${q.prefix}${val}` : String(val) }
    }
    const opt = q.options?.find(o => o.id === val)
    return opt ? { emoji: opt.emoji, text: opt.text } : null
  }

  const destination = answers[1]
  const days        = answers[2]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ fontSize: 52, marginBottom: 12 }}
        >
          🗺️
        </motion.div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
          Your Trip is Ready!
        </h2>
        {destination && (
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
            {days ? `${days}-day journey to ` : 'Journey to '}
            <span style={{ color: 'var(--violet-2)', fontWeight: 600 }}>{destination}</span>
          </p>
        )}
      </div>

      <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map((q, i) => {
          const display = getDisplay(q, answers[i])
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--item-bg)',
                border: display ? '1px solid rgba(124,106,255,0.2)' : '1px solid var(--border)',
                borderRadius: 14, padding: '10px 14px'
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: display ? 'linear-gradient(135deg, #7c6aff, #2dd4bf)' : 'var(--glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: display ? '#fff' : 'var(--text-3)'
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2, fontFamily: 'DM Sans' }}>{q.question}</div>
                {display ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{display.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{display.text}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Not answered</span>
                )}
              </div>
              {display && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className="fa fa-check" style={{ fontSize: 8, color: '#2dd4bf' }} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <button
        className="btn-gradient w-100 mb-3"
        style={{ fontSize: 15, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => navigate('/itinerary', { state: { autoGenerate: true, selectTripId: tripId } })}
      >
        <i className="fa fa-wand-magic-sparkles" /> Generate Itinerary with AI
      </button>
      <button className="btn-ghost w-100" style={{ fontSize: 14 }} onClick={onRestart}>
        ↩ Start Over
      </button>
    </motion.div>
  )
}
