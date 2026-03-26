import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, STATUS_COLORS, CATEGORIES } from '../utils/constants'
import { validateWithdrawal } from '../utils/validation'

export default function ApprovalQueue() {
  const { pendingWithdrawals, funds, approveWithdrawal, rejectWithdrawal } = useApp()
  const [remarks, setRemarks] = useState({})
  const [processing, setProcessing] = useState(null)

  const handleApprove = async (id) => {
    setProcessing(id)
    await approveWithdrawal(id, remarks[id] || '')
    setProcessing(null)
  }

  const handleReject = async (id) => {
    setProcessing(id)
    await rejectWithdrawal(id, remarks[id] || '')
    setProcessing(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">{pendingWithdrawals.length} requests awaiting review</p>
      </div>

      {pendingWithdrawals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-4xl">✅</span>
          <p className="text-gray-500 mt-4">All caught up! No pending approvals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingWithdrawals.map(w => {
            const fund = funds.find(f => f.id === w.fund_id)
            const colors = FUND_COLORS[fund?.fund_type]
            const catLabel = CATEGORIES.find(c => c.value === w.category)?.label
            const checks = fund ? validateWithdrawal({ ...w, bill_document_url: w.bill_document_url || 'x' }, fund) : []

            return (
              <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-amber-400">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">#W-{w.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors?.light} ${colors?.text}`}>{fund?.fund_name}</span>
                    <span className="text-xs text-gray-400">{formatDate(w.created_at)}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(w.total_amount)}</span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">👤 {w.requested_by}</p>
                  <p className="text-sm font-medium text-gray-800">📝 {w.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">💰 {formatCurrency(w.total_amount)} (incl. {w.gst_rate}% GST) • 🏪 {w.vendor_name}, {w.spent_location}</p>
                </div>

                {/* Validation Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {checks.map(c => (
                    <span key={c.id} className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${c.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {c.passed ? '✅' : '❌'} {c.label}
                    </span>
                  ))}
                </div>

                {/* Remark + Actions */}
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="Add remark..."
                    value={remarks[w.id] || ''} onChange={e => setRemarks({ ...remarks, [w.id]: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  <button onClick={() => handleReject(w.id)} disabled={processing === w.id}
                    className="px-5 py-2 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-medium text-sm transition-colors disabled:opacity-50">
                    ❌ Reject
                  </button>
                  <button onClick={() => handleApprove(w.id)} disabled={processing === w.id}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50">
                    ✅ Approve
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
