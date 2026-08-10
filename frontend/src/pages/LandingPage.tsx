import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import ForClients from '../components/ForClients'
import ForTrainers from '../components/ForTrainers'
import AppPreview from '../components/AppPreview'

function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ForClients />
        <ForTrainers />
        <AppPreview />
      </main>
    </>
  )
}

export default LandingPage