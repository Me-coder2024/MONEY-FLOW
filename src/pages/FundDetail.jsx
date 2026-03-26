import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatCurrencyShort, formatDate, percentage, daysLeft } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS, STATUS_COLORS, CATEGORIES } from '../utils/constants'

export default function FundDetail() {
  const { id } = useParams()
  const { funds, withdrawals, deposits, loading } = useApp()

  const fund = funds.find(f => f.id === parseInt(id))
  const fundDeposits = deposits.filter(d => d.fund_id === parseInt(id))
  const fundWithdrawals = withdrawals.filter(w => w.fund_id === parseInt(id))

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />
  if (!fund) return <div className="text-center py-20 text-gray-500">Fund not found</div>

  const colors = FUND_COLORS[fund.fund_type]
  const utilization = fund.fund_type === 'grant' && fund.grant_total_sanctioned
    ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned))
    : null
  const days = fund.grant_end_date ? daysLeft(fund.grant_end_date) : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/funds" className="text-gray-400 hover:text-gray-600 transition-colors">← Funds</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-medium">{fund.fund_name}</span>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 ${colors.border}`}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{FUND_ICONS[fund.fund_type]}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fund.fund_name}</h1>
            <p className={`text-sm font-medium ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label={fund.fund_type === 'grant' ? 'Sanctioned' : 'Deposited'}
            value={formatCurrencyShort(fund.fund_type === 'grant' ? fund.grant_total_sanctioned : fund.total_deposited)} />
          <StatBox label="Spent" value={formatCurrencyShort(fund.total_spent)} />
          <StatBox label="Balance" value={formatCurrencyShort(fund.current_balance)} className="text-emerald-600" />
          {utilization !== null && <StatBox label="Utilization" value={`${utilization}%`} />}
        </div>

        {/* Utilization Bar */}
        {utilization !== null && (
          <div className="mb-4">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${colors.fill} rounded-full progress-bar-fill`} style={{ width: `${Math.min(utilization, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>◄── {utilization}% Used ──►</span>
              <span>◄── {(100 - utilization).toFixed(1)}% Left ──►</span>
            </div>
          </div>
        )}

        {/* Grant details */}
        {fund.fund_type === 'grant' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-400">Agency:</span> <span className="font-medium">{fund.grant_agency_name}</span></div>
            <div><span className="text-gray-400">Start:</span> <span className="font-medium">{formatDate(fund.grant_start_date)}</span></div>
            <div><span className="text-gray-400">End:</span> <span className="font-medium">{formatDate(fund.grant_end_date)}</span></div>
            {days !== null && <div><span className="text-gray-400">Days Left:</span> <span className="font-bold text-amber-600">{days}</span></div>}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Transactions</h3>
          <Link to="/withdrawals/new" className="text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
            + New Withdrawal
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="text-left py-2 pr-4">Date</th>
                <th className="text-left py-2 pr-4">Purpose</th>
                <th className="text-left py-2 pr-4">Category</th>
                <th className="text-right py-2 pr-4">Amount</th>
                <th className="text-left py-2 pr-4">Bill</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fundWithdrawals.map(tx => {
                const status = STATUS_COLORS[tx.approval_status]
                const catLabel = CATEGORIES.find(c => c.value === tx.category)?.label || tx.category
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4 text-gray-500">{formatDate(tx.spent_date)}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-48 truncate">
                      <Link to={`/withdrawals/${tx.id}`} className="hover:text-primary-600">{tx.purpose}</Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{catLabel}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold">{formatCurrency(tx.total_amount)}</td>
                    <td className="py-2.5 pr-4">{tx.bill_document_url ? '✅' : tx.bill_number ? '⚠️' : '—'}</td>
                    <td className="py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                        {tx.approval_status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {fundWithdrawals.length === 0 && (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, className = '' }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
      <p className={`text-xl font-bold text-gray-800 ${className}`}>{value}</p>
    </div>
  )
}
