import Icon from './Icon'

const STEPS = [
  { icon: 'search', title: 'Discover', desc: 'Your goals and needs.' },
  { icon: 'file', title: 'Plan', desc: 'The right strategy.' },
  { icon: 'code', title: 'Develop', desc: 'Modern, clean code.' },
  { icon: 'shield', title: 'Test', desc: 'Quality and speed.' },
  { icon: 'rocket', title: 'Deploy', desc: 'Launch and support.' },
]

function Process() {
  return (
    <section id="process" className="section">
      <div className="section__head">
        <div>
          <span className="eyebrow" data-reveal>
            Our process
          </span>
          <h2 data-reveal style={{ '--d': '80ms' }}>
            How we <span className="text-grad">work</span>
          </h2>
        </div>
      </div>

      <ol className="process" data-reveal="line">
        {STEPS.map((s, n) => (
          <li key={s.title} className="process__step" data-reveal="pop" style={{ '--d': `${n * 130}ms` }}>
            <span className="process__icon">
              <Icon name={s.icon} size={24} />
              <em>{String(n + 1).padStart(2, '0')}</em>
            </span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Process
