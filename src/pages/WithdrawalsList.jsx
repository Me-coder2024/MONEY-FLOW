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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} transactions</p>
        </div>
        <div className="flex gap-3">
          <Link to="/withdrawals/pending"
            className="bg-amber-50 text-amber-700 border border-amber-200 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
            ⏳ Pending Queue
          </Link>
          <Link to="/withdrawals/new"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md">
            + New Withdrawal
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left py-3 px-6">Date</th>
              <th className="text-left py-3 px-4">Purpose</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Fund</th>
              <th className="text-left py-3 px-4">Requested By</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-left py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(tx => {
              const status = STATUS_COLORS[tx.approval_status]
              const fundColor = FUND_COLORS[tx.funds?.fund_type]
              const catLabel = CATEGORIES.find(c => c.value === tx.category)?.label || tx.category
              return (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-gray-500">{formatDate(tx.spent_date)}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 max-w-48 truncate">
                    <Link to={`/withdrawals/${tx.id}`} className="hover:text-primary-600">{tx.purpose}</Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{catLabel}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'}`}>
                      {tx.funds?.fund_name?.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{tx.requested_by}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(tx.total_amount)}</td>
                  <td className="py-3 px-6">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>
                      {tx.approval_status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
