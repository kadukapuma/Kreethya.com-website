import { useEffect, useRef, useState } from 'react'
import logo from '../assets/kreethya-logo.webp'
import Icon from './Icon'

const LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [hover, setHover] = useState('')
  const linksRef = useRef(null)
  const pillRef = useRef(null)
  const barRef = useRef(null)

  // Hide while scrolling down, flow back in when scrolling up; drive the progress line.
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      setScrolled(y > 12)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160)
        last = y
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Which section is in the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', ...LINKS.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  // Slide the pill under the hovered link, or the active one.
  useEffect(() => {
    const pill = pillRef.current
    const wrap = linksRef.current
    if (!pill || !wrap) return
    const target = wrap.querySelector(`[data-id="${hover || active}"]`)
    if (!target) {
      pill.style.opacity = '0'
      return
    }
    pill.style.opacity = '1'
    pill.style.width = `${target.offsetWidth}px`
    pill.style.transform = `translateX(${target.offsetLeft}px)`
  }, [active, hover])

  const close = () => setOpen(false)

  return (
    <>
    <span className="progress" ref={barRef} aria-hidden="true" />
    <header className={`nav${hidden && !open ? ' nav--hidden' : ''}${scrolled ? ' nav--scrolled' : ''}${open ? ' nav--open' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__brand" onClick={close} aria-label="Kreethya home">
          <img src={logo} alt="Kreethya" />
        </a>

        <nav className="nav__links" ref={linksRef} onMouseLeave={() => setHover('')}>
          <span className="nav__pill" ref={pillRef} aria-hidden="true" />
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              data-id={l.id}
              className={(hover || active) === l.id ? 'is-lit' : ''}
              onMouseEnter={() => setHover(l.id)}
              onClick={close}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn btn--primary btn--sm nav__cta">
          Let&rsquo;s talk <Icon name="arrow" size={16} />
        </a>

        <button
          className="nav__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="nav__sheet" aria-hidden={!open}>
        {LINKS.map((l, n) => (
          <a key={l.id} href={`#${l.id}`} onClick={close} style={{ '--i': n }} tabIndex={open ? 0 : -1}>
            {l.label}
            <Icon name="arrow" size={18} />
          </a>
        ))}
      </div>
    </header>
    </>
  )
}

export default Navbar
