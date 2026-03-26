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
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{pendingWithdrawals.length} transaction requests awaiting fiscal review.</p>
      </div>

      {pendingWithdrawals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-20 text-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✨
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Queue is Empty</h3>
          <p className="text-gray-400 dark:text-slate-500 mt-2 font-medium uppercase tracking-widest text-xs">All fiscal requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingWithdrawals.map(w => {
            const fund = funds.find(f => f.id === w.fund_id)
            const colors = FUND_COLORS[fund?.fund_type]
            const checks = fund ? validateWithdrawal({ ...w, bill_document_url: w.bill_document_url || 'x' }, fund) : []

            return (
              <div key={w.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden border-l-8 border-l-amber-500 group">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 text-xl font-black shadow-inner">
                        💸
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">#REQ-{w.id.substring(0,6)}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${colors?.light} ${colors?.text} dark:bg-slate-900/40`}>
                            {fund?.fund_type}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{w.purpose}</h3>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrency(w.total_amount)}</p>
                      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                        Requested {formatDate(w.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 pt-8 border-t border-gray-50 dark:border-slate-700/50">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Originator</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-black">
                          {w.requested_by?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{w.requested_by}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Vitals</h4>
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{CATEGORIES.find(c => c.value === w.category)?.label}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{w.vendor_name} • {w.spent_location}</p>
                    </div>

                    <div className="lg:col-span-1">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Risk Assessment</h4>
                      <div className="flex flex-wrap gap-2">
                        {checks.map(c => (
                          <span key={c.id} className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter shadow-sm
                            ${c.passed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {c.passed ? '✓' : '✗'} {c.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col md:flex-row items-center gap-4 pt-6 border-t border-gray-50 dark:border-slate-700/50">
                    <div className="relative flex-1 w-full">
                      <input type="text" placeholder="Add administrative remark..."
                        value={remarks[w.id] || ''} onChange={e => setRemarks({ ...remarks, [w.id]: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button onClick={() => handleReject(w.id)} disabled={processing === w.id}
                        className="flex-1 md:flex-none px-8 py-4 rounded-2xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-all font-black text-xs uppercase tracking-widest">
                        Reject
                      </button>
                      <button onClick={() => handleApprove(w.id)} disabled={processing === w.id}
                        className="flex-1 md:flex-none px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 font-black text-xs uppercase tracking-widest disabled:opacity-50">
                        {processing === w.id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
