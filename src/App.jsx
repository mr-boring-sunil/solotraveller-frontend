import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }      from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import Navbar           from './components/Navbar'
import ThemeToggle      from './components/ThemeToggle'
import Login            from './pages/Login'
import Signup           from './pages/Signup'
import Questionnaire    from './pages/Questionnaire'
import Dashboard        from './pages/Dashboard'
import Itinerary        from './pages/Itinerary'
import Safety           from './pages/Safety'
import Profile          from './pages/Profile'

// Show a full-screen loader while checking saved token on mount
function AppLoader() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:12 }}>✈️</div>
        <div className="spinner-border" style={{ color:'var(--violet)', width:28, height:28, borderWidth:2 }} />
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AppLoader />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AppLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <TripProvider>
      <Navbar />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public — redirect to dashboard if already logged in */}
        <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected */}
        <Route path="/questionnaire" element={<PrivateRoute><Questionnaire /></PrivateRoute>} />
        <Route path="/dashboard"     element={<PrivateRoute><Dashboard     /></PrivateRoute>} />
        <Route path="/itinerary"     element={<PrivateRoute><Itinerary     /></PrivateRoute>} />
        <Route path="/safety"        element={<PrivateRoute><Safety        /></PrivateRoute>} />
        <Route path="/profile"       element={<PrivateRoute><Profile       /></PrivateRoute>} />
      </Routes>
    </TripProvider>
  )
}
