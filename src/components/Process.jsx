const STEPS = [
  {
    step: '01',
    title: 'Discover & Plan',
    desc: 'We dig into your goals, users, and constraints to define scope, milestones, and success metrics.',
  },
  {
    step: '02',
    title: 'Design',
    desc: 'Wireframes and prototypes validate the experience before a single line of production code is written.',
  },
  {
    step: '03',
    title: 'Develop',
    desc: 'Agile sprints with weekly demos, clean code reviews, and continuous integration from day one.',
  },
  {
    step: '04',
    title: 'Test & QA',
    desc: 'Automated test suites and manual QA passes catch issues before they ever reach your users.',
  },
  {
    step: '05',
    title: 'Deploy & Support',
    desc: 'We ship to production and stay on to monitor, maintain, and evolve the product with you.',
  },
]

function Process() {
  return (
    <section id="process" className="section">
      <div className="section__head">
        <span className="eyebrow">How we work</span>
        <h2>A proven process from idea to production</h2>
        <p className="section__lede">
          No black boxes — you'll always know what we're building and why.
        </p>
      </div>

      <div className="timeline">
        {STEPS.map((s) => (
          <div className="timeline__item" key={s.step}>
            <div className="timeline__number">{s.step}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Process
