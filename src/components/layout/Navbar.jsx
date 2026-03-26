import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
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

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { pendingWithdrawals } = useApp()
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {pendingWithdrawals.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg py-1.5 pr-2 transition-colors">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100" />
            ) : (
              <div className="w-8 h-8 rounded-full gradient-indigo flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40 animate-scale-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setShowMenu(false); navigate('/settings') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  ⚙️ Settings
                </button>
                <button onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
