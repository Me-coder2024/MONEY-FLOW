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
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800/60 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${
      isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
    }`}>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50 dark:border-slate-800/60">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-shadow hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/40">
            ₹
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">Money Flow</h1>
            <p className="text-[9px] text-gray-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">Financial System</p>
          </div>
        </div>
        
        {/* Mobile Close */}
        <button onClick={onClose} className="md:hidden ml-auto w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-white active:bg-gray-100 dark:active:bg-slate-800 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => { if(window.innerWidth < 768) onClose() }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/withdrawals' && pendingWithdrawals.length > 0 && (
              <span className="ml-auto relative flex items-center justify-center">
                <span className="absolute w-5 h-5 bg-amber-400 rounded-full animate-pulse-ring" />
                <span className="relative bg-amber-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center z-10">
                  {pendingWithdrawals.length}
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Tip */}
      <div className="p-3 border-t border-gray-50 dark:border-slate-800/60">
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/40 rounded-xl p-4 border border-indigo-100/50 dark:border-slate-700/30">
          <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">💡 Quick Tip</p>
          <p className="text-[10px] text-indigo-500/80 dark:text-slate-400 mt-1.5 leading-relaxed">All transactions are tracked in the audit log for complete transparency.</p>
        </div>
      </div>
    </aside>
  )
}
