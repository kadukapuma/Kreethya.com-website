import { useState } from 'react'

function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="section">
      <div className="contact">
        <div className="contact__info">
          <span className="eyebrow">Get in touch</span>
          <h2>Let's build something great together</h2>
          <p>
            Tell us about your project and we'll get back to you within one business
            day with next steps.
          </p>

          <ul className="contact__list">
            <li>
              <span className="contact__icon">✉️</span>
              <div>
                <strong>Email</strong>
                <span>hello@kreethya.com</span>
              </div>
            </li>
            <li>
              <span className="contact__icon">📞</span>
              <div>
                <strong>Phone</strong>
                <span>+1 (555) 010-2030</span>
              </div>
            </li>
            <li>
              <span className="contact__icon">📍</span>
              <div>
                <strong>Office</strong>
                <span>Remote-first, serving clients worldwide</span>
              </div>
            </li>
          </ul>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="contact__success">
              <h3>Thanks, {form.name.split(' ')[0] || 'there'}! 🎉</h3>
              <p>Your message has been received. We'll be in touch shortly.</p>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                />
              </div>
              <button type="submit" className="btn btn--primary btn--block">
                Send message
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

export default Contact
