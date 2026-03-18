import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const Home = () => {
  const { user, logout } = useAuth()
  const [todayStatus, setTodayStatus] = useState({ lunch: null, dinner: null })
  const [loading, setLoading] = useState({ lunch: false, dinner: false })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodayStatus()
  }, [])

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today')
      setTodayStatus(res.data.status)
    } catch (err) {
      console.error('Error fetching today status')
    }
  }

  const markAttendance = async (meal) => {
    setMessage('')
    setError('')
    setLoading((prev) => ({ ...prev, [meal]: true }))

    try {
      const res = await api.post('/attendance/mark', { meal })
      setMessage(res.data.message)
      fetchTodayStatus()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading((prev) => ({ ...prev, [meal]: false }))
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <span style={styles.navTitle}>🍛 Annapurna Mess</span>
        <div style={styles.navRight}>
          <span style={styles.navName}>👤 {user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <h2 style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
          <p style={styles.dateText}>{today}</p>
        </div>

        {/* Success / Error messages */}
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Attendance Cards */}
        <p style={styles.sectionTitle}>Mark Today's Attendance</p>
        <div style={styles.cardsRow}>

          {/* Lunch Card */}
          <div style={styles.mealCard}>
            <div style={styles.mealEmoji}>🥗</div>
            <h3 style={styles.mealTitle}>Lunch</h3>
            <p style={styles.mealTime}>Before 12:00 PM</p>
            {todayStatus.lunch ? (
              <div style={styles.markedBadge}>✅ Marked</div>
            ) : (
              <button
                onClick={() => markAttendance('lunch')}
                disabled={loading.lunch}
                style={{ ...styles.markBtn, opacity: loading.lunch ? 0.7 : 1 }}
              >
                {loading.lunch ? 'Marking...' : 'Mark Lunch'}
              </button>
            )}
          </div>

          {/* Dinner Card */}
          <div style={styles.mealCard}>
            <div style={styles.mealEmoji}>🍱</div>
            <h3 style={styles.mealTitle}>Dinner</h3>
            <p style={styles.mealTime}>Before 8:00 PM</p>
            {todayStatus.dinner ? (
              <div style={styles.markedBadge}>✅ Marked</div>
            ) : (
              <button
                onClick={() => markAttendance('dinner')}
                disabled={loading.dinner}
                style={{ ...styles.markBtn, opacity: loading.dinner ? 0.7 : 1 }}
              >
                {loading.dinner ? 'Marking...' : 'Mark Dinner'}
              </button>
            )}
          </div>
        </div>

        {/* Roll Number */}
        <div style={styles.infoCard}>
          <span style={styles.infoLabel}>Roll Number</span>
          <span style={styles.infoValue}>{user?.rollNumber}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0fdf4' },
  navbar: {
    backgroundColor: '#16a34a',
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navTitle: { color: '#fff', fontSize: '18px', fontWeight: '700' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navName: { color: '#dcfce7', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #dcfce7',
    color: '#dcfce7',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  main: { maxWidth: '600px', margin: '0 auto', padding: '24px 16px' },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  welcomeText: { fontSize: '20px', fontWeight: '700', color: '#14532d' },
  dateText: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    textAlign: 'center',
    border: '1px solid #bbf7d0',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
  },
  cardsRow: { display: 'flex', gap: '16px', marginBottom: '16px' },
  mealCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px 16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  mealEmoji: { fontSize: '40px', marginBottom: '10px' },
  mealTitle: { fontSize: '18px', fontWeight: '700', color: '#14532d' },
  mealTime: { fontSize: '12px', color: '#9ca3af', margin: '6px 0 16px' },
  markBtn: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  markedBadge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  infoLabel: { fontSize: '14px', color: '#6b7280' },
  infoValue: { fontSize: '14px', fontWeight: '600', color: '#14532d' },
}

export default Home