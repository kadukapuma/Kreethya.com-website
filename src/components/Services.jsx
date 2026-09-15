const SERVICES = [
  {
    icon: '🌐',
    title: 'Web App Development',
    desc: 'Fast, accessible, and scalable web applications built with modern frameworks and clean architecture.',
  },
  {
    icon: '📱',
    title: 'Mobile App Development',
    desc: 'Native and cross-platform apps for iOS and Android that feel fast and native from day one.',
  },
  {
    icon: '☁️',
    title: 'Cloud & DevOps',
    desc: 'CI/CD pipelines, containerization, and cloud infrastructure on AWS, Azure, or GCP built for reliability.',
  },
  {
    icon: '🎨',
    title: 'UI/UX Design',
    desc: 'Research-driven product design that turns complex workflows into simple, delightful interfaces.',
  },
  {
    icon: '🧩',
    title: 'Custom Enterprise Software',
    desc: 'Bespoke internal tools, ERPs, and integrations that fit the way your business actually works.',
  },
  {
    icon: '✅',
    title: 'QA & Testing',
    desc: 'Automated and manual testing pipelines that catch issues before your users ever do.',
  },
]

function Services() {
  return (
    <section id="services" className="section">
      <div className="section__head">
        <span className="eyebrow">What we do</span>
        <h2>Services built around your product goals</h2>
        <p className="section__lede">
          From a single feature to a full platform rebuild, our team plugs in wherever
          you need us most.
        </p>
      </div>

      <div className="grid grid--3">
        {SERVICES.map((s) => (
          <div className="card" key={s.title}>
            <div className="card__icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Services
