import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const Reports = () => {
  const navigate = useNavigate()
  const [report, setReport] = useState({ summary: [], month: '' })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => { fetchReport() }, [selectedMonth])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/attendance/report?month=${selectedMonth}`)
      setReport(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const totalLunch = report.summary.reduce((a, s) => a + s.lunch, 0)
  const totalDinner = report.summary.reduce((a, s) => a + s.dinner, 0)

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
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm">📊</div>
              <span className="text-white font-bold text-sm">Monthly Report</span>
            </div>
          </div>

          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-2 rounded-xl outline-none focus:border-green-500/50 transition-colors"
          />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0a0f0a]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          </div>
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Monthly Summary</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h1>
            <p className="text-white/35 text-sm mb-6">{report.summary.length} students tracked</p>

            {/* Summary */}
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: '🥗', val: totalLunch, label: 'Total Lunches' },
                { icon: '🍱', val: totalDinner, label: 'Total Dinners' },
                { icon: '🍽️', val: totalLunch + totalDinner, label: 'Total Meals' },
                { icon: '👥', val: report.summary.length, label: 'Students' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="text-2xl font-black text-white">{s.val}</div>
                    <div className="text-white/30 text-xs mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : report.summary.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-gray-800 font-bold text-lg mb-2">No data for this month</div>
            <div className="text-gray-400 text-sm">Select a different month or wait for students to mark attendance</div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0a0f0a] text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-center">Lunch</div>
              <div className="col-span-2 text-center">Dinner</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {report.summary.map((s, i) => {
                const total = s.lunch + s.dinner
                const maxMeals = 60
                const pct = Math.min((total / maxMeals) * 100, 100)

                return (
                  <div key={s.student._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors">

                    {/* Index */}
                    <div className="col-span-1 text-xs font-black text-gray-300">{i + 1}</div>

                    {/* Student */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-600/20 border border-blue-500/10 flex items-center justify-center text-xs font-black text-blue-700 flex-shrink-0">
                        {getInitials(s.student.name)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 leading-none mb-1">{s.student.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-gray-400">#{s.student.rollNumber}</span>
                          {/* Progress bar */}
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl">
                        <span className="text-sm">🥗</span>
                        <span className="text-sm font-black text-green-700">{s.lunch}</span>
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                        <span className="text-sm">🍱</span>
                        <span className="text-sm font-black text-amber-700">{s.dinner}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-gray-900 px-3 py-1.5 rounded-xl">
                        <span className="text-sm font-black text-white">{total}</span>
                        <span className="text-[10px] text-gray-500">meals</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{report.summary.length} student{report.summary.length !== 1 ? 's' : ''} this month</span>
              <span className="text-xs font-bold text-gray-500">Total: {totalLunch + totalDinner} meals served</span>
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

export default Reports