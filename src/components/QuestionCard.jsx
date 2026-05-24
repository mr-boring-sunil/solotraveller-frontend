import { motion, AnimatePresence } from 'framer-motion'
import OptionCard from './OptionCard'
import InputStep  from './InputStep'
const V = {
  enter: d => ({ x: d>0?60:-60, opacity:0, scale:.97 }),
  center:  () => ({ x:0, opacity:1, scale:1 }),
  exit:  d => ({ x: d>0?-60:60, opacity:0, scale:.97 }),
}
export default function QuestionCard({ question, answer, onSelect, direction, stepKey }) {
  const cols = question.options?.length === 3 ? 3 : 2
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div key={stepKey} custom={direction} variants={V} initial="enter" animate="center" exit="exit" transition={{ duration:.35, ease:[.4,0,.2,1] }}>
        <div className="text-center mb-5">
          <p className="t-label" style={{ marginBottom:10 }}>{question.subtitle}</p>
          <h2 className="t-h1" style={{ fontSize:'clamp(20px,4.5vw,26px)' }}>{question.question}</h2>
        </div>
        {question.type==='options' ? (
          <div className="row g-3">
            {question.options.map((opt,i) => (
              <div key={opt.id} className={`col-${12/cols}`}>
                <OptionCard option={opt} isSelected={answer===opt.id} onSelect={onSelect} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <InputStep question={question} value={answer} onChange={onSelect} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
