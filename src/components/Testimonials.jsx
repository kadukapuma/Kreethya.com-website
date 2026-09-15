const TESTIMONIALS = [
  {
    quote:
      'Kreethya rebuilt our platform in under three months and it has been rock solid since launch. Communication was clear every single week.',
    name: 'Priya Sharma',
    role: 'Product Manager, Fintech Startup',
  },
  {
    quote:
      "The team felt like an extension of ours, not an outside vendor. They caught issues we hadn't even thought to ask about.",
    name: 'Daniel Osei',
    role: 'CTO, Logistics SaaS',
  },
  {
    quote:
      'From design to deployment, everything was thoughtful and fast. Our app store ratings jumped after the redesign.',
    name: 'Meera Nair',
    role: 'Founder, Health & Wellness App',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="section section--alt">
      <div className="section__head">
        <span className="eyebrow">Client feedback</span>
        <h2>Trusted by teams who ship</h2>
      </div>

      <div className="grid grid--3">
        {TESTIMONIALS.map((t) => (
          <div className="testimonial-card" key={t.name}>
            <div className="testimonial-card__stars">★★★★★</div>
            <p>&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-card__author">
              <div className="avatar">{t.name.charAt(0)}</div>
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
