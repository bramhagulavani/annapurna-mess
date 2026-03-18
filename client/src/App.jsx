import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import StudentHome from './pages/student/Home'
import AdminDashboard from './pages/admin/Dashboard'

// Protected Route — login nahi hai toh login page pe bhejo
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
      {/* Default redirect */}
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

      {/* Student Routes */}
      <Route
        path="/student/home"
        element={
          <ProtectedRoute role="student">
            <StudentHome />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
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