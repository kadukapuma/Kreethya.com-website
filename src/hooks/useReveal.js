import { useEffect } from 'react'

// Adds `is-in` to every [data-reveal] element while it is on screen, and takes
// it away again when it leaves, so blocks re-emerge when you scroll back up.
export default function useReveal(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const els = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-in', entry.isIntersecting)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [enabled])
}
