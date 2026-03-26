import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/format'

const actionStyles = {
  deposit: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
  withdrawal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
  edit: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
  delete: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30',
}

const actionIcons = {
  deposit: '📥',
  withdrawal: '📤',
  edit: '✏️',
  delete: '🗑️',
}

export default function AuditLog() {
  const { auditLog, loading } = useApp()

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white dark:bg-slate-800 rounded-3xl" />)}
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Institutional Audit Trail</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Immutable record of all financial maneuvers and system modifications.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 overflow-hidden">
        <div className="overflow-x-auto -mx-8 md:-mx-12 px-8 md:px-12">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                <th className="pb-4 px-4 whitespace-nowrap">Timestamp</th>
                <th className="pb-4 px-4">Action Token</th>
                <th className="pb-4 px-4">Repository Node</th>
                <th className="pb-4 px-4">Initiating Agent</th>
                <th className="pb-4 px-4">Modification Delta</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map(log => (
                <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tabular-nums whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${actionStyles[log.action]}`}>
                      {actionIcons[log.action]} {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{log.table_affected}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mt-1">ID: #{log.record_id}</p>
                  </td>
                  <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{log.performed_by}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black mt-0.5">Authorized Identity</p>
                  </td>
                  <td className="py-4 px-4 rounded-r-2xl border-y border-r border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                    <div className="max-w-xs overflow-hidden">
                      <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500 truncate group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors">
                        {log.new_value ? JSON.stringify(log.new_value) : 'NO_DELTA_DETECTED'}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {auditLog.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-gray-300 dark:text-slate-700 text-2xl">📑</div>
              <p className="text-sm font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">No spectral traces found in audit ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
