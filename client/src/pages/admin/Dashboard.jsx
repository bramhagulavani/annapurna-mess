import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayLunch: 0,
    todayDinner: 0,
    expiringSubscriptions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data.stats)
    } catch (err) {
      console.error('Error fetching stats')
    } finally {
      setLoading(false)
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
        <span style={styles.navTitle}>🍛 Annapurna Mess — Admin</span>
        <div style={styles.navRight}>
          <span style={styles.navName}>👤 {user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.main}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Dashboard</h2>
          <p style={styles.dateText}>{today}</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
        ) : (
          <>
            {/* Today's Count */}
            <p style={styles.sectionLabel}>Today's Attendance</p>
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderTop: '4px solid #16a34a' }}>
                <div style={styles.statEmoji}>🥗</div>
                <div style={styles.statNumber}>{stats.todayLunch}</div>
                <div style={styles.statLabel}>Lunch Today</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #2563eb' }}>
                <div style={styles.statEmoji}>🍱</div>
                <div style={styles.statNumber}>{stats.todayDinner}</div>
                <div style={styles.statLabel}>Dinner Today</div>
              </div>
            </div>

            {/* Students Count */}
            <p style={styles.sectionLabel}>Students Overview</p>
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderTop: '4px solid #7c3aed' }}>
                <div style={styles.statEmoji}>👥</div>
                <div style={styles.statNumber}>{stats.totalStudents}</div>
                <div style={styles.statLabel}>Total Students</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #0891b2' }}>
                <div style={styles.statEmoji}>✅</div>
                <div style={styles.statNumber}>{stats.activeStudents}</div>
                <div style={styles.statLabel}>Active Students</div>
              </div>
            </div>

            {/* Expiring Warning */}
            {stats.expiringSubscriptions > 0 && (
              <div style={styles.warningCard}>
                ⚠️ {stats.expiringSubscriptions} subscription(s) expiring in next 7 days!
              </div>
            )}

            {/* Quick Actions */}
            <p style={styles.sectionLabel}>Quick Actions</p>
            <div style={styles.actionsGrid}>
              <button
                onClick={() => navigate('/admin/students')}
                style={styles.actionBtn}
              >
                <span style={styles.actionEmoji}>👨‍🎓</span>
                <span>Manage Students</span>
              </button>
              <button
                onClick={() => navigate('/admin/attendance')}
                style={styles.actionBtn}
              >
                <span style={styles.actionEmoji}>📋</span>
                <span>Today's Attendance</span>
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                style={styles.actionBtn}
              >
                <span style={styles.actionEmoji}>📊</span>
                <span>Monthly Report</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  navbar: {
    backgroundColor: '#14532d',
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
  main: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  pageHeader: { marginBottom: '24px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#14532d' },
  dateText: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    marginTop: '24px',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statEmoji: { fontSize: '32px', marginBottom: '8px' },
  statNumber: { fontSize: '36px', fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  warningCard: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    color: '#92400e',
    padding: '14px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    marginTop: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
  },
  actionBtn: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px 12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.2s',
  },
  actionEmoji: { fontSize: '28px' },
}

export default Dashboard