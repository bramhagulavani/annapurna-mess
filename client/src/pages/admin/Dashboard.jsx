import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0,
    todayLunch: 0, todayDinner: 0, expiringSubscriptions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data.stats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const statCards = [
    { label: 'Lunch Today', value: stats.todayLunch, icon: '🥗', color: 'from-green-600 to-emerald-500', shadow: 'shadow-green-500/25', sub: 'students marked lunch' },
    { label: 'Dinner Today', value: stats.todayDinner, icon: '🍱', color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/25', sub: 'students marked dinner' },
    { label: 'Total Students', value: stats.totalStudents, icon: '👥', color: 'from-blue-600 to-indigo-500', shadow: 'shadow-blue-500/25', sub: 'registered students' },
    { label: 'Active Students', value: stats.activeStudents, icon: '✅', color: 'from-teal-600 to-cyan-500', shadow: 'shadow-teal-500/25', sub: 'with active plans' },
  ]

  const actions = [
    { icon: '👨‍🎓', label: 'Manage Students', sub: 'Add, edit & assign plans', path: '/admin/students', color: 'bg-green-50 border-green-100 hover:border-green-300' },
    { icon: '📋', label: "Today's List", sub: 'View who came today', path: '/admin/attendance', color: 'bg-amber-50 border-amber-100 hover:border-amber-300' },
    { icon: '📊', label: 'Monthly Report', sub: 'Full attendance summary', path: '/admin/reports', color: 'bg-blue-50 border-blue-100 hover:border-blue-300' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Navbar */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">🍛</div>
            <span className="text-white font-bold text-sm">Annapurna Mess</span>
            <span className="hidden sm:block text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
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
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-emerald-400/8 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          </div>
          <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Live Dashboard</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-white/35 text-sm">{today}</p>
            </div>
            {stats.expiringSubscriptions > 0 && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl">
                <span className="text-xl">⚠️</span>
                <div>
                  <div className="text-amber-400 text-sm font-bold">{stats.expiringSubscriptions} expiring soon</div>
                  <div className="text-amber-400/60 text-xs">Subscriptions low on meals</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Today's Overview</div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg ${card.shadow} flex items-center justify-center text-xl mb-4`}>
                  {card.icon}
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{card.value}</div>
                <div className="text-xs font-bold text-gray-700">{card.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} border-2 rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group`}
            >
              <div className="text-3xl mb-4">{action.icon}</div>
              <div className="text-sm font-black text-gray-900 mb-1">{action.label}</div>
              <div className="text-xs text-gray-400">{action.sub}</div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">
                Open
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
      <footer className="mt-12 py-6 text-center border-t border-gray-100">
  <p className="text-xs text-gray-300">
    Crafted with ❤️ by <span className="font-bold text-green-600">Bramha Gulavani</span> &amp; the <span className="font-bold text-green-600">Annapurna Team</span>
  </p>
</footer>
    </div>
  )
}

export default Dashboard