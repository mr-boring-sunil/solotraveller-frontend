import { motion } from 'framer-motion'
export default function OptionCard({ option, isSelected, onSelect, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:index*.055, duration:.3, ease:[.22,1,.36,1] }}
      whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:.97 }}
      className={`opt-card${isSelected?' sel':''}`}
      onClick={() => onSelect(option.id)}
    >
      {isSelected && <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:420, damping:22 }} className="chk"><i className="fa fa-check" style={{ fontSize:8 }} /></motion.div>}
      <div className="opt-emoji">{option.emoji}</div>
      <div className="opt-label">{option.text}</div>
      {option.description && <div className="opt-desc">{option.description}</div>}
    </motion.div>
  )
}
