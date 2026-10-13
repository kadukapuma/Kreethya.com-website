import { useEffect, useRef, useState } from 'react'
import Laptop from './Laptop'
import Phone from './Phone'
import Icon from './Icon'
import { DashboardScreen, ExamScreen, PhoneRideScreen } from './Screens'

/*
 * Each project shows on the device it was built for: 'laptop' (web) or 'phone' (mobile app).
 * The section scrolls past at normal speed; visitors switch projects with the < > buttons,
 * the dots, or by swiping on the device. `featured: true` marks the one shown first.
 * To add a project, add an entry here.
 *
 * Your own screenshots: put image files in  public/projects/  and list them in `images`,
 * e.g. images: ['/projects/ride-app-1.png', '/projects/ride-app-2.png'].
 * They fill the device's screen (several images play as a slideshow). Until then, or if a
 * file is missing, the designed mock screen (`Screen`) shows instead.
 * Best sizes: laptop 1600 x 1000 (16:10), phone 1080 x 2340 (portrait, about 9:19.5).
 * Screenshots fill the screen and are trimmed a little at the edges if their shape differs.
 */
const PROJECTS = [
    {
    tag: 'Mobile app',
    title: 'Ride-Hailing Platform',
    desc: 'Passenger and driver apps with live tracking.',
    stack: ['Flutter', 'Firebase', 'Maps'],
    device: 'phone',
    featured: true,
    images: [],
    Screen: PhoneRideScreen,
  },
  {
    tag: 'Web application',
    title: 'Business Management System',
    desc: 'One platform for sales, stock and teams.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    device: 'laptop',
    featured: true,
    images: [],
    Screen: DashboardScreen,
  },

  {
    tag: 'Web application',
    title: 'Exam Management System',
    desc: 'Online exams with AI-assisted questions.',
    stack: ['Next.js', 'Python', 'AI'],
    device: 'laptop',
    images: [],
    Screen: ExamScreen,
  },
]

const SLIDE_MS = 2600 // time each screenshot stays up when a project has several

// The project's own screenshots over its mock screen; missing files simply drop out.
function Shots({ images, Screen, active }) {
  const [broken, setBroken] = useState([])
  const [n, setN] = useState(0)
  const good = images.filter((src) => !broken.includes(src))
  useEffect(() => {
    if (!active || good.length < 2) return undefined
    const t = setInterval(() => setN((v) => v + 1), SLIDE_MS)
    return () => clearInterval(t)
  }, [active, good.length])
  return (
    <>
      <Screen />
      {good.map((src, i) => (
        <img
          key={src}
          className={`work__shot${i === n % good.length ? ' is-on' : ''}`}
          src={src}
          alt=""
          draggable="false"
          onError={() => setBroken((b) => [...b, src])}
        />
      ))}
    </>
  )
}

function DeviceScreens({ device, active }) {
  return PROJECTS.map((p, i) =>
    p.device === device ? (
      <div key={p.title} className={`work__screen${i === active ? ' is-active' : ''}${i < active ? ' is-past' : ''}`}>
        <Shots images={p.images} Screen={p.Screen} active={i === active} />
      </div>
    ) : null,
  )
}

function Work() {
  const sectionRef = useRef(null)
  const laptopRef = useRef(null)
  const phoneRef = useRef(null)
  const swipeRef = useRef(null)
  // the project on show (index into PROJECTS): changed with < >, the dots, or a swipe
  const [active, setActive] = useState(Math.max(0, PROJECTS.findIndex((p) => p.featured)))
  const [seen, setSeen] = useState(false) // the section has scrolled into view

  // Open up when the section comes into view (it scrolls past at normal speed, no pinning).
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  // Device poses: the laptop opens its lid when seen and turns a little for each project.
  useEffect(() => {
    const laptop = laptopRef.current
    const phone = phoneRef.current
    if (!laptop || !phone) return
    const swing = active % 2 ? 6 : -6
    laptop.style.setProperty('--lid', seen ? '8deg' : '-86deg')
    laptop.style.setProperty('--ry', `${seen ? -22 + swing : -38}deg`)
    laptop.style.setProperty('--rx', `${seen ? -12 : -22}deg`)
    laptop.style.setProperty('--s', seen ? '1' : '0.86')
    phone.style.setProperty('--ry', `${-14 + swing}deg`)
    phone.style.setProperty('--rx', '6deg')
  }, [active, seen])

  const step = (dir) => setActive((a) => (a + dir + PROJECTS.length) % PROJECTS.length)

  // swipe left / right on the devices to change project (vertical scrolling still works)
  const onPointerDown = (e) => {
    swipeRef.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    const s = swipeRef.current
    swipeRef.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1)
  }

  const project = PROJECTS[active]
  const device = project.device

  return (
    <section id="work" className={`work${seen ? ' is-seen' : ''}`} ref={sectionRef}>
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

            <div className="work__nav">
              <div className="work__arrows">
                <button type="button" aria-label="Previous project" onClick={() => step(-1)}>
                  <Icon name="chevronLeft" size={20} />
                </button>
                <button type="button" aria-label="Next project" onClick={() => step(1)}>
                  <Icon name="chevronRight" size={20} />
                </button>
              </div>
              <div className="work__dots" role="tablist" aria-label="Projects">
                {PROJECTS.map((p, i) => (
                  <button
                    key={p.title}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={p.title}
                    className={i === active ? 'is-on' : ''}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="work__stage"
            data-device={device}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeRef.current = null)}
          >
            <span className="work__halo" aria-hidden="true" />
            <div className={`work__device work__device--laptop${device === 'laptop' ? ' is-on' : ''}`}>
              <Laptop ref={laptopRef} className="laptop--work">
                <DeviceScreens device="laptop" active={active} />
              </Laptop>
            </div>
            <div className={`work__device work__device--phone${device === 'phone' ? ' is-on' : ''}`}>
              <Phone ref={phoneRef} className="phone--work">
                <DeviceScreens device="phone" active={active} />
              </Phone>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Work
