import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const Students = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddSub, setShowAddSub] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Add Student Form
  const [studentForm, setStudentForm] = useState({
    name: '', rollNumber: '', email: '', password: '', phone: ''
  })

  // Subscription Form
  const [subForm, setSubForm] = useState({
    planType: 'both', totalMeals: 30, mealPrice: 3000, startDate: '', notes: ''
  })

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/admin/students${search ? `?search=${search}` : ''}`)
      setStudents(res.data.students)
    } catch (err) {
      setError('Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchStudents()
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/admin/students', studentForm)
      setMessage('Student added successfully!')
      setShowAddStudent(false)
      setStudentForm({ name: '', rollNumber: '', email: '', password: '', phone: '' })
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.')
    }
  }

  const handleAddSubscription = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/admin/subscriptions', {
        ...subForm,
        studentId: selectedStudent._id,
      })
      setMessage(`Subscription added for ${selectedStudent.name}!`)
      setShowAddSub(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subscription.')
    }
  }

  const handlePlanChange = (planType) => {
    setSubForm({
      ...subForm,
      planType,
      mealPrice: planType === 'both' ? 3000 : 1500,
    })
  }

  const getPlanBadge = (sub) => {
    if (!sub) return <span style={styles.badgeGray}>No Plan</span>
    if (sub.planType === 'both') return <span style={styles.badgeGreen}>Lunch + Dinner</span>
    if (sub.planType === 'lunch-only') return <span style={styles.badgeBlue}>Lunch Only</span>
    return <span style={styles.badgeOrange}>Dinner Only</span>
  }

  const getRemainingMeals = (sub) => {
    if (!sub) return '—'
    if (sub.planType === 'both')
      return `🥗 ${sub.remainingLunchMeals} / 🍱 ${sub.remainingDinnerMeals}`
    if (sub.planType === 'lunch-only') return `🥗 ${sub.remainingLunchMeals}`
    return `🍱 ${sub.remainingDinnerMeals}`
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>← Back</button>
          <span style={styles.navTitle}>👨‍🎓 Manage Students</span>
        </div>
        <button onClick={() => { setShowAddStudent(true); setMessage(''); setError('') }} style={styles.addBtn}>
          + Add Student
        </button>
      </div>

      <div style={styles.main}>
        {/* Messages */}
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>Search</button>
          <button type="button" onClick={() => { setSearch(''); fetchStudents() }} style={styles.clearBtn}>Clear</button>
        </form>

        {/* Table */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading...</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No students found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Roll No.</th>
                  <th style={styles.th}>Plan</th>
                  <th style={styles.th}>Meals Left</th>
                  <th style={styles.th}>Today Lunch</th>
                  <th style={styles.th}>Today Dinner</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={styles.td}>
                      <div style={styles.studentName}>{s.name}</div>
                      <div style={styles.studentEmail}>{s.email}</div>
                    </td>
                    <td style={styles.td}>{s.rollNumber}</td>
                    <td style={styles.td}>{getPlanBadge(s.subscription)}</td>
                    <td style={styles.td}>{getRemainingMeals(s.subscription)}</td>
                    <td style={styles.td}>
                      <span style={s.todayLunch === 'present' ? styles.present : styles.absent}>
                        {s.todayLunch === 'present' ? '✅' : '❌'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={s.todayDinner === 'present' ? styles.present : styles.absent}>
                        {s.todayDinner === 'present' ? '✅' : '❌'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => { setSelectedStudent(s); setShowAddSub(true); setMessage(''); setError('') }}
                        style={styles.subBtn}
                      >
                        {s.subscription ? 'Renew' : 'Add Plan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Add New Student</h3>
            {error && <div style={styles.errorBox}>{error}</div>}
            <form onSubmit={handleAddStudent} style={styles.form}>
              <input placeholder="Full Name *" value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                style={styles.input} required />
              <input placeholder="Roll Number *" value={studentForm.rollNumber}
                onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                style={styles.input} required />
              <input placeholder="Email *" type="email" value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                style={styles.input} required />
              <input placeholder="Password *" type="password" value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                style={styles.input} required />
              <input placeholder="Phone (optional)" value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                style={styles.input} />
              <div style={styles.modalBtns}>
                <button type="button" onClick={() => setShowAddStudent(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddSub && selectedStudent && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {selectedStudent.subscription ? 'Renew' : 'Add'} Plan — {selectedStudent.name}
            </h3>
            {error && <div style={styles.errorBox}>{error}</div>}
            <form onSubmit={handleAddSubscription} style={styles.form}>

              {/* Plan Type */}
              <label style={styles.label}>Select Plan</label>
              <div style={styles.planRow}>
                {['lunch-only', 'dinner-only', 'both'].map((plan) => (
                  <div
                    key={plan}
                    onClick={() => handlePlanChange(plan)}
                    style={{
                      ...styles.planCard,
                      border: subForm.planType === plan ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      backgroundColor: subForm.planType === plan ? '#f0fdf4' : '#fff',
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>
                      {plan === 'lunch-only' ? '🥗' : plan === 'dinner-only' ? '🍱' : '🥗🍱'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '6px' }}>
                      {plan === 'lunch-only' ? 'Lunch Only' : plan === 'dinner-only' ? 'Dinner Only' : 'Both'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                      ₹{plan === 'both' ? '3000' : '1500'}
                    </div>
                  </div>
                ))}
              </div>

              <label style={styles.label}>Total Meals</label>
              <input
                type="number" value={subForm.totalMeals} min="1" max="60"
                onChange={(e) => setSubForm({ ...subForm, totalMeals: parseInt(e.target.value) })}
                style={styles.input}
              />

              <label style={styles.label}>Start Date</label>
              <input
                type="date" value={subForm.startDate} required
                onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                style={styles.input}
              />

              <label style={styles.label}>Notes (optional)</label>
              <input
                placeholder="e.g. Paid in cash"
                value={subForm.notes}
                onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                style={styles.input}
              />

              <div style={styles.priceTag}>
                Total: ₹{subForm.mealPrice}
              </div>

              <div style={styles.modalBtns}>
                <button type="button" onClick={() => { setShowAddSub(false); setSelectedStudent(null) }} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Confirm Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  navbar: {
    backgroundColor: '#14532d', padding: '14px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    backgroundColor: 'transparent', border: '1px solid #dcfce7',
    color: '#dcfce7', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
  },
  navTitle: { color: '#fff', fontSize: '18px', fontWeight: '700' },
  addBtn: {
    backgroundColor: '#16a34a', color: '#fff', border: 'none',
    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
  },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  success: {
    backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
    padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '14px',
  },
  errorBox: {
    backgroundColor: '#fef2f2', color: '#dc2626',
    padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '14px',
  },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  searchInput: {
    flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  searchBtn: {
    backgroundColor: '#16a34a', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
  },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  thead: { backgroundColor: '#14532d' },
  th: { padding: '14px 16px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: '600' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f3f4f6' },
  studentName: { fontWeight: '600', color: '#111827' },
  studentEmail: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  badgeGray: { backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' },
  badgeGreen: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' },
  badgeBlue: { backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' },
  badgeOrange: { backgroundColor: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' },
  present: { fontSize: '18px' },
  absent: { fontSize: '18px' },
  subBtn: {
    backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#14532d', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '10px 14px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  planRow: { display: 'flex', gap: '10px' },
  planCard: {
    flex: 1, padding: '14px 10px', borderRadius: '10px', textAlign: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  priceTag: {
    backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px',
    borderRadius: '8px', textAlign: 'center', fontWeight: '700', fontSize: '16px',
  },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    flex: 1, padding: '11px', backgroundColor: '#f3f4f6', color: '#374151',
    border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  submitBtn: {
    flex: 1, padding: '11px', backgroundColor: '#16a34a', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
}

export default Students