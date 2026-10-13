import mark from '../assets/kreethya-mark.webp'

// Mock app screens shown inside the laptop. Sizes are in em, so they scale
// with the laptop (the screen sets font-size from its width).

const BARS = [38, 62, 45, 80, 56, 92, 48, 70, 100, 64, 84, 58]

function Side({ items = 6, active = 0 }) {
  return (
    <aside className="scr__side">
      <img src={mark} alt="" className="scr__logo" />
      {Array.from({ length: items }, (_, n) => (
        <span key={n} className={`scr__nav${n === active ? ' is-on' : ''}`}>
          <i />
          <b />
        </span>
      ))}
    </aside>
  )
}

export function DashboardScreen() {
  return (
    <div className="scr scr--dash">
      <Side />
      <div className="scr__main">
        <div className="scr__head">
          <div>
            <strong>Dashboard</strong>
            <small>Good morning, team</small>
          </div>
          <span className="scr__search" />
          <span className="scr__avatar" />
        </div>
        <div className="scr__stats">
          <div className="scr__stat scr__stat--hi">
            <small>Total projects</small>
            <strong>24</strong>
            <em>+12% this month</em>
          </div>
          <div className="scr__stat">
            <small>Active clients</small>
            <strong>12</strong>
            <em>3 new</em>
          </div>
          <div className="scr__stat">
            <small>Team</small>
            <strong>18</strong>
            <em>online</em>
          </div>
        </div>
        <div className="scr__row">
          <div className="scr__card scr__chart">
            <small>Revenue overview</small>
            <div className="scr__bars">
              {BARS.map((h, n) => (
                <span key={n} style={{ '--h': `${h}%`, '--i': n }} />
              ))}
            </div>
          </div>
          <div className="scr__card scr__list">
            <small>Recent activity</small>
            {['UI design completed', 'New client onboarded', 'Deployment successful'].map((t, n) => (
              <p key={t} style={{ '--i': n }}>
                <i />
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RideScreen() {
  const route = 'M60 250 C 120 240 140 190 190 175 S 280 150 300 110 S 380 60 440 70'
  return (
    <div className="scr scr--ride">
      <Side active={1} />
      <div className="scr__trips">
        <strong>Live trips</strong>
        {[
          ['Colombo Fort', '3 min', true],
          ['Kandy Road', '8 min', false],
          ['Galle Face', '12 min', false],
          ['Nugegoda', '15 min', false],
        ].map(([place, eta, on]) => (
          <div key={place} className={`scr__trip${on ? ' is-on' : ''}`}>
            <i />
            <span>{place}</span>
            <em>{eta}</em>
          </div>
        ))}
      </div>
      <div className="scr__map">
        <svg viewBox="0 0 500 320" preserveAspectRatio="xMidYMid slice">
          <rect width="500" height="320" fill="#e8f3ee" />
          <path d="M0 210 Q 160 190 260 230 T 500 200" stroke="#cfe6da" strokeWidth="38" fill="none" />
          <g stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round">
            <path d="M0 90 H500" />
            <path d="M0 270 H500" />
            <path d="M120 0 V320" />
            <path d="M330 0 V320" />
            <path d="M0 10 L 500 300" opacity=".8" />
          </g>
          <rect x="370" y="150" width="90" height="70" rx="12" fill="#d4ecdf" />
          <rect x="150" y="20" width="120" height="50" rx="12" fill="#d4ecdf" />
          <path className="scr__route" pathLength="1" d={route} stroke="#058875" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="250" r="11" fill="#02ca96" stroke="#fff" strokeWidth="4" />
          <circle cx="440" cy="70" r="11" fill="#0a392c" stroke="#fff" strokeWidth="4" />
          <g>
            <circle r="13" fill="#fff" />
            <circle r="8" fill="#058875" />
            <animateMotion dur="6s" repeatCount="indefinite" path={route} />
          </g>
        </svg>
        <div className="scr__driver">
          <span className="scr__avatar" />
          <div>
            <strong>Driver arriving</strong>
            <small>Toyota Prius · 3 min away</small>
          </div>
          <em>Track</em>
        </div>
      </div>
    </div>
  )
}

export function ExamScreen() {
  return (
    <div className="scr scr--exam">
      <Side active={2} />
      <div className="scr__main">
        <div className="scr__head">
          <div>
            <strong>Physics · Mid term</strong>
            <small>Question 12 of 40</small>
          </div>
          <span className="scr__chip">AI assisted</span>
          <span className="scr__avatar" />
        </div>
        <div className="scr__row scr__row--exam">
          <div className="scr__card scr__question">
            <small>Q12</small>
            <p>Which law explains why a rocket moves forward?</p>
            {["Newton's first law", "Newton's third law", 'Ohm’s law', 'Hooke’s law'].map((o, n) => (
              <span key={o} className={`scr__opt${n === 1 ? ' is-on' : ''}`} style={{ '--i': n }}>
                <i />
                {o}
              </span>
            ))}
          </div>
          <div className="scr__card scr__score">
            <small>Class average</small>
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" stroke="#e3eee9" strokeWidth="12" fill="none" />
              <circle
                className="scr__ring"
                cx="60"
                cy="60"
                r="48"
                stroke="url(#scr-g)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                pathLength="100"
              />
              <defs>
                <linearGradient id="scr-g" x1="0" x2="1">
                  <stop offset="0" stopColor="#058875" />
                  <stop offset="1" stopColor="#93dc2c" />
                </linearGradient>
              </defs>
              <text x="60" y="68" textAnchor="middle">86%</text>
            </svg>
            <p>
              <b>320</b> students
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Portrait mobile-app screen for the phone: live map, driver card and a trip sheet.
export function PhoneRideScreen() {
  const route = 'M40 520 C 70 470 150 470 160 400 S 120 300 190 250 S 300 200 260 120'
  return (
    <div className="pscr">
      <div className="pscr__map">
        <svg viewBox="0 0 320 640" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="640" fill="#e8f3ee" />
          <path d="M0 330 Q 120 300 200 360 T 320 330" stroke="#cfe6da" strokeWidth="40" fill="none" />
          <g stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round">
            <path d="M0 180 H320" />
            <path d="M0 470 H320" />
            <path d="M90 0 V640" />
            <path d="M230 0 V640" />
            <path d="M0 40 L 320 600" opacity=".8" />
          </g>
          <rect x="245" y="390" width="60" height="60" rx="10" fill="#d4ecdf" />
          <rect x="110" y="70" width="90" height="50" rx="10" fill="#d4ecdf" />
          <path className="scr__route" pathLength="1" d={route} stroke="#058875" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="520" r="12" fill="#02ca96" stroke="#fff" strokeWidth="5" />
          <circle cx="260" cy="120" r="12" fill="#0a392c" stroke="#fff" strokeWidth="5" />
          <g>
            <circle r="15" fill="#fff" />
            <circle r="9" fill="#058875" />
            <animateMotion dur="6s" repeatCount="indefinite" path={route} />
          </g>
        </svg>
      </div>
      <div className="pscr__top">
        <span className="pscr__menu" />
        <div>
          <small>Pickup</small>
          <strong>Colombo Fort</strong>
        </div>
      </div>
      <div className="pscr__sheet">
        <span className="pscr__grab" />
        <div className="pscr__driver">
          <span className="scr__avatar" />
          <div>
            <strong>Driver arriving</strong>
            <small>Toyota Prius · 3 min</small>
          </div>
          <em>4.9 ★</em>
        </div>
        <div className="pscr__trip">
          <p>
            <i />
            Colombo Fort
          </p>
          <p>
            <i className="is-end" />
            Galle Face Green
          </p>
        </div>
        <span className="pscr__btn">Track ride</span>
      </div>
    </div>
  )
}
