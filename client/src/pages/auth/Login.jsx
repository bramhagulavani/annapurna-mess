import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/student/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT — Mess Photo Background ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">

        {/* 🔁 SWAP THIS with your real mess photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/mess.jpg')" }}
        />

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70" />

        {/* Green tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/60 via-transparent to-transparent" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content over photo */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Top brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-xl">
              🍛
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">Annapurna Mess</div>
              <div className="text-white/40 text-xs mt-0.5">Attendance Management</div>
            </div>
          </div>

          {/* Bottom headline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live System
            </div>

            <h1 className="text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-2xl">
              Ghar jaisa khana.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300">
                Digital hisaab.
              </span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm mb-10">
              No more register books. Mark your meals in one tap and track every meal you've earned.
            </p>

            {/* Stats row */}
            <div className="flex gap-6">
              {[
                { val: '30', label: 'Meals/month' },
                { val: '2x', label: 'Meals/day' },
                { val: '0', label: 'Meals wasted' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Login Form ── */}
      <div className="w-full lg:w-[460px] bg-white flex flex-col justify-center relative">

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400" />

        <div className="px-10 py-16 lg:px-12">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <span className="text-2xl">🍛</span>
            <span className="font-bold text-gray-800 text-lg">Annapurna Mess</span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl mb-5 shadow-sm">
              🔐
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Sign in</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to access your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200/80 text-red-600 px-4 py-3.5 rounded-2xl text-sm mb-6">
              <span className="text-base mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/80 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-gray-100 bg-gray-50/80 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-xs text-gray-300">
              No account?{' '}
              <span className="text-green-600 font-semibold">Contact your mess admin</span>
            </p>
          </div>

          {/* Bottom decorative */}
          <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login