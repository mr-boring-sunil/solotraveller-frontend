export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom:20 }}>
      <div className="d-flex justify-content-between mb-2">
        <span className="t-label">Step {current} of {total}</span>
        <span style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--violet-2)', fontWeight:500 }}>{pct}%</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width:`${pct}%` }} />
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:10 }}>
        {Array.from({length:total}).map((_,i) => (
          <div key={i} style={{ height:4, borderRadius:99, transition:'all .35s', width: i+1===current ? 22 : 6, background: i+1<current ? 'var(--teal)' : i+1===current ? 'var(--violet)' : 'rgba(255,255,255,0.08)', opacity: i+1<=current ? 1 : 0.35 }} />
        ))}
      </div>
    </div>
  )
}
