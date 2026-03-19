import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const Attendance = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({ lunch: [], dinner: [], summary: { lunchCount: 0, dinnerCount: 0 } })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('lunch')

  useEffect(() => { fetchToday() }, [])

  const fetchToday = async () => {
    try {
      const res = await api.get('/admin/attendance/today')
      setData(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const activeList = activeTab === 'lunch' ? data.lunch : data.dinner

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Navbar */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm">📋</div>
              <span className="text-white font-bold text-sm">Today's Attendance</span>
            </div>
          </div>
          <button
            onClick={fetchToday}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl text-xs transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          </div>
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Live Today</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Attendance</h1>
            <p className="text-white/35 text-sm mb-6">{today}</p>

            {/* Summary Cards */}
            <div className="flex gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                <div className="text-3xl">🥗</div>
                <div>
                  <div className="text-3xl font-black text-white">{data.summary.lunchCount}</div>
                  <div className="text-white/30 text-xs mt-0.5">Lunch Today</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                <div className="text-3xl">🍱</div>
                <div>
                  <div className="text-3xl font-black text-white">{data.summary.dinnerCount}</div>
                  <div className="text-white/30 text-xs mt-0.5">Dinner Today</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                <div className="text-3xl">👥</div>
                <div>
                  <div className="text-3xl font-black text-white">
                    {data.summary.lunchCount + data.summary.dinnerCount}
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">Total Meals</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
          {[
            { key: 'lunch', icon: '🥗', label: 'Lunch', count: data.summary.lunchCount },
            { key: 'dinner', icon: '🍱', label: 'Dinner', count: data.summary.dinnerCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#0a0f0a] text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">{activeTab === 'lunch' ? '🥗' : '🍱'}</div>
            <div className="text-gray-800 font-bold text-lg mb-2">No one marked {activeTab} yet</div>
            <div className="text-gray-400 text-sm">Students who mark attendance will appear here</div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {activeList.map((record, i) => (
                <div key={record._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors">
                  {/* Index */}
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 flex-shrink-0">
                    {i + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/10 flex items-center justify-center text-xs font-black text-green-700 flex-shrink-0">
                    {getInitials(record.student?.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900">{record.student?.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">#{record.student?.rollNumber}</div>
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Marked at</div>
                    <div className="text-xs font-bold text-gray-700 mt-0.5">
                      {new Date(record.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                      {record.markedBy === 'admin' ? 'By Admin' : 'Self'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{activeList.length} student{activeList.length !== 1 ? 's' : ''} marked {activeTab}</span>
              <span className="text-xs text-gray-300">Auto-updates on refresh</span>
            </div>
          </div>
        )}
      </div>
      <footer className="mt-12 py-6 text-center border-t border-gray-100">
  <p className="text-xs text-gray-300">
    Crafted with ❤️ by <span className="font-bold text-green-600">Bramha Gulavani</span> &amp; the <span className="font-bold text-green-600">Annapurna Team</span>
  </p>
</footer>
    </div>
  )
}

export default Attendance