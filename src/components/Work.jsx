import { useEffect, useRef, useState } from 'react'
import Laptop from './Laptop'
import { DashboardScreen, ExamScreen, RideScreen } from './Screens'

const PROJECTS = [
  {
    tag: 'Web application',
    title: 'Business Management System',
    desc: 'One platform for sales, stock and teams.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    Screen: DashboardScreen,
  },
  {
    tag: 'Mobile app',
    title: 'Ride-Hailing Platform',
    desc: 'Passenger and driver apps with live tracking.',
    stack: ['Flutter', 'Firebase', 'Maps'],
    Screen: RideScreen,
  },
  {
    tag: 'Web application',
    title: 'Exam Management System',
    desc: 'Online exams with AI-assisted questions.',
    stack: ['Next.js', 'Python', 'AI'],
    Screen: ExamScreen,
  },
]

const OPEN = 0.16 // share of the scroll spent opening the lid
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => 1 - Math.pow(1 - t, 3)

function Work() {
  const sectionRef = useRef(null)
  const laptopRef = useRef(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  // Scroll position -> lid angle, turn and current project. Runs both ways.
  useEffect(() => {
    const section = sectionRef.current
    const laptop = laptopRef.current
    if (!section || !laptop) return undefined
    let raf = 0
    const update = () => {
      raf = 0
      const r = section.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = clamp(-r.top / total)
      const open = ease(clamp(p / OPEN))
      const rest = clamp((p - OPEN) / (1 - OPEN))
      const n = PROJECTS.length
      const idx = Math.min(n - 1, Math.floor(rest * n))
      const local = rest * n - idx
      // a small swing each time a new project slides in
      const swing = Math.sin(clamp(local * 2.2) * Math.PI) * 6
      laptop.style.setProperty('--lid', `${-86 + 94 * open}deg`)
      laptop.style.setProperty('--ry', `${-38 + 14 * open + 44 * rest + swing}deg`)
      laptop.style.setProperty('--rx', `${-22 + 8 * open + 4 * Math.sin(rest * Math.PI)}deg`)
      laptop.style.setProperty('--s', String(0.86 + 0.14 * open))
      section.style.setProperty('--p', String(rest))
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Jump to the middle of a project's stretch of scroll.
  const goTo = (i) => {
    const section = sectionRef.current
    const total = section.offsetHeight - window.innerHeight
    const p = OPEN + (1 - OPEN) * ((i + 0.5) / PROJECTS.length)
    window.scrollTo({ top: section.offsetTop + total * p, behavior: 'smooth' })
  }

  const project = PROJECTS[active]

  return (
    <section id="work" className="work" ref={sectionRef}>
      <div className="work__sticky">
        <div className="work__inner">
          <div className="work__copy">
            <span className="eyebrow" data-reveal>
              Our work
            </span>
            <h2 data-reveal style={{ '--d': '80ms' }}>
              Featured <span className="text-grad">projects</span>
            </h2>

            <div className="work__project" key={active}>
              <span className="work__count">
                {String(active + 1).padStart(2, '0')}
                <small> / {String(PROJECTS.length).padStart(2, '0')}</small>
              </span>
              <span className="tag">{project.tag}</span>
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <ul className="work__stack">
                {project.stack.map((s, n) => (
                  <li key={s} style={{ '--i': n }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="work__dots" role="tablist" aria-label="Projects">
              {PROJECTS.map((p, i) => (
                <button
                  key={p.title}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={p.title}
                  className={i === active ? 'is-on' : ''}
                  onClick={() => goTo(i)}
                />
              ))}
              <span className="work__rail">
                <span />
              </span>
            </div>
          </div>

          <div className="work__stage">
            <span className="work__halo" aria-hidden="true" />
            <Laptop ref={laptopRef} className="laptop--work">
              {PROJECTS.map(({ title, Screen }, i) => (
                <div
                  key={title}
                  className={`work__screen${i === active ? ' is-active' : ''}${i < active ? ' is-past' : ''}`}
                >
                  <Screen />
                </div>
              ))}
            </Laptop>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Work
