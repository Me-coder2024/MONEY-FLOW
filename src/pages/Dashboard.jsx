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
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Financial Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Real-time overview of your workspace funds and spending.</p>
      </div>

      {/* Fund Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {funds.map((fund, i) => {
          const colors = FUND_COLORS[fund.fund_type] || FUND_COLORS.revenue
          const utilization = fund.fund_type === 'grant' && fund.grant_total_sanctioned
            ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned))
            : null

          return (
            <Link to={`/funds/${fund.id}`} key={fund.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 border-l-4 ${colors.border} card-hover group transition-all`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors.light} ${colors.text} dark:bg-slate-700/50`}>
                    {FUND_ICONS[fund.fund_type]}
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    {FUND_LABELS[fund.fund_type]}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${colors.light} ${colors.text} dark:bg-slate-900/40`}>
                  {fund.fund_type}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{formatCurrencyShort(fund.current_balance)}</p>
              
              {utilization !== null ? (
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                    <span>{utilization}% utilized</span>
                    <span>{formatCurrencyShort(fund.grant_total_sanctioned)} limit</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.fill} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mt-5 pt-4 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase">Deposited</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{formatCurrencyShort(fund.total_deposited)}</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Middle Row: Balance Breakdown + Burn Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Balance Card with Doughnut */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8">
          <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8">Balance Allocation</h3>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-52 h-52 relative flex-shrink-0 group">
              <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-full scale-90 blur-2xl group-hover:scale-100 transition-transform opacity-30" />
              <Doughnut data={{
                ...doughnutData,
                datasets: [{
                  ...doughnutData.datasets[0],
                  hoverOffset: 15
                }]
              }} options={{
                plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, borderRadius: 12 } },
                maintainAspectRatio: true,
              }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tighter">Total</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrencyShort(totalBalance)}</span>
              </div>
            </div>
            
            <div className="w-full space-y-5">
              {funds.map(fund => {
                const colors = FUND_COLORS[fund.fund_type]
                const pct = percentage(parseFloat(fund.current_balance), totalBalance)
                return (
                  <div key={fund.id} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colors.fill}`} />
                        {FUND_LABELS[fund.fund_type]}
                      </span>
                      <span className="font-mono text-gray-400 dark:text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.fill} rounded-full transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Burn Rate */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8">🔥 Burn Analytics</h3>
          <div className="flex-1">
            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrencyShort(burnRate.monthly)}
              <span className="text-sm font-bold text-gray-400 ml-1">/ month</span>
            </p>
            
            <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-amber-500 opacity-20 group-hover:scale-125 transition-transform duration-500 text-6xl select-none">⏳</div>
              <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider relative z-10">Available Runway</p>
              <p className="text-3xl font-black text-amber-900 dark:text-amber-200 mt-1 relative z-10">
                {burnRate.runway === Infinity ? '∞' : `~${Math.round(burnRate.runway)} months`}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 pt-6 border-t border-gray-50 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500 dark:text-slate-400">Total Funds</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrencyShort(totalBalance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500 dark:text-slate-400">Action Items</span>
              <span className={`font-bold px-2 py-0.5 rounded-lg ${pendingWithdrawals.length > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-400'}`}>
                {pendingWithdrawals.length} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Compliance + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Recent Activity</h3>
            <Link to="/withdrawals" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">Full Audit Trail →</Link>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-50 dark:border-slate-700/50">
                  <th className="text-left py-3 px-3">Date</th>
                  <th className="text-left py-3 px-3 w-1/3">Transaction</th>
                  <th className="text-right py-3 px-3">Amount</th>
                  <th className="text-left py-3 px-3">Fund</th>
                  <th className="text-left py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {recentTx.map(tx => {
                  const status = STATUS_COLORS[tx.approval_status] || STATUS_COLORS.pending
                  const fundColor = FUND_COLORS[tx.funds?.fund_type]
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="py-4 px-3 text-gray-500 font-mono text-xs">{formatDateShort(tx.spent_date || tx.created_at)}</td>
                      <td className="py-4 px-3">
                        <p className="font-bold text-gray-800 dark:text-slate-200 truncate">{tx.purpose}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{tx.category}</p>
                      </td>
                      <td className="py-4 px-3 text-right font-black text-gray-900 dark:text-white">{formatCurrency(tx.total_amount)}</td>
                      <td className="py-4 px-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'} dark:bg-slate-900/40`}>
                          {tx.funds?.fund_type?.substring(0, 3)}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-[10px] inline-flex items-center gap-1 font-bold ${status.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.bg.replace('bg-', 'bg-')}`} />
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

        {/* Compliance + Category Stack */}
        <div className="space-y-6">
          {/* Compliance Score */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8">
            <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">Financial Compliance</h3>
            <div className="flex items-center justify-between mb-8">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-slate-700" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * compliance.overall) / 100}
                    className={`${compliance.overall >= 90 ? 'text-emerald-500' : compliance.overall >= 70 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-gray-900 dark:text-white">
                  {Math.round(compliance.overall)}%
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black uppercase tracking-widest ${compliance.overall >= 90 ? 'text-emerald-500' : compliance.overall >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                  {compliance.overall >= 90 ? 'Healthy' : compliance.overall >= 70 ? 'Attention' : 'Urgent'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-1">Based on documentation</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <ComplianceBar label="GST Bills" value={compliance.billRate} color={compliance.billRate >= 90 ? 'bg-emerald-500' : 'bg-red-500'} />
              <ComplianceBar label="Verification" value={compliance.verifiedRate} color="bg-primary-500" />
            </div>
            
            <Link to="/reports/compliance" className="block mt-8 py-3 text-center text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white bg-gray-50 dark:bg-slate-900/40 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
              Detailed Audit View
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary-200 dark:shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Category Dominance</h3>
            {categories.slice(0, 3).map((cat, i) => (
              <div key={cat.category} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>{CATEGORIES.find(c => c.value === cat.category)?.label || cat.category}</span>
                  <span>{cat.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full opacity-80" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 mb-1.5">
        <span>{label}</span>
        <span>{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl w-64 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 h-44 animate-pulse border border-gray-100 dark:border-slate-700/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 h-80 animate-pulse border border-gray-100 dark:border-slate-700/50" />
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 h-80 animate-pulse border border-gray-100 dark:border-slate-700/50" />
      </div>
    </div>
  )
}


