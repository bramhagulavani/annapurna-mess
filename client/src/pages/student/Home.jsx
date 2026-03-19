import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const Home = () => {
  const { user, logout } = useAuth()
  const [todayStatus, setTodayStatus] = useState({ lunch: null, dinner: null })
  const [remaining, setRemaining] = useState({ lunch: 0, dinner: 0, planType: null })
  const [loading, setLoading] = useState({ lunch: false, dinner: false })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchTodayStatus() }, [])

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today')
      setTodayStatus(res.data.status)
      setRemaining({
        lunch: res.data.remainingLunchMeals,
        dinner: res.data.remainingDinnerMeals,
        planType: res.data.planType,
      })
    } catch (err) { console.error(err) }
  }

  const markAttendance = async (meal) => {
    setMessage('')
    setError('')
    setLoading((p) => ({ ...p, [meal]: true }))
    try {
      const res = await api.post('/attendance/mark', { meal })
      setMessage(res.data.message)
      fetchTodayStatus()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading((p) => ({ ...p, [meal]: false }))
    }
  }

  const canMark = (meal) => {
    if (!remaining.planType) return false
    if (remaining.planType === 'lunch-only' && meal === 'dinner') return false
    if (remaining.planType === 'dinner-only' && meal === 'lunch') return false
    return true
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good Morning', emoji: '☀️' }
    if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
    return { text: 'Good Evening', emoji: '🌙' }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const greeting = getGreeting()

  const totalMeals = (remaining.planType === 'both')
    ? remaining.lunch + remaining.dinner
    : remaining.planType === 'lunch-only' ? remaining.lunch : remaining.dinner

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* ── Navbar ── */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-base">🍛</div>
            <span className="text-white font-bold text-sm tracking-tight">Annapurna Mess</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-green-500/30">
              {getInitials(user?.name)}
            </div>
            <span className="text-white/60 text-xs hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-xs text-white/40 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/8 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          </div>
          <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{greeting.emoji}</span>
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">{greeting.text}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-white/35 text-sm">{today}</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="text-white/40 text-xs">Roll No.</span>
                <span className="text-white/80 text-xs font-bold">#{user?.rollNumber}</span>
              </div>
            </div>

            {/* Meal count pill */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-black text-white">{totalMeals}</div>
                <div className="text-white/30 text-xs mt-0.5">Meals left</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-black text-green-400">
                  {remaining.planType === 'both' ? '2x' : '1x'}
                </div>
                <div className="text-white/30 text-xs mt-0.5">Per day</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toasts ── */}
        {message && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm font-medium mb-6 shadow-sm">
            <span className="text-base">✅</span> {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium mb-6 shadow-sm">
            <span className="text-base">⚠️</span> {error}
          </div>
        )}

        {/* ── Meal Cards ── */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Mark Today's Meals</h2>
          <span className="text-[11px] text-gray-300">Tap to mark your attendance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          {/* Lunch Card */}
          <div className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
            todayStatus.lunch
              ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-gray-100 bg-white hover:border-green-200 hover:shadow-lg hover:shadow-green-500/8'
          }`}>
            {todayStatus.lunch && (
              <div className="absolute top-4 right-4 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="p-7">
              <div className="text-5xl mb-5">🥗</div>
              <div className="text-xl font-black text-gray-900 mb-1">Lunch</div>
              <div className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                Served 12:00 – 2:00 PM
              </div>

              {todayStatus.lunch ? (
                <div className="w-full py-3 bg-green-100 text-green-700 rounded-2xl text-sm font-bold text-center">
                  ✅ Marked for today
                </div>
              ) : !canMark('lunch') ? (
                <div className="w-full py-3 bg-gray-50 text-gray-300 rounded-2xl text-sm font-medium text-center border border-gray-100">
                  Not in your plan
                </div>
              ) : (
                <button
                  onClick={() => markAttendance('lunch')}
                  disabled={loading.lunch}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading.lunch ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Marking...
                    </span>
                  ) : 'Mark Lunch →'}
                </button>
              )}

              {canMark('lunch') && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="text-xs text-gray-300">Remaining</span>
                  <span className="text-xs font-bold text-gray-500">{remaining.lunch} meals</span>
                </div>
              )}
            </div>
          </div>

          {/* Dinner Card */}
          <div className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
            todayStatus.dinner
              ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
              : 'border-gray-100 bg-white hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/8'
          }`}>
            {todayStatus.dinner && (
              <div className="absolute top-4 right-4 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="p-7">
              <div className="text-5xl mb-5">🍱</div>
              <div className="text-xl font-black text-gray-900 mb-1">Dinner</div>
              <div className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                Served 7:00 – 9:00 PM
              </div>

              {todayStatus.dinner ? (
                <div className="w-full py-3 bg-amber-100 text-amber-700 rounded-2xl text-sm font-bold text-center">
                  ✅ Marked for today
                </div>
              ) : !canMark('dinner') ? (
                <div className="w-full py-3 bg-gray-50 text-gray-300 rounded-2xl text-sm font-medium text-center border border-gray-100">
                  Not in your plan
                </div>
              ) : (
                <button
                  onClick={() => markAttendance('dinner')}
                  disabled={loading.dinner}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 text-white text-sm font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading.dinner ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Marking...
                    </span>
                  ) : 'Mark Dinner →'}
                </button>
              )}

              {canMark('dinner') && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="text-xs text-gray-300">Remaining</span>
                  <span className="text-xs font-bold text-gray-500">{remaining.dinner} meals</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Plan Info ── */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">Your Plan</div>
              <div className="text-xs text-gray-400 mt-0.5 capitalize">
                {remaining.planType === 'both' ? 'Lunch + Dinner' : remaining.planType === 'lunch-only' ? 'Lunch Only' : remaining.planType === 'dinner-only' ? 'Dinner Only' : 'No active plan'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              totalMeals > 10
                ? 'bg-green-100 text-green-700'
                : totalMeals > 5
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {totalMeals > 0 ? `${totalMeals} meals left` : 'Plan expired'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home