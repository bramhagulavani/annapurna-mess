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
  const [submitting, setSubmitting] = useState(false)

  const [studentForm, setStudentForm] = useState({
    name: '', rollNumber: '', email: '', password: '', phone: ''
  })
  const [subForm, setSubForm] = useState({
    planType: 'both', totalMeals: 30, mealPrice: 3000, startDate: '', notes: ''
  })

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async (q = search) => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/students${q ? `?search=${q}` : ''}`)
      setStudents(res.data.students)
    } catch { setError('Failed to load students.') }
    finally { setLoading(false) }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/admin/students', studentForm)
      setMessage(`${studentForm.name} added successfully!`)
      setShowAddStudent(false)
      setStudentForm({ name: '', rollNumber: '', email: '', password: '', phone: '' })
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.')
    } finally { setSubmitting(false) }
  }

  const handleAddSubscription = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/admin/subscriptions', { ...subForm, studentId: selectedStudent._id })
      setMessage(`Plan assigned to ${selectedStudent.name}!`)
      setShowAddSub(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign plan.')
    } finally { setSubmitting(false) }
  }

  const planBadge = (sub) => {
    if (!sub) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400 uppercase tracking-wide">No Plan</span>
    const map = {
      'both': { cls: 'bg-green-100 text-green-700', label: 'Lunch + Dinner' },
      'lunch-only': { cls: 'bg-blue-100 text-blue-700', label: 'Lunch Only' },
      'dinner-only': { cls: 'bg-amber-100 text-amber-700', label: 'Dinner Only' },
    }
    const { cls, label } = map[sub.planType] || {}
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${cls} uppercase tracking-wide`}>{label}</span>
  }

  const mealsLeft = (sub) => {
    if (!sub) return <span className="text-gray-300 text-xs">—</span>
    return (
      <div className="flex items-center gap-2 text-xs font-bold">
        {sub.planType !== 'dinner-only' && <span className="flex items-center gap-1 text-green-600">🥗 {sub.remainingLunchMeals}</span>}
        {sub.planType === 'both' && <span className="text-gray-200">/</span>}
        {sub.planType !== 'lunch-only' && <span className="flex items-center gap-1 text-amber-600">🍱 {sub.remainingDinnerMeals}</span>}
      </div>
    )
  }

  const plans = [
    { key: 'lunch-only', icon: '🥗', label: 'Lunch Only', price: 1500, desc: '30 lunch meals' },
    { key: 'dinner-only', icon: '🍱', label: 'Dinner Only', price: 1500, desc: '30 dinner meals' },
    { key: 'both', icon: '🍽️', label: 'Both Meals', price: 3000, desc: '30 lunch + 30 dinner' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Navbar */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm">👨‍🎓</div>
              <span className="text-white font-bold text-sm">Manage Students</span>
            </div>
          </div>
          <button
            onClick={() => { setShowAddStudent(true); setError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Toasts */}
        {message && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm font-medium mb-6 shadow-sm">
            <span>✅</span> {message}
            <button onClick={() => setMessage('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}
        {error && !showAddStudent && !showAddSub && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium mb-6">
            <span>⚠️</span> {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-sm text-gray-900 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/10 transition-all placeholder:text-gray-300"
            />
          </div>
          <button
            onClick={() => fetchStudents()}
            className="px-6 py-3 bg-[#0a0f0a] text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => { setSearch(''); fetchStudents('') }}
              className="px-4 py-3 bg-white border-2 border-gray-100 text-gray-400 text-sm rounded-2xl hover:border-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">👨‍🎓</div>
            <div className="text-gray-800 font-bold text-lg mb-2">No students found</div>
            <div className="text-gray-400 text-sm">Add your first student to get started</div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0a0f0a] text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <div className="col-span-3">Student</div>
              <div className="col-span-2">Roll No.</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-2">Meals Left</div>
              <div className="col-span-1 text-center">Lunch</div>
              <div className="col-span-1 text-center">Dinner</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {students.map((s) => (
                <div key={s._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors group">

                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/10 flex items-center justify-center text-xs font-black text-green-700 flex-shrink-0">
                      {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-none mb-1">{s.name}</div>
                      <div className="text-[10px] text-gray-400">{s.email}</div>
                    </div>
                  </div>

                  {/* Roll */}
                  <div className="col-span-2">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">#{s.rollNumber}</span>
                  </div>

                  {/* Plan */}
                  <div className="col-span-2">{planBadge(s.subscription)}</div>

                  {/* Meals */}
                  <div className="col-span-2">{mealsLeft(s.subscription)}</div>

                  {/* Today Lunch */}
                  <div className="col-span-1 text-center">
                    {s.subscription?.planType !== 'dinner-only' ? (
                      <div className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm ${s.todayLunch === 'present' ? 'bg-green-100' : 'bg-red-50'}`}>
                        {s.todayLunch === 'present' ? '✅' : '❌'}
                      </div>
                    ) : <span className="text-gray-200 text-xs">—</span>}
                  </div>

                  {/* Today Dinner */}
                  <div className="col-span-1 text-center">
                    {s.subscription?.planType !== 'lunch-only' ? (
                      <div className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm ${s.todayDinner === 'present' ? 'bg-amber-50' : 'bg-red-50'}`}>
                        {s.todayDinner === 'present' ? '✅' : '❌'}
                      </div>
                    ) : <span className="text-gray-200 text-xs">—</span>}
                  </div>

                  {/* Action */}
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => { setSelectedStudent(s); setShowAddSub(true); setError('') }}
                      className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 hover:border-green-300 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      {s.subscription ? 'Renew' : 'Add Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{students.length} student{students.length !== 1 ? 's' : ''} found</span>
              <span className="text-xs text-gray-300">Updated just now</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Student Modal ── */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a0f0a] px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-lg">Add New Student</h3>
                <p className="text-white/30 text-xs mt-0.5">Fill in the student details</p>
              </div>
              <button onClick={() => { setShowAddStudent(false); setError('') }} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors">✕</button>
            </div>
            <div className="p-8">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm mb-5">
                  ⚠️ {error}
                </div>
              )}
              <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                {[
                  { key: 'name', placeholder: 'Full Name *', type: 'text' },
                  { key: 'rollNumber', placeholder: 'Roll Number *', type: 'text' },
                  { key: 'email', placeholder: 'Email Address *', type: 'email' },
                  { key: 'password', placeholder: 'Password * (min 6 chars)', type: 'password' },
                  { key: 'phone', placeholder: 'Phone Number (optional)', type: 'tel' },
                ].map((f) => (
                  <input
                    key={f.key}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={studentForm[f.key]}
                    onChange={(e) => setStudentForm({ ...studentForm, [f.key]: e.target.value })}
                    required={!f.placeholder.includes('optional')}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all placeholder:text-gray-300"
                  />
                ))}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setShowAddStudent(false); setError('') }}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 text-sm font-bold hover:border-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {submitting ? 'Adding...' : 'Add Student →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Subscription Modal ── */}
      {showAddSub && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0a0f0a] px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-lg">{selectedStudent.subscription ? 'Renew' : 'Assign'} Plan</h3>
                <p className="text-white/30 text-xs mt-0.5">{selectedStudent.name} · #{selectedStudent.rollNumber}</p>
              </div>
              <button onClick={() => { setShowAddSub(false); setSelectedStudent(null); setError('') }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors">✕</button>
            </div>
            <div className="p-8">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm mb-5">
                  ⚠️ {error}
                </div>
              )}
              <form onSubmit={handleAddSubscription} className="flex flex-col gap-5">

                {/* Plan selector */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Plan</div>
                  <div className="grid grid-cols-3 gap-3">
                    {plans.map((p) => (
                      <div
                        key={p.key}
                        onClick={() => setSubForm({ ...subForm, planType: p.key, mealPrice: p.price })}
                        className={`cursor-pointer rounded-2xl p-4 text-center border-2 transition-all ${
                          subForm.planType === p.key
                            ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/10'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="text-2xl mb-2">{p.icon}</div>
                        <div className="text-[10px] font-black text-gray-700 leading-tight">{p.label}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{p.desc}</div>
                        <div className={`text-xs font-black mt-2 ${subForm.planType === p.key ? 'text-green-600' : 'text-gray-400'}`}>
                          ₹{p.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total meals */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Meals</div>
                  <input
                    type="number" value={subForm.totalMeals} min="1" max="60"
                    onChange={(e) => setSubForm({ ...subForm, totalMeals: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all"
                  />
                </div>

                {/* Start date */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Start Date</div>
                  <input
                    type="date" value={subForm.startDate} required
                    onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all"
                  />
                </div>

                {/* Notes */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes (optional)</div>
                  <input
                    type="text" placeholder="e.g. Paid in cash, half month..."
                    value={subForm.notes}
                    onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Price tag */}
                <div className="flex items-center justify-between bg-green-50 border border-green-100 px-5 py-4 rounded-2xl">
                  <span className="text-sm font-bold text-green-800">Total Amount</span>
                  <span className="text-2xl font-black text-green-600">₹{subForm.mealPrice}</span>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowAddSub(false); setSelectedStudent(null); setError('') }}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 text-sm font-bold hover:border-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {submitting ? 'Saving...' : 'Confirm Plan →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students