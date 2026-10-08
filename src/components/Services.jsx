import Icon from './Icon'

const SERVICES = [
  { icon: 'globe', title: 'Web Development', desc: 'Fast, scalable web applications.' },
  { icon: 'phone', title: 'Mobile Apps', desc: 'Android and iOS apps people love.' },
  { icon: 'code', title: 'Custom Software', desc: 'Systems built around your workflow.' },
  { icon: 'palette', title: 'UI/UX Design', desc: 'Clean interfaces that convert.' },
  { icon: 'cloud', title: 'Cloud & DevOps', desc: 'Reliable deployment and hosting.' },
  { icon: 'gear', title: 'Maintenance & Support', desc: 'We keep things running smoothly.' },
]

// Cards lean towards the pointer.
const tilt = (e) => {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--tx', `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`)
  el.style.setProperty('--ty', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`)
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
const untilt = (e) => {
  e.currentTarget.style.setProperty('--tx', '0deg')
  e.currentTarget.style.setProperty('--ty', '0deg')
}

function Services() {
  return (
    <section id="services" className="section">
      <div className="section__head">
        <div>
          <span className="eyebrow" data-reveal>
            Our services
          </span>
          <h2 data-reveal style={{ '--d': '80ms' }}>
            Complete software solutions <span className="text-grad">for your business</span>
          </h2>
        </div>
        <a href="#contact" className="btn btn--ghost btn--sm" data-reveal style={{ '--d': '160ms' }}>
          Discuss a project <Icon name="arrow" size={16} />
        </a>
      </div>

      <div className="services">
        {SERVICES.map((s, n) => (
          <div key={s.title} data-reveal="pop" style={{ '--d': `${(n % 3) * 90 + Math.floor(n / 3) * 60}ms` }}>
            <article className="service" onMouseMove={tilt} onMouseLeave={untilt}>
              <span className="service__icon">
                <Icon name={s.icon} size={26} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="service__more">
                <Icon name="arrow" size={18} />
              </span>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Services
