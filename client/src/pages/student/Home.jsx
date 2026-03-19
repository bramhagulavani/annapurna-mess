import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const MENU = {
  Monday:    { lunch: 'Dal Rice • Sabzi • Roti • Salad',       dinner: 'Paneer Curry • Rice • Roti • Raita' },
  Tuesday:   { lunch: 'Rajma Rice • Roti • Papad • Pickle',    dinner: 'Chole • Bhature • Salad • Lassi' },
  Wednesday: { lunch: 'Kadhi Rice • Roti • Sabzi • Salad',     dinner: 'Mix Veg • Rice • Roti • Buttermilk' },
  Thursday:  { lunch: 'Sambar Rice • Roti • Fry • Papad',      dinner: 'Dal Makhani • Roti • Rice • Salad' },
  Friday:    { lunch: 'Pulao • Raita • Roti • Sabzi',          dinner: 'Shahi Paneer • Roti • Rice • Sweet' },
  Saturday:  { lunch: 'Biryani • Raita • Salad • Papad',       dinner: 'Dal Fry • Rice • Roti • Kheer' },
  Sunday:    { lunch: 'Special Thali • Sweet • Salad • Lassi', dinner: 'Pav Bhaji • Salad • Rice • Roti' },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TIMINGS = [
  { meal: 'Breakfast', icon: '🌅', time: '7:00 – 9:00 AM', color: 'from-orange-400 to-amber-300' },
  { meal: 'Lunch',     icon: '🥗', time: '12:00 – 2:00 PM', color: 'from-green-500 to-emerald-400' },
  { meal: 'Snacks',    icon: '☕', time: '4:30 – 5:30 PM',  color: 'from-yellow-400 to-amber-300' },
  { meal: 'Dinner',    icon: '🍱', time: '7:00 – 9:00 PM',  color: 'from-indigo-500 to-purple-400' },
]

const NOTICES = [
  { icon: '📢', text: 'Sunday special thali — must mark by 10 AM', date: 'This week' },
  { icon: '🚫', text: 'Mess closed on 26th March (Holi)', date: 'Upcoming' },
  { icon: '✅', text: 'New menu starting from April 1st', date: 'Upcoming' },
]

const Footer = () => (
  <footer className="mt-16 border-t border-gray-100 py-8 text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      <span className="text-xl">🍛</span>
      <span className="font-black text-gray-700 text-sm">Annapurna Mess</span>
    </div>
    <p className="text-xs text-gray-400">
      Crafted with ❤️ by <span className="font-bold text-green-600">Bramha Gulavani</span> &amp; the <span className="font-bold text-green-600">Annapurna Team</span>
    </p>
    <p className="text-[10px] text-gray-300 mt-1">© {new Date().getFullYear()} Annapurna Mess · All rights reserved</p>
  </footer>
)

const Home = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [todayStatus, setTodayStatus] = useState({ lunch: null, dinner: null })
  const [remaining, setRemaining] = useState({ lunch: 0, dinner: 0, planType: null })
  const [loading, setLoading] = useState({ lunch: false, dinner: false })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('home')
  const [activeDay, setActiveDay] = useState(() => {
    return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  })
  const [contactForm, setContactForm] = useState({ name: user?.name || '', message: '' })
  const [contactSent, setContactSent] = useState(false)

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
    setMessage(''); setError('')
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

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const todayDay = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const greeting = getGreeting()
  const totalMeals = remaining.planType === 'both'
    ? remaining.lunch + remaining.dinner
    : remaining.planType === 'lunch-only' ? remaining.lunch : remaining.dinner

  const navItems = [
  { key: 'home',    icon: '🏠', label: 'Home',    external: false },
  { key: 'history', icon: '📅', label: 'History', external: true },
  { key: 'menu',    icon: '🍽️', label: 'Menu',    external: false },
  { key: 'timings', icon: '⏰', label: 'Timings', external: false },
  { key: 'about',   icon: 'ℹ️', label: 'About',   external: false },
  { key: 'contact', icon: '📞', label: 'Contact', external: false },
]

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Navbar */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">🍛</div>
            <span className="text-white font-bold text-sm">Annapurna Mess</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => item.external ? navigate('/student/history') : setActiveSection(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === item.key
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-green-500/30">
              {getInitials(user?.name)}
            </div>
            <span className="text-white/60 text-xs hidden sm:block">{user?.name}</span>
            <button onClick={logout} className="text-xs text-white/40 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => item.external ? navigate('/student/history') : setActiveSection(item.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === item.key
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-white/40'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ══════════ HOME SECTION ══════════ */}
        {activeSection === 'home' && (
          <>
            {/* Hero */}
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
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{user?.name?.split(' ')[0]}!</h1>
                  <p className="text-white/35 text-sm">{today}</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-white/40 text-xs">Roll No.</span>
                    <span className="text-white/80 text-xs font-bold">#{user?.rollNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{totalMeals}</div>
                    <div className="text-white/30 text-xs mt-0.5">Meals left</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <div className="text-lg font-black text-green-400">{remaining.planType === 'both' ? '2x' : '1x'}</div>
                    <div className="text-white/30 text-xs mt-0.5">Per day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toasts */}
            {message && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm font-medium mb-6 shadow-sm">
                <span>✅</span> {message}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl text-sm font-medium mb-6 shadow-sm">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Mark Meals */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Mark Today's Meals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {[
                { key: 'lunch', emoji: '🥗', label: 'Lunch', time: '12:00 – 2:00 PM', color: 'from-green-600 to-emerald-500', shadow: 'shadow-green-500/25', marked: 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50', markedBtn: 'bg-green-100 text-green-700', tick: 'bg-green-500 shadow-green-500/40', rem: remaining.lunch },
                { key: 'dinner', emoji: '🍱', label: 'Dinner', time: '7:00 – 9:00 PM', color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/25', marked: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50', markedBtn: 'bg-amber-100 text-amber-700', tick: 'bg-amber-500 shadow-amber-500/40', rem: remaining.dinner },
              ].map((meal) => (
                <div key={meal.key} className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 ${todayStatus[meal.key] ? meal.marked : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg'}`}>
                  {todayStatus[meal.key] && (
                    <div className={`absolute top-4 right-4 w-7 h-7 ${meal.tick} rounded-full flex items-center justify-center shadow-lg`}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="p-7">
                    <div className="text-5xl mb-5">{meal.emoji}</div>
                    <div className="text-xl font-black text-gray-900 mb-1">{meal.label}</div>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      {meal.time}
                    </div>
                    {/* Today's menu preview */}
                    <div className="text-xs text-gray-400 italic mb-5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      🍽️ {MENU[todayDay]?.[meal.key] || 'Menu not set'}
                    </div>
                    {todayStatus[meal.key] ? (
                      <div className={`w-full py-3 ${meal.markedBtn} rounded-2xl text-sm font-bold text-center`}>✅ Marked for today</div>
                    ) : !canMark(meal.key) ? (
                      <div className="w-full py-3 bg-gray-50 text-gray-300 rounded-2xl text-sm font-medium text-center border border-gray-100">Not in your plan</div>
                    ) : (
                      <button
                        onClick={() => markAttendance(meal.key)}
                        disabled={loading[meal.key]}
                        className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${meal.color} text-white text-sm font-bold shadow-lg ${meal.shadow} hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {loading[meal.key] ? '⏳ Marking...' : `Mark ${meal.label} →`}
                      </button>
                    )}
                    {canMark(meal.key) && (
                      <div className="mt-4 flex items-center justify-between px-1">
                        <span className="text-xs text-gray-300">Remaining</span>
                        <span className="text-xs font-bold text-gray-500">{meal.rem} meals</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notices */}
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">📢 Notices</div>
            <div className="flex flex-col gap-3 mb-8">
              {NOTICES.map((n, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm transition-all">
                  <span className="text-xl">{n.icon}</span>
                  <span className="text-sm text-gray-700 flex-1">{n.text}</span>
                  <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">{n.date}</span>
                </div>
              ))}
            </div>

            {/* Plan Info */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-xl">📋</div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Your Plan</div>
                  <div className="text-xs text-gray-400 mt-0.5 capitalize">
                    {remaining.planType === 'both' ? 'Lunch + Dinner' : remaining.planType === 'lunch-only' ? 'Lunch Only' : remaining.planType === 'dinner-only' ? 'Dinner Only' : 'No active plan'}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${totalMeals > 10 ? 'bg-green-100 text-green-700' : totalMeals > 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                {totalMeals > 0 ? `${totalMeals} meals left` : 'Plan expired'}
              </div>
            </div>
          </>
        )}

        {/* ══════════ MENU SECTION ══════════ */}
        {activeSection === 'menu' && (
          <>
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Weekly Menu</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-1">What's Cooking?</h1>
                <p className="text-white/35 text-sm">Full week menu — plan your meals ahead</p>
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    activeDay === day
                      ? 'bg-[#0a0f0a] text-white shadow-lg'
                      : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-200'
                  } ${day === todayDay ? 'ring-2 ring-green-500/30' : ''}`}
                >
                  {day === todayDay ? `${day.slice(0, 3)} ⭐` : day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { meal: 'lunch', icon: '🥗', label: 'Lunch', time: '12:00 – 2:00 PM', grad: 'from-green-600 to-emerald-500' },
                { meal: 'dinner', icon: '🍱', label: 'Dinner', time: '7:00 – 9:00 PM', grad: 'from-amber-500 to-orange-400' },
              ].map((m) => (
                <div key={m.meal} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className={`bg-gradient-to-r ${m.grad} p-5 flex items-center justify-between`}>
                    <div>
                      <div className="text-white font-black text-lg">{m.icon} {m.label}</div>
                      <div className="text-white/70 text-xs mt-0.5">{m.time}</div>
                    </div>
                    {activeDay === todayDay && (
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/30">TODAY</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {(MENU[activeDay]?.[m.meal] || '').split(' • ').map((item) => (
                        <span key={item} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-xl">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ TIMINGS SECTION ══════════ */}
        {activeSection === 'timings' && (
          <>
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Mess Timings</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-1">Daily Schedule</h1>
                <p className="text-white/35 text-sm">Never miss a meal — plan your day</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {TIMINGS.map((t) => {
                const now = new Date()
                const h = now.getHours()
                const m = now.getMinutes()
                const [start, end] = t.time.split(' – ').map(s => {
                  const [time, period] = s.split(' ')
                  let [hr, min] = time.split(':').map(Number)
                  if (period === 'PM' && hr !== 12) hr += 12
                  return hr * 60 + (min || 0)
                })
                const curr = h * 60 + m
                const isOpen = curr >= start && curr <= end
                const isSoon = curr < start && start - curr <= 60

                return (
                  <div key={t.meal} className={`bg-white rounded-3xl border-2 p-6 transition-all ${isOpen ? 'border-green-300 shadow-lg shadow-green-500/10' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl shadow-lg`}>
                        {t.icon}
                      </div>
                      {isOpen ? (
                        <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Open Now
                        </span>
                      ) : isSoon ? (
                        <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                          ⏰ Opening Soon
                        </span>
                      ) : (
                        <span className="bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                          Closed
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-gray-900 mb-1">{t.meal}</div>
                    <div className="text-2xl font-black text-gray-700 mb-1">{t.time}</div>
                    <div className="text-xs text-gray-400">Every day including weekends</div>
                  </div>
                )
              })}
            </div>

            {/* Rules */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">📌 Mess Rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Mark attendance before meal timing ends',
                  'No food wastage allowed',
                  'Carry your own plate on Sundays',
                  'Inform admin 1 day before leaving',
                  'No outside food in mess premises',
                  'Maintain cleanliness in dining hall',
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <span className="text-green-500 font-black text-xs">{String(i + 1).padStart(2, '0')}</span>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════ ABOUT SECTION ══════════ */}
        {activeSection === 'about' && (
          <>
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">About Us</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Annapurna Mess</h1>
                <p className="text-white/50 text-sm leading-relaxed max-w-xl">Serving wholesome, home-style meals to students since 2015. Our mission is simple — no student should go hungry.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { icon: '👨‍🍳', val: '10+', label: 'Years of Service' },
                { icon: '🍽️', val: '200+', label: 'Meals Daily' },
                { icon: '❤️', val: '500+', label: 'Happy Students' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-3xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <div className="text-3xl font-black text-gray-900">{s.val}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-5">
              <h3 className="text-lg font-black text-gray-900 mb-4">Our Story 📖</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Annapurna Mess was started with a simple vision — to provide students with nutritious, home-cooked meals at an affordable price. Named after the Hindu goddess of food and nourishment, we believe every student deserves to eat well.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Today, we serve hundreds of students daily with a rotating menu that ensures variety and nutrition. Our digital attendance system — built by our very own student <span className="font-bold text-green-600">Bramha Gulavani</span> — makes managing meals easier than ever.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: '🥦', title: 'Fresh Ingredients', desc: 'We source fresh vegetables daily from local markets' },
                { icon: '🏠', title: 'Home Style Cooking', desc: 'Traditional recipes cooked with love and care' },
                { icon: '💰', title: 'Affordable Pricing', desc: 'Quality meals at student-friendly prices' },
                { icon: '🔄', title: 'No Meal Wasted', desc: 'Our carry-forward system ensures you never lose a meal' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 mb-1">{f.title}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ CONTACT SECTION ══════════ */}
        {activeSection === 'contact' && (
          <>
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Contact Us</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-1">Get In Touch</h1>
                <p className="text-white/35 text-sm">Have a complaint, suggestion, or query? We're here!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { icon: '📍', label: 'Location', val: 'Mess Building, Campus Road, Pune' },
                { icon: '📞', label: 'Phone', val: '+91 98765 43210' },
                { icon: '🕐', label: 'Admin Hours', val: '9:00 AM – 6:00 PM' },
              ].map((c) => (
                <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-sm transition-all">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{c.label}</div>
                  <div className="text-sm font-bold text-gray-700">{c.val}</div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8">
              <h3 className="text-lg font-black text-gray-900 mb-6">Send a Message 💬</h3>
              {contactSent ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-xl font-black text-gray-900 mb-2">Message Sent!</div>
                  <div className="text-sm text-gray-400 mb-6">Admin will get back to you soon</div>
                  <button onClick={() => setContactSent(false)} className="px-6 py-3 bg-green-600 text-white rounded-2xl text-sm font-bold">Send Another</button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSent(true) }} className="flex flex-col gap-5">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</div>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Message</div>
                    <textarea
                      rows={4}
                      placeholder="Write your complaint, suggestion, or query here..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10 transition-all resize-none placeholder:text-gray-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Send Message →
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default Home