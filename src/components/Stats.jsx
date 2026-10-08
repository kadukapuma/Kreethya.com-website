import { useEffect, useRef } from 'react'
import Icon from './Icon'

const STATS = [
  { icon: 'layers', value: 50, suffix: '+', label: 'Projects delivered' },
  { icon: 'heart', value: 30, suffix: '+', label: 'Happy clients' },
  { icon: 'star', value: 5, suffix: '+', label: 'Years of experience' },
  { icon: 'code', value: 15, suffix: '+', label: 'Engineers & designers' },
]

// Numbers count up each time the band comes into view.
function Stats() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const nums = [...root.querySelectorAll('[data-count]')]
    let raf = 0
    const run = () => {
      const start = performance.now()
      const step = (now) => {
        const k = Math.min(1, (now - start) / 1400)
        const e = 1 - Math.pow(1 - k, 4)
        nums.forEach((el) => {
          el.textContent = String(Math.round(Number(el.dataset.count) * e))
        })
        if (k < 1) raf = requestAnimationFrame(step)
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && run(), { threshold: 0.4 })
    io.observe(root)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="stats" ref={ref} aria-label="Kreethya in numbers">
      {STATS.map((s, n) => (
        <div key={s.label} className="stats__item" data-reveal="pop" style={{ '--d': `${n * 90}ms` }}>
          <span className="stats__icon">
            <Icon name={s.icon} size={24} />
          </span>
          <div>
            <strong>
              <span data-count={s.value}>{s.value}</span>
              {s.suffix}
            </strong>
            <small>{s.label}</small>
          </div>
        </div>
      ))}
    </section>
  )
}

export default Stats
