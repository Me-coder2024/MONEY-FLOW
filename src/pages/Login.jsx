import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex items-center justify-center p-5 relative overflow-hidden transition-colors duration-500">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/15 dark:bg-indigo-500/10 blur-[100px] rounded-full animate-float" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-purple-400/15 dark:bg-emerald-500/8 blur-[100px] rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-blue-400/10 blur-[80px] rounded-full animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30 mb-6 hover:scale-105 transition-transform duration-500">
            ₹
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Money Flow</h1>
          <p className="text-gray-400 dark:text-slate-500 mt-2 font-semibold text-xs uppercase tracking-[0.2em]">Institutional Fiscal Gateway</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100/80 dark:border-slate-800/60 p-8 sm:p-10 animate-fade-in-up stagger-2">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 font-medium">Sign in to access your financial dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl px-4 py-3 mb-6 text-center animate-scale-in">
              {error}
            </div>
          )}

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-gray-300/30 dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-3 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">🔒 Secured by Firebase</span>
              <span>•</span>
              <span>Google Auth</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 dark:text-slate-600 mt-8 font-medium uppercase tracking-[0.15em] animate-fade-in stagger-4">
          Track Sarkari Funds • Grant Money • Company Revenue
        </p>
      </div>
    </div>
  )
}
