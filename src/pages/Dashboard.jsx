import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatCurrencyShort, formatDateShort, percentage } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS, CATEGORIES, CATEGORY_COLORS, STATUS_COLORS } from '../utils/constants'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler)

export default function Dashboard() {
  const { funds, withdrawals, approvedWithdrawals, pendingWithdrawals, totalBalance, loading, getBurnRate, getCategoryBreakdown, getComplianceScore } = useApp()

  if (loading) return <LoadingSkeleton />

  const burnRate = getBurnRate()
  const categories = getCategoryBreakdown()
  const compliance = getComplianceScore()
  const recentTx = withdrawals.slice(0, 6)

  // Doughnut chart data
  const doughnutData = {
    labels: funds.map(f => FUND_LABELS[f.fund_type] || f.fund_name),
    datasets: [{
      data: funds.map(f => parseFloat(f.current_balance || 0)),
      backgroundColor: funds.map(f => FUND_COLORS[f.fund_type]?.hex || '#6b7280'),
      borderWidth: 0,
      cutout: '72%',
    }],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fund Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {funds.map((fund, i) => {
          const colors = FUND_COLORS[fund.fund_type] || FUND_COLORS.revenue
          const utilization = fund.fund_type === 'grant' && fund.grant_total_sanctioned
            ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned))
            : null

          return (
            <Link to={`/funds/${fund.id}`} key={fund.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 ${colors.border} card-hover`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{FUND_ICONS[fund.fund_type]}</span>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {FUND_LABELS[fund.fund_type]}
                  </h3>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${colors.light} ${colors.text}`}>
                  {fund.fund_type}
                </span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{formatCurrencyShort(fund.current_balance)}</p>
              {utilization !== null ? (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{utilization}% utilized</span>
                    <span>{formatCurrencyShort(fund.grant_total_sanctioned)} sanctioned</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.fill} rounded-full progress-bar-fill`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  Deposited: {formatCurrencyShort(fund.total_deposited)}
                </p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Middle Row: Balance Breakdown + Burn Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Balance Card with Doughnut */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Total Balance Breakdown</h3>
          <div className="flex items-center gap-8">
            <div className="w-44 h-44 relative">
              <Doughnut data={doughnutData} options={{
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                maintainAspectRatio: true,
              }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrencyShort(totalBalance)}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {funds.map(fund => {
                const colors = FUND_COLORS[fund.fund_type]
                const pct = percentage(parseFloat(fund.current_balance), totalBalance)
                return (
                  <div key={fund.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colors.fill}`} />
                        {FUND_LABELS[fund.fund_type]}
                      </span>
                      <span className="text-gray-500">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.fill} rounded-full progress-bar-fill`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Burn Rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">🔥 Burn Rate</h3>
          <p className="text-2xl font-extrabold text-gray-900">{formatCurrencyShort(burnRate.monthly)}<span className="text-sm font-normal text-gray-400"> / month</span></p>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-medium text-amber-700">⏳ Runway</p>
            <p className="text-lg font-bold text-amber-900">
              {burnRate.runway === Infinity ? '∞' : `~${Math.round(burnRate.runway)} months`}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Balance</span>
              <span className="font-medium">{formatCurrencyShort(totalBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pending Requests</span>
              <span className="font-medium text-amber-600">{pendingWithdrawals.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Compliance + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Transactions</h3>
            <Link to="/withdrawals" className="text-xs font-medium text-primary-600 hover:text-primary-700">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Purpose</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Fund</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTx.map(tx => {
                  const status = STATUS_COLORS[tx.approval_status] || STATUS_COLORS.pending
                  const fundColor = FUND_COLORS[tx.funds?.fund_type]
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-500">{formatDateShort(tx.spent_date || tx.created_at)}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-48 truncate">{tx.purpose}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-gray-900">{formatCurrency(tx.total_amount)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'}`}>
                          {tx.funds?.fund_type?.charAt(0).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
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

        {/* Compliance Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Compliance Score</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-3xl font-extrabold ${compliance.overall >= 90 ? 'text-emerald-600' : compliance.overall >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {compliance.overall.toFixed(1)}%
            </div>
            <span className={`text-lg ${compliance.overall >= 90 ? '' : compliance.overall >= 70 ? '' : ''}`}>
              {compliance.overall >= 90 ? '🟢' : compliance.overall >= 70 ? '🟡' : '🔴'}
            </span>
          </div>
          <div className="space-y-3">
            <ComplianceBar label="Bills OK" value={compliance.billRate} total={compliance.total} />
            <ComplianceBar label="Verified" value={compliance.verifiedRate} total={compliance.total} />
            <ComplianceBar label="Complete" value={compliance.completenessRate} total={compliance.total} />
          </div>
          {compliance.missing > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700">⚠️ {compliance.missing} bills missing</p>
            </div>
          )}
          <Link to="/reports/compliance" className="block mt-4 text-xs font-medium text-primary-600 hover:text-primary-700 text-center">
            View Full Report →
          </Link>
        </div>
      </div>

      {/* Category Spending */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Category-Wise Spending</h3>
        <div className="space-y-3">
          {categories.map(({ category, amount, percentage: pct }) => {
            const label = CATEGORIES.find(c => c.value === category)?.label || category
            const color = CATEGORY_COLORS[category] || '#6b7280'
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">{pct.toFixed(1)}%  •  {formatCurrencyShort(amount)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ComplianceBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full progress-bar-fill ${value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-36 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border p-6 h-56 animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-56 animate-pulse" />
      </div>
    </div>
  )
}
