import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import StudentHome from './pages/student/Home'
import AdminDashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Attendance from './pages/admin/Attendance'
import Reports from './pages/admin/Reports'
import History from './pages/student/History'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/login" />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          user
            ? user.role === 'admin'
              ? <Navigate to="/admin/dashboard" />
              : <Navigate to="/student/home" />
            : <Navigate to="/login" />
        }
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Student */}
      <Route path="/student/home" element={
        <ProtectedRoute role="student"><StudentHome /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute role="admin"><Students /></ProtectedRoute>
      } />
      <Route path="/admin/attendance" element={
        <ProtectedRoute role="admin"><Attendance /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
  <ProtectedRoute role="admin"><Reports /></ProtectedRoute>
} />
<Route path="/student/history" element={
  <ProtectedRoute role="student"><History /></ProtectedRoute>
} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App