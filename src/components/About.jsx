const STATS = [
  { value: '5+', label: 'Years of experience' },
  { value: '50+', label: 'Projects delivered' },
  { value: '30+', label: 'Clients worldwide' },
  { value: '15+', label: 'Engineers & designers' },
]

const POINTS = [
  'Dedicated senior engineers, not a rotating cast of juniors',
  'Transparent timelines with weekly demos and progress reports',
  'Security and performance built in from the first commit',
  'Long-term support after launch, not just a handoff',
]

function About() {
  return (
    <section id="about" className="section section--alt">
      <div className="about">
        <div className="about__text">
          <span className="eyebrow">About Kreethya</span>
          <h2>A software team that treats your product like our own</h2>
          <p>
            Kreethya is a software engineering company helping founders and enterprise
            teams design, build, and ship reliable digital products. We combine deep
            technical expertise with a product mindset — so what we ship doesn't just
            work, it moves the business forward.
          </p>
          <ul className="checklist">
            {POINTS.map((point) => (
              <li key={point}>
                <span className="checklist__icon">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="about__stats">
          {STATS.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
