import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'
import { FUND_COLORS, STATUS_COLORS, CATEGORIES } from '../utils/constants'
import { useState } from 'react'

export default function WithdrawalsList() {
  const { withdrawals, loading } = useApp()
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = withdrawals.filter(w => {
    if (statusFilter !== 'all' && w.approval_status !== statusFilter) return false
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false
    return true
  })

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Withdrawals</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Founders' spending and fund disbursements</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/withdrawals/pending"
            className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-amber-100 transition-all text-center">
            ⏳ Pending Approvals
          </Link>
          <Link to="/withdrawals/new"
            className="bg-primary-600 hover:bg-primary-700 text-white font-black text-sm px-6 py-2.5 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:scale-105 text-center">
            + Record Expense
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all cursor-pointer">
            <option value="all">Every Status</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Done</option>
            <option value="rejected">Rejected Only</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">⌄</span>
        </div>
        
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all cursor-pointer">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">⌄</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700/50">
                <th className="text-left py-4 px-6">Date</th>
                <th className="text-left py-4 px-4 w-1/4">Purpose / Memo</th>
                <th className="text-left py-4 px-4">Category</th>
                <th className="text-left py-4 px-4">Fund</th>
                <th className="text-left py-4 px-4">Requester</th>
                <th className="text-right py-4 px-4">Total Amount</th>
                <th className="text-center py-4 px-4">Docs</th>
                <th className="text-left py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {filtered.map(tx => {
                const status = STATUS_COLORS[tx.approval_status]
                const fundColor = FUND_COLORS[tx.funds?.fund_type]
                const catLabel = CATEGORIES.find(c => c.value === tx.category)?.label || tx.category
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="py-4 px-6 text-gray-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">{formatDate(tx.spent_date)}</td>
                    <td className="py-4 px-4">
                      <Link to={`/withdrawals/${tx.id}`} className="font-bold text-gray-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block max-w-xs">{tx.purpose}</Link>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-slate-400 font-medium whitespace-nowrap">{catLabel}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'} dark:bg-slate-900/40`}>
                        {tx.funds?.fund_name?.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-slate-300 font-bold whitespace-nowrap">{tx.requested_by}</td>
                    <td className="py-4 px-4 text-right font-black text-gray-900 dark:text-white text-base">{formatCurrency(tx.total_amount)}</td>
                    <td className="py-4 px-4 text-center">
                      {tx.bill_document_url ? (
                        <a href={tx.bill_document_url} target="_blank" rel="noopener noreferrer" 
                          className="w-8 h-8 inline-flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:scale-110 transition-transform" title="View Bill">
                          📄
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase tracking-wider ${status.bg} ${status.text} dark:bg-opacity-20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.text.replace('text-', 'bg-')}`} />
                        {tx.approval_status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-24 text-center">
            <span className="text-5xl opacity-40">🔍</span>
            <p className="text-gray-400 dark:text-slate-500 mt-6 font-black uppercase tracking-widest text-xs">No matching transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
}
