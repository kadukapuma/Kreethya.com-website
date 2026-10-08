import logo from '../assets/kreethya-logo.webp'
import Icon from './Icon'

const YEAR = new Date().getFullYear()

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#process', label: 'Process' },
  { href: '#contact', label: 'Contact' },
]

const SOCIAL = [
  { icon: 'linkedin', label: 'LinkedIn' },
  { icon: 'facebook', label: 'Facebook' },
  { icon: 'instagram', label: 'Instagram' },
  { icon: 'github', label: 'GitHub' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand" data-reveal>
          <a href="#top" aria-label="Kreethya home">
            <img src={logo} alt="Kreethya" />
          </a>
          <p>Software that helps businesses grow.</p>
        </div>

        <nav className="footer__links" aria-label="Footer" data-reveal style={{ '--d': '100ms' }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="footer__social" data-reveal style={{ '--d': '200ms' }}>
          {SOCIAL.map((s) => (
            <a key={s.icon} href="#top" aria-label={s.label}>
              <Icon name={s.icon} size={20} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer__giant" aria-hidden="true" data-reveal>
        Kreethya
      </div>

      <div className="footer__bottom">
        <span>© {YEAR} Kreethya. All rights reserved.</span>
        <a href="mailto:hello@kreethya.com">hello@kreethya.com</a>
        <a href="#top" className="footer__top" aria-label="Back to top">
          <Icon name="arrowUp" size={20} />
        </a>
      </div>
    </footer>
  )
}

export default Footer
