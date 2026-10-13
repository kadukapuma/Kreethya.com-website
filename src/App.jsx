import { useEffect, useRef, useState } from 'react'
import KLoader from './components/KLoader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Work from './components/Work'
import Stats from './components/Stats'
import Process from './components/Process'
import Tech from './components/Tech'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Mascot from './components/Mascot'
import useReveal from './hooks/useReveal'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  // the intro screen has started to come off, so the page's entrance animations can play
  const [revealed, setRevealed] = useState(false)
  // One robot for the whole visit: the intro's ball turns into it, it pulls the
  // intro screen away like a curtain, then flies to its spot on the page.
  const robot = useRef({
    pose: 'idle', move: 0, face: 0, jumpReq: false, hidden: true, ready: false, intro: null, jetpack: 1,
    curtainPull: null,
  })

  // Keep the page from scrolling behind the intro screen
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  // Sections emerge as they scroll into view (as soon as the intro screen starts coming off)
  useReveal(revealed)

  return (
    <>
      {loading && <KLoader robot={robot} onReveal={() => setRevealed(true)} onFinish={() => setLoading(false)} />}
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Work />
        <Stats />
        <Process />
        <Tech />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Mascot control={robot} intro={loading} />
    </>
  )
}

export default App
