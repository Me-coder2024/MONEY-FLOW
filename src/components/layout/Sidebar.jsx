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

export default function Sidebar() {
  const { pendingWithdrawals } = useApp()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-indigo flex items-center justify-center text-white font-bold text-sm shadow-lg">
            ₹
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Money Handler</h1>
            <p className="text-[10px] text-gray-400 font-medium">Financial Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-50 text-primary-700 sidebar-link-active'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/withdrawals' && pendingWithdrawals.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingWithdrawals.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-3">
          <p className="text-xs font-medium text-primary-700">💡 Quick Tip</p>
          <p className="text-[10px] text-primary-600 mt-1">All transactions are tracked in the audit log</p>
        </div>
      </div>
    </aside>
  )
}
