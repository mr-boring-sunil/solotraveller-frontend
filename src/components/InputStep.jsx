import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
export default function InputStep({ question, value, onChange }) {
  const ref = useRef(null)
  useEffect(() => { const t = setTimeout(()=>ref.current?.focus(), 300); return ()=>clearTimeout(t) }, [question.id])
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35, delay:.1 }}>
      <div className="d-flex justify-content-center mb-5">
        <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,rgba(124,106,255,0.18),rgba(45,212,191,0.1))', border:'1.5px solid rgba(124,106,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, boxShadow:'0 0 28px rgba(124,106,255,0.14)' }}>
          {question.icon}
        </div>
      </div>
      <div style={{ position:'relative' }}>
        {question.prefix && <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color: value ? 'var(--violet-2)' : 'var(--text-3)', fontWeight:700, fontSize:16, zIndex:1 }}>{question.prefix}</span>}
        <input ref={ref} type={question.inputType||'text'} className="inp" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={question.placeholder} min={question.min} max={question.max}
          style={{ paddingLeft: question.prefix ? 32 : 18, paddingRight: 18, fontSize:16 }}
        />
      </div>
      {question.inputType==='number' && question.min && (
        <p className="t-small" style={{ marginTop:8, marginLeft:4 }}>{question.max ? `${question.min}–${question.max}` : `Min: ${question.min}`}</p>
      )}
    </motion.div>
  )
}
