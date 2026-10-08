import { useState } from 'react'
import Icon from './Icon'

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
    <section id="contact" className="contact-wrap">
      <div className="contact" data-reveal="zoom">
        <div className="contact__waves" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="contact__info">
          <span className="eyebrow eyebrow--light">Let&rsquo;s build together</span>
          <h2>
            Ready to start your <span className="text-grad text-grad--light">next project?</span>
          </h2>
          <p>Tell us your idea. We reply within one business day.</p>
          <ul className="contact__list">
            <li>
              <a href="mailto:hello@kreethya.com">
                <Icon name="mail" size={20} />
                hello@kreethya.com
              </a>
            </li>
            <li>
              <a href="tel:+15550102030">
                <Icon name="call" size={20} />
                +1 (555) 010-2030
              </a>
            </li>
          </ul>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="contact__success">
              <span className="contact__tick">
                <Icon name="check" size={30} strokeWidth={2.4} />
              </span>
              <h3>Thanks, {form.name.split(' ')[0] || 'there'}!</h3>
              <p>We&rsquo;ll be in touch shortly.</p>
            </div>
          ) : (
            <>
              <div className="field">
                <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder=" " />
                <label htmlFor="name">Your name</label>
              </div>
              <div className="field">
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder=" " />
                <label htmlFor="email">Email</label>
              </div>
              <div className="field">
                <textarea id="message" name="message" rows="3" required value={form.message} onChange={handleChange} placeholder=" " />
                <label htmlFor="message">About your project</label>
              </div>
              <button type="submit" className="btn btn--light btn--block">
                Send message <Icon name="arrow" size={18} />
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

export default Contact
