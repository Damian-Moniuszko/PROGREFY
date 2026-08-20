import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import TrainersPage from './pages/TrainersPage'
import TrainerPage from './pages/TrainerPage'
import DashboardPage from './pages/DashboardPage'
import TrainerDashboardPage from './pages/TrainerDashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSectionPage from './pages/ProfileSectionPage'
import TermsPage from './pages/TermsPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'

import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import EmailVerificationPage from './features/auth/pages/EmailVerificationPage'
import OAuthCallbackPage from './features/auth/pages/OAuthCallbackPage'

import TrainingCenterPage from './features/training/pages/TrainingCenterPage'
import TrainingPlanPage from './features/training/pages/TrainingPlanPage'
import TrainingProgressPage from './features/training/pages/TrainingProgressPage'
import WorkoutSessionPage from './features/training/pages/WorkoutSessionPage'

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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trainers" element={<TrainersPage />} />

          <Route path="/training-center">
            <Route index element={<TrainingCenterPage />} />
            <Route path="plan" element={<TrainingPlanPage />} />
            <Route path="progress" element={<TrainingProgressPage />} />
            <Route path="workout/:id" element={<WorkoutSessionPage />} />
          </Route>

          <Route path="/trainers/:id" element={<TrainerPage />} />
          <Route path="/trainers/:id/report" element={<ReportPage />} />
          <Route path="/regulamin" element={<TermsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trainer/dashboard" element={<TrainerDashboardPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:section" element={<ProfileSectionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App