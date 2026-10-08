import { useEffect, useState } from 'react'
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

  // Keep the page from scrolling behind the intro screen
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  // Sections emerge as they scroll into view (after the intro has finished)
  useReveal(!loading)

  return (
    <>
      {loading && <KLoader onFinish={() => setLoading(false)} />}
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
      {!loading && <Mascot />}
    </>
  )
}

export default App
