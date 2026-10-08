import { Fragment, useEffect, useRef } from 'react'
import Icon from './Icon'
import Laptop from './Laptop'
import { DashboardScreen } from './Screens'

const FEATURES = [
  { icon: 'target', title: 'Business focused' },
  { icon: 'layers', title: 'Modern technology' },
  { icon: 'heart', title: 'Long-term partner' },
  { icon: 'shield', title: 'Scalable & secure' },
]

const HEADLINE = ['Turning', 'ideas', 'into', 'powerful', 'digital', 'solutions.']

function Hero() {
  const sceneRef = useRef(null)
  const laptopRef = useRef(null)

  // The laptop leans towards the pointer.
  useEffect(() => {
    const scene = sceneRef.current
    const laptop = laptopRef.current
    if (!scene || !laptop || !window.matchMedia('(hover: hover)').matches) return undefined
    const onMove = (e) => {
      const r = scene.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      laptop.style.setProperty('--ry', `${-18 + x * 22}deg`)
      laptop.style.setProperty('--rx', `${-12 - y * 10}deg`)
    }
    const onLeave = () => {
      laptop.style.removeProperty('--ry')
      laptop.style.removeProperty('--rx')
    }
    const section = scene.closest('section')
    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section id="top" className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__blob hero__blob--1" />
        <span className="hero__blob hero__blob--2" />
        <span className="hero__grid" />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <span className="eyebrow" data-reveal>
            Software development company
          </span>
          <h1 className="hero__title">
            {HEADLINE.map((w, n) => (
              <Fragment key={n}>
                <span className="hero__word" data-reveal style={{ '--d': `${120 + n * 70}ms` }}>
                  {w === 'digital' ? <em className="text-grad">{w}</em> : w}
                </span>{' '}
              </Fragment>
            ))}
          </h1>
          <p className="hero__lede" data-reveal style={{ '--d': '560ms' }}>
            Web, mobile and enterprise software that helps your business grow.
          </p>
          <div className="hero__actions" data-reveal style={{ '--d': '680ms' }}>
            <a href="#contact" className="btn btn--primary">
              Start a project <Icon name="arrow" size={18} />
            </a>
            <a href="#work" className="btn btn--ghost">
              See our work
            </a>
          </div>
        </div>

        <div className="hero__scene" ref={sceneRef} data-reveal="zoom" style={{ '--d': '200ms' }}>
          <div className="hero__float">
            <Laptop ref={laptopRef} className="laptop--hero">
              <DashboardScreen />
            </Laptop>
          </div>
          <div className="hero__chip hero__chip--a">
            <span className="hero__chip-icon">
              <Icon name="layers" size={18} />
            </span>
            <div>
              <strong>Real-time insights</strong>
              <small>Track growth in one place</small>
            </div>
          </div>
          <div className="hero__chip hero__chip--b">
            <span className="hero__chip-icon">
              <Icon name="rocket" size={18} />
            </span>
            <div>
              <strong>Scalable solutions</strong>
              <small>Built to grow with you</small>
            </div>
          </div>
        </div>
      </div>

      <ul className="features">
        {FEATURES.map((f, n) => (
          <li key={f.title} data-reveal style={{ '--d': `${n * 90}ms` }}>
            <span className="features__icon">
              <Icon name={f.icon} size={22} />
            </span>
            {f.title}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Hero
