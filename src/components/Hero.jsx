function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__content">
          <span className="eyebrow">Software Engineering Partner</span>
          <h1>
            We build software that
            <span className="text-gradient"> moves your business forward</span>
          </h1>
          <p className="hero__lede">
            Kreethya designs, builds, and scales web, mobile, and cloud products for
            startups and enterprises alike — from first prototype to production at scale.
          </p>
          <div className="hero__actions">
            <a href="#contact" className="btn btn--primary">Start a project</a>
            <a href="#services" className="btn btn--ghost">Explore services</a>
          </div>
          <div className="hero__trust">
            <div className="hero__stat">
              <strong>50+</strong>
              <span>Projects delivered</span>
            </div>
            <div className="hero__stat">
              <strong>30+</strong>
              <span>Happy clients</span>
            </div>
            <div className="hero__stat">
              <strong>24/7</strong>
              <span>Support &amp; maintenance</span>
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="code-card">
            <div className="code-card__bar">
              <span /><span /><span />
            </div>
            <div className="code-card__body">
              <p><span className="tok-kw">const</span> <span className="tok-var">company</span> = &#123;</p>
              <p className="indent"><span className="tok-key">name</span>: <span className="tok-str">'Kreethya'</span>,</p>
              <p className="indent"><span className="tok-key">builds</span>: [<span className="tok-str">'web'</span>, <span className="tok-str">'mobile'</span>, <span className="tok-str">'cloud'</span>],</p>
              <p className="indent"><span className="tok-key">quality</span>: <span className="tok-str">'production-ready'</span>,</p>
              <p>&#125;</p>
            </div>
          </div>
          <div className="floating-chip floating-chip--1">✓ Ship faster</div>
          <div className="floating-chip floating-chip--2">⚡ Scalable</div>
        </div>
      </div>
    </section>
  )
}

export default Hero
