import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import TrainersPage from './pages/TrainersPage'
import TrainerPage from './pages/TrainerPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import TrainerDashboardPage from './pages/TrainerDashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSectionPage from './pages/ProfileSectionPage'
import TermsPage from './pages/TermsPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage'

import TrainingCenterPage from './pages/TrainingCenterPage'
import TrainingPlanPage from './pages/TrainingPlanPage'
import TrainingProgressPage from './pages/TrainingProgressPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage'

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

        {/* =====================================
            PUBLIC LAYOUT
        ===================================== */}

        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/trainers"
            element={<TrainersPage />}
          />

          <Route path="/training-center">
          <Route
            index
            element={<TrainingCenterPage />}
          />
          <Route
            path="plan"
            element={<TrainingPlanPage />}
          />
          <Route
            path="progress"
            element={<TrainingProgressPage />}
          />
          <Route
            path="workout/:id"
            element={<WorkoutSessionPage />}
          />
        </Route>

          <Route
            path="/trainers/:id"
            element={<TrainerPage />}
          />

          <Route
            path="/trainers/:id/report"
            element={<ReportPage />}
          />

          <Route
            path="/regulamin"
            element={<TermsPage />}
          />

        </Route>

        {/* =====================================
            AUTH
        ===================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/email-verification"
          element={<EmailVerificationPage />}
        />

        <Route
          path="/verify-email"
          element={<EmailVerificationPage />}
        />

        <Route
          path="/auth/google/callback"
          element={<GoogleCallbackPage />}
        />

        {/* =====================================
            DASHBOARD
        ===================================== */}

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* Training Center routes are declared inside PublicLayout above. */}

        {/* =====================================
            TRAINER
        ===================================== */}

        <Route
          path="/trainer/dashboard"
          element={<TrainerDashboardPage />}
        />

        {/* =====================================
            PROFILE
        ===================================== */}

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/profile/:section"
          element={<ProfileSectionPage />}
        />

        {/* =====================================
            SETTINGS
        ===================================== */}

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App