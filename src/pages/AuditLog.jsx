import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/format'

const actionColors = {
  deposit: 'bg-emerald-100 text-emerald-700',
  withdrawal: 'bg-blue-100 text-blue-700',
  edit: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
}

const actionIcons = {
  deposit: '📥',
  withdrawal: '📤',
  edit: '✏️',
  delete: '🗑️',
}

export default function AuditLog() {
  const { auditLog, loading } = useApp()

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Complete trail of all financial actions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left py-3 px-6">Timestamp</th>
              <th className="text-left py-3 px-4">Action</th>
              <th className="text-left py-3 px-4">Table</th>
              <th className="text-left py-3 px-4">Record ID</th>
              <th className="text-left py-3 px-4">Performed By</th>
              <th className="text-left py-3 px-6">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {auditLog.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${actionColors[log.action]}`}>
                    {actionIcons[log.action]} {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono text-xs">{log.table_affected}</td>
                <td className="py-3 px-4 text-gray-500">#{log.record_id}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{log.performed_by}</td>
                <td className="py-3 px-6 text-gray-500 text-xs max-w-64 truncate">
                  {log.new_value ? JSON.stringify(log.new_value) : '—'}
                </td>
              </tr>
            ))}
            {auditLog.length === 0 && (
              <tr><td colSpan="6" className="py-12 text-center text-gray-400">No audit log entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
