import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Process from './components/Process'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
