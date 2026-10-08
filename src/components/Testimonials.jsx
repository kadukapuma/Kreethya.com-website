import { useEffect, useState } from 'react'
import Icon from './Icon'

const TESTIMONIALS = [
  {
    quote: 'Kreethya rebuilt our platform in under three months and it has been rock solid since launch.',
    name: 'Priya Sharma',
    role: 'Product Manager, Fintech Startup',
  },
  {
    quote: 'The team felt like an extension of ours, not an outside vendor.',
    name: 'Daniel Osei',
    role: 'CTO, Logistics SaaS',
  },
  {
    quote: 'Thoughtful and fast from design to deployment. Our app ratings jumped after the redesign.',
    name: 'Meera Nair',
    role: 'Founder, Health & Wellness App',
  },
]

function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = TESTIMONIALS.length
  const go = (d) => setIndex((i) => (i + d + n) % n)

  useEffect(() => {
    if (paused) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 6000)
    return () => clearInterval(t)
  }, [paused, n])

  const t = TESTIMONIALS[index]

  return (
    <section id="testimonials" className="section">
      <div className="section__head">
        <div>
          <span className="eyebrow" data-reveal>
            Client stories
          </span>
          <h2 data-reveal style={{ '--d': '80ms' }}>
            Trusted by <span className="text-grad">businesses</span>
          </h2>
        </div>
        <div className="quotes__nav" data-reveal style={{ '--d': '160ms' }}>
          <button onClick={() => go(-1)} aria-label="Previous testimonial">
            <Icon name="chevronLeft" size={20} />
          </button>
          <button onClick={() => go(1)} aria-label="Next testimonial">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>

      <div
        className="quote"
        data-reveal="pop"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="quote__mark">
          <Icon name="quote" size={30} strokeWidth={0} fill="currentColor" />
        </span>
        <figure key={index} className="quote__body">
          <blockquote>{t.quote}</blockquote>
          <figcaption>
            <span className="quote__avatar">{t.name.charAt(0)}</span>
            <span>
              <strong>{t.name}</strong>
              <small>{t.role}</small>
            </span>
            <span className="quote__stars" aria-label="5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon key={i} name="star" size={16} strokeWidth={0} fill="currentColor" />
              ))}
            </span>
          </figcaption>
        </figure>
        <div className="quote__dots">
          {TESTIMONIALS.map((q, i) => (
            <button
              key={q.name}
              className={i === index ? 'is-on' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
