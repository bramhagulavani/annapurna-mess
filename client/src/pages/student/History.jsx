import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

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

const History = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ totalLunch: 0, totalDinner: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => { fetchHistory() }, [selectedMonth])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/attendance/mine?month=${selectedMonth}`)
      setRecords(res.data.records)
      setSummary(res.data.summary)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // Build calendar data
  const [year, month] = selectedMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()

  // Map records to date
  const recordMap = {}
  records.forEach((r) => {
    const d = new Date(r.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!recordMap[key]) recordMap[key] = []
    recordMap[key].push(r)
  })

  const getDayKey = (day) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getDayStatus = (day) => {
    const key = getDayKey(day)
    const dayRecords = recordMap[key] || []
    const hasLunch = dayRecords.some((r) => r.meal === 'lunch')
    const hasDinner = dayRecords.some((r) => r.meal === 'dinner')
    return { hasLunch, hasDinner, records: dayRecords }
  }

  const isToday = (day) =>
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day

  const isFuture = (day) => {
    const d = new Date(year, month - 1, day)
    return d > today
  }

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  })

  const selectedDayRecords = selectedDate ? recordMap[getDayKey(selectedDate)] || [] : []

  // Blank cells before first day (Monday start)
  const blanks = firstDay === 0 ? 6 : firstDay - 1

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Navbar */}
      <nav className="bg-[#0a0f0a] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/home')}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm">📅</div>
              <span className="text-white font-bold text-sm">Attendance History</span>
            </div>
          </div>

          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            max={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(null) }}
            className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-2 rounded-xl outline-none focus:border-green-500/50 transition-colors"
          />
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
          <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">My Attendance</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">{monthName}</h1>
              <p className="text-white/35 text-sm">{user?.name} · #{user?.rollNumber}</p>
            </div>

            {/* Summary pills */}
            <div className="flex gap-3">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">🥗</span>
                <div>
                  <div className="text-2xl font-black text-white">{summary.totalLunch}</div>
                  <div className="text-white/30 text-xs">Lunches</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">🍱</span>
                <div>
                  <div className="text-2xl font-black text-white">{summary.totalDinner}</div>
                  <div className="text-white/30 text-xs">Dinners</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">🍽️</span>
                <div>
                  <div className="text-2xl font-black text-white">{summary.totalLunch + summary.totalDinner}</div>
                  <div className="text-white/30 text-xs">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-5 flex-wrap">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Legend</div>
          {[
            { color: 'bg-green-500', label: 'Both meals' },
            { color: 'bg-amber-400', label: 'One meal' },
            { color: 'bg-gray-100', label: 'No meal' },
            { color: 'ring-2 ring-green-500 bg-white', label: 'Today' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-md ${l.color}`} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-6">

          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <button
              onClick={() => {
                const d = new Date(year, month - 2, 1)
                setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
                setSelectedDate(null)
              }}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-black text-gray-900">{monthName}</h2>
            <button
              onClick={() => {
                const d = new Date(year, month, 1)
                const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
                const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                if (newMonth <= maxMonth) {
                  setSelectedMonth(newMonth)
                  setSelectedDate(null)
                }
              }}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-7">
              {/* Blank cells */}
              {Array.from({ length: blanks }).map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square p-2 border-b border-r border-gray-50/50" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const { hasLunch, hasDinner } = getDayStatus(day)
                const both = hasLunch && hasDinner
                const one = (hasLunch || hasDinner) && !both
                const none = !hasLunch && !hasDinner
                const todayDay = isToday(day)
                const future = isFuture(day)
                const selected = selectedDate === day

                return (
                  <div
                    key={day}
                    onClick={() => !future && setSelectedDate(selected ? null : day)}
                    className={`aspect-square p-1.5 border-b border-r border-gray-50/50 flex flex-col items-center justify-center gap-1 transition-all
                      ${future ? 'opacity-30 cursor-default' : 'cursor-pointer hover:bg-gray-50'}
                      ${selected ? 'bg-gray-900 rounded-2xl' : ''}
                    `}
                  >
                    {/* Day number */}
                    <div className={`text-xs font-black leading-none
                      ${selected ? 'text-white' : todayDay ? 'text-green-600' : 'text-gray-700'}
                      ${todayDay && !selected ? 'bg-green-50 border border-green-200 w-6 h-6 rounded-full flex items-center justify-center text-[10px]' : ''}
                    `}>
                      {day}
                    </div>

                    {/* Meal dots */}
                    {!future && (
                      <div className="flex gap-0.5">
                        {both ? (
                          <div className={`w-2 h-2 rounded-full ${selected ? 'bg-green-400' : 'bg-green-500'}`} />
                        ) : one ? (
                          <div className={`w-2 h-2 rounded-full ${selected ? 'bg-amber-300' : 'bg-amber-400'}`} />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/20' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected day detail */}
        {selectedDate && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-900 text-lg">
                {new Date(year, month - 1, selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs transition-colors"
              >✕</button>
            </div>

            {selectedDayRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">😴</div>
                <div className="text-sm font-bold text-gray-500">No meals marked this day</div>
                <div className="text-xs text-gray-300 mt-1">You did not attend mess on this day</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedDayRecords.map((r) => (
                  <div key={r._id} className={`flex items-center gap-4 rounded-2xl px-5 py-4 border ${
                    r.meal === 'lunch'
                      ? 'bg-green-50 border-green-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}>
                    <span className="text-2xl">{r.meal === 'lunch' ? '🥗' : '🍱'}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-black capitalize ${r.meal === 'lunch' ? 'text-green-800' : 'text-amber-800'}`}>
                        {r.meal} — Present ✅
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Marked {r.markedBy === 'admin' ? 'by admin' : 'by you'} at {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                      r.markedBy === 'admin'
                        ? 'bg-purple-50 border-purple-100 text-purple-600'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}>
                      {r.markedBy === 'admin' ? 'Admin' : 'Self'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monthly breakdown table */}
        {records.length > 0 && (
          <>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Full Month Log</div>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0a0f0a] text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <div className="col-span-4">Date</div>
                <div className="col-span-2 text-center">Meal</div>
                <div className="col-span-3 text-center">Status</div>
                <div className="col-span-3 text-center">Marked by</div>
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {records.map((r) => (
                  <div key={r._id} className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-gray-50/80 transition-colors">
                    <div className="col-span-4 text-xs font-bold text-gray-700">
                      {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-base">{r.meal === 'lunch' ? '🥗' : '🍱'}</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        r.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {r.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        r.markedBy === 'admin'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.markedBy === 'admin' ? '👤 Admin' : '🙋 Self'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{records.length} records this month</span>
                <span className="text-xs font-bold text-gray-500">🥗 {summary.totalLunch} lunch · 🍱 {summary.totalDinner} dinner</span>
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default History