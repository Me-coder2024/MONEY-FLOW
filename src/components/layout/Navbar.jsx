import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const pageTitles = {
  '/': 'Dashboard',
  '/funds': 'Funds',
  '/deposits': 'Deposits',
  '/withdrawals': 'Withdrawals',
  '/founders': 'Founders',
  '/reports': 'Reports & Analytics',
  '/audit-log': 'Audit Log',
  '/settings': 'Settings',
}

export default function Navbar({ onMenuToggle }) {
  const { user, signOut } = useAuth()
  const { pendingWithdrawals } = useApp()
  const { toggleTheme, isDark } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title
      }
    }
    return 'Money Flow'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="h-16 md:h-[72px] bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-gray-100/80 dark:border-slate-800/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Hamburger (Mobile) */}
        <button onClick={onMenuToggle} className="md:hidden p-2 text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{getTitle()}</h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Theme Toggle — Animated */}
        <button 
          onClick={toggleTheme}
          className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 active:scale-90"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          <div className={`absolute transition-all duration-500 ${isDark ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`}>
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className={`absolute transition-all duration-500 ${isDark ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </button>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {pendingWithdrawals.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 py-1 pl-1 pr-2 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl active:scale-[0.98]">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-100 dark:ring-slate-700 transition-all hover:ring-indigo-300 dark:hover:ring-indigo-700" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-[13px] font-semibold text-gray-800 dark:text-white leading-tight">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight truncate max-w-[100px]">{user?.email}</p>
            </div>
            <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 hidden lg:block transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 py-1.5 z-40 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800">
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{user?.displayName}</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button onClick={() => { setShowMenu(false); navigate('/settings') }}
                    className="w-full text-left px-3 py-2 text-[13px] text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 rounded-lg transition-colors">
                    <span>⚙️</span> Settings
                  </button>
                  <button onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2.5 rounded-lg transition-colors mt-0.5 font-semibold">
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
