const YEAR = new Date().getFullYear()

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="#top" className="navbar__brand">
            <span className="navbar__mark">K</span>
            Kreethya
          </a>
          <p>Software engineering partner for startups and enterprises.</p>
          <div className="footer__social">
            <a href="#top" aria-label="LinkedIn">in</a>
            <a href="#top" aria-label="Twitter">𝕏</a>
            <a href="#top" aria-label="GitHub">gh</a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#process">Process</a>
          <a href="#testimonials">Testimonials</a>
        </div>

        <div className="footer__col">
          <h4>Services</h4>
          <a href="#services">Web Development</a>
          <a href="#services">Mobile Apps</a>
          <a href="#services">Cloud & DevOps</a>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          <a href="mailto:hello@kreethya.com">hello@kreethya.com</a>
          <a href="#contact">Start a project</a>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {YEAR} Kreethya. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
