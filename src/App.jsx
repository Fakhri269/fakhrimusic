import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AppPage from './pages/AppPage'
import { ProtectedRoute, PublicRoute } from './components/RouteGuards'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
