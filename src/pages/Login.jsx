import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // redirect if already logged in
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-5xl font-black mx-auto shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
            ₹
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Money Flow</h1>
          <p className="text-gray-400 dark:text-slate-500 mt-3 font-bold uppercase tracking-[0.3em] text-[10px]">Institutional Fiscal Gateway</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-white/20 dark:border-slate-800 p-10 md:p-14 animate-scale-in">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-2 uppercase tracking-widest">Sign in to access your secure terminal</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-4 mb-8 text-center animate-shake">
               Security Alert: {error}
            </div>
          )}

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest py-5 px-8 rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill={loading ? "currentColor" : "#4285F4"}/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={loading ? "currentColor" : "#34A853"}/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={loading ? "currentColor" : "#FBBC05"}/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={loading ? "currentColor" : "#EA4335"}/>
              </svg>
            )}
            {loading ? 'Authorizing Cluster...' : 'Continue with Google Identity'}
          </button>

          <div className="mt-10 pt-10 border-t border-gray-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">🛡️ Secured by Cloud Shield</span>
                <span>•</span>
                <span>Military-Grade Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Info */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
            Sarkari Infrastructure • Grant Custody • Revenue Optimization
          </p>
        </div>
      </div>
    </div>
  )
}
