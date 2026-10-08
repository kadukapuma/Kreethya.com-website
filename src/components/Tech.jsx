const ROW_A = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Laravel', 'Flutter', 'React Native']
const ROW_B = ['PostgreSQL', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Firebase', 'Figma', 'Tailwind CSS']

function Row({ items, reverse }) {
  // The list is doubled so the loop has no gap.
  return (
    <div className={`tech__row${reverse ? ' tech__row--rev' : ''}`}>
      <ul>
        {[...items, ...items].map((t, n) => (
          <li key={n} aria-hidden={n >= items.length}>
            <i />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tech() {
  return (
    <section className="tech" aria-label="Technologies we work with">
      <div className="section__head section__head--center">
        <span className="eyebrow" data-reveal>
          Technologies
        </span>
        <h2 data-reveal style={{ '--d': '80ms' }}>
          Modern stack, <span className="text-grad">real results</span>
        </h2>
      </div>
      <div className="tech__rows" data-reveal style={{ '--d': '160ms' }}>
        <Row items={ROW_A} />
        <Row items={ROW_B} reverse />
      </div>
    </section>
  )
}

export default Tech
