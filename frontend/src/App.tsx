import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import TrainersPage from './pages/TrainersPage'
import TrainerPage from './pages/TrainerPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import TrainerDashboardPage from './pages/TrainerDashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSectionPage from './pages/ProfileSectionPage'

import Navbar from './components/Navbar'
import Footer from './components/Footer'


function PublicLayout() {
  return (
    <>
      <Navbar />

      <Outlet />

      <Footer />
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/trainers/:id" element={<TrainerPage />} />
        </Route>

        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* CLIENT */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* TRAINER */}
        <Route
          path="/trainer/dashboard"
          element={<TrainerDashboardPage />}
        />

        {/* PROFILE */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/profile/:section"
          element={<ProfileSectionPage />}
        />

      </Routes>
    </BrowserRouter>
  )
}


export default App