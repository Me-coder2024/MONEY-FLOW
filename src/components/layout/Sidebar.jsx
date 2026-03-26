import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/funds', icon: '💰', label: 'Funds' },
  { path: '/deposits', icon: '📥', label: 'Deposits' },
  { path: '/withdrawals', icon: '📤', label: 'Withdrawals' },
  { path: '/founders', icon: '👥', label: 'Founders' },
  { path: '/reports', icon: '📈', label: 'Reports' },
  { path: '/audit-log', icon: '📋', label: 'Audit Log' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { pendingWithdrawals } = useApp()

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center text-white font-bold text-lg shadow-lg">
            ₹
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Money Handler</h1>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium tracking-wider">FINANCIAL MANAGEMENT</p>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden ml-auto p-2 text-gray-500 active:bg-gray-100 rounded-lg">
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => { if(window.innerWidth < 768) onClose() }}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-white'
              }`
            }
          >
            <span className={`text-xl transition-transform group-hover:scale-110`}>{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/withdrawals' && pendingWithdrawals.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingWithdrawals.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
          <p className="text-xs font-bold text-primary-700 dark:text-primary-400">💡 Quick Tip</p>
          <p className="text-[10px] text-primary-600 dark:text-slate-400 mt-1 leading-relaxed">All transactions are tracked in the audit log for complete transparency.</p>
        </div>
      </div>
    </aside>
  )
}
