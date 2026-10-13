import {
  siDocker,
  siFigma,
  siFirebase,
  siFlutter,
  siLaravel,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
} from 'simple-icons'

// Official brand logos (simple-icons), each in its brand colour.
const ROW_A = [
  { name: 'React', icon: siReact },
  { name: 'Next.js', icon: siNextdotjs },
  { name: 'Node.js', icon: siNodedotjs },
  { name: 'TypeScript', icon: siTypescript },
  { name: 'Python', icon: siPython },
  { name: 'Laravel', icon: siLaravel },
  { name: 'Flutter', icon: siFlutter },
  { name: 'React Native', icon: siReact },
]
const ROW_B = [
  { name: 'PostgreSQL', icon: siPostgresql },
  { name: 'MySQL', icon: siMysql },
  { name: 'MongoDB', icon: siMongodb },
  { name: 'AWS', icon: 'aws' },
  { name: 'Docker', icon: siDocker },
  { name: 'Firebase', icon: siFirebase },
  { name: 'Figma', icon: siFigma },
  { name: 'Tailwind CSS', icon: siTailwindcss },
]

// simple-icons no longer ships the AWS logo, so it is drawn here: the "aws" wordmark and its smile.
function AwsLogo() {
  return (
    <svg className="tech__logo" viewBox="0 0 64 40" aria-hidden="true">
      <text x="32" y="22" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="22" fill="#232F3E">
        aws
      </text>
      <path d="M10 28c13 8 31 8 44 0" fill="none" stroke="#FF9900" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M48 24.5l7 3.2-4.8 5.6" fill="none" stroke="#FF9900" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Logo({ icon }) {
  if (icon === 'aws') return <AwsLogo />
  return (
    <svg className="tech__logo" viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  )
}

function Row({ items, reverse }) {
  // The list is doubled so the loop has no gap.
  return (
    <div className={`tech__row${reverse ? ' tech__row--rev' : ''}`}>
      <ul>
        {[...items, ...items].map((t, n) => (
          <li key={n} aria-hidden={n >= items.length}>
            <Logo icon={t.icon} />
            {t.name}
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
