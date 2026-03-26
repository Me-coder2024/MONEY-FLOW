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
    return 'Money Handler'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu (Mobile Only) */}
        <button onClick={onMenuToggle} className="md:hidden p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-5">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 115.636 5.636m12.728 12.728L12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {pendingWithdrawals.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 hidden sm:block mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 pl-2 py-1.5 pr-1 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-100 dark:ring-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-xl gradient-indigo flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight truncate max-w-[120px]">{user?.email}</p>
            </div>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-14 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2.5 z-40 animate-scale-in">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { setShowMenu(false); navigate('/settings') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 rounded-xl transition-colors">
                    <span className="text-base">⚙️</span> Settings
                  </button>
                  <button onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 rounded-xl transition-colors mt-1 font-semibold">
                    <span className="text-base">🚪</span> Sign Out
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
