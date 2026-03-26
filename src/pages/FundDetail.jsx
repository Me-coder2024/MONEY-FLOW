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
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
        <Link to="/funds" className="text-gray-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400 transition-colors">Repos</Link>
        <span className="text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white">{fund.fund_name}</span>
      </nav>

      {/* Hero Card */}
      <div className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 relative overflow-hidden`}>
        {/* Decorative Background */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 blur-3xl ${colors.bg}`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner ${colors.bg} ${colors.text} bg-opacity-10`}>
              {FUND_ICONS[fund.fund_type]}
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
                {fund.fund_name}
              </h1>
              <p className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Available Liquidity</p>
            <p className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
              {formatCurrency(fund.current_balance)}
            </p>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <StatBox 
            label={fund.fund_type === 'grant' ? 'Allocated Capital' : 'Total Contributions'}
            value={formatCurrencyShort(fund.fund_type === 'grant' ? fund.grant_total_sanctioned : fund.total_deposited)} 
          />
          <StatBox label="Aggregate Burn" value={formatCurrencyShort(fund.total_spent)} highlight="text-red-500" />
          <StatBox label="Pending Authorizations" value={formatCurrencyShort(0)} />
          {utilization !== null && <StatBox label="Capital Efficiency" value={`${utilization}%`} />}
        </div>

        {/* Utilization Visualization */}
        {utilization !== null && (
          <div className="mt-12 pt-12 border-t border-gray-50 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Resource Depletion</span>
              <span className={`text-xs font-black ${colors.text}`}>{utilization}% Utilized</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full ${colors.fill} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(utilization, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Grant Lifecycle Metadata */}
        {fund.fund_type === 'grant' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 bg-gray-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700/30">
            <MetaDetail label="Agency" value={fund.grant_agency_name} />
            <MetaDetail label="Kickoff" value={formatDate(fund.grant_start_date)} />
            <MetaDetail label="Deadline" value={formatDate(fund.grant_end_date)} />
            <MetaDetail label="Days to EOL" value={days || '0'} highlight={days < 30 ? 'text-red-500' : 'text-primary-600'} />
          </div>
        )}
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Financial Ledger</h3>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Chronological Disbursement Log</p>
          </div>
          <Link to="/withdrawals/new" 
            className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 text-center">
            + New Disbursement Request
          </Link>
        </div>

        <div className="overflow-x-auto -mx-8 md:-mx-12 px-8 md:px-12">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                <th className="pb-4 px-4 whitespace-nowrap">Date</th>
                <th className="pb-4 px-4">Entity / Purpose</th>
                <th className="pb-4 px-4">Classification</th>
                <th className="pb-4 px-4 text-right">Debit</th>
                <th className="pb-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {fundWithdrawals.map(tx => {
                const status = STATUS_COLORS[tx.approval_status]
                const catLabel = CATEGORIES.find(c => c.value === tx.category)?.label || tx.category
                return (
                  <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tabular-nums">
                      {formatDate(tx.spent_date)}
                    </td>
                    <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                      <Link to={`/withdrawals/${tx.id}`} className="block">
                        <p className="font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{tx.purpose}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mt-1">Ref: #{tx.id.toString().slice(-6)}</p>
                      </Link>
                    </td>
                    <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                      <span className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase tracking-widest bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                        {catLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-y border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50 text-right">
                      <p className="font-black text-gray-900 dark:text-white tabular-nums">{formatCurrency(tx.total_amount)}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Inclusive Tax</p>
                    </td>
                    <td className="py-4 px-4 rounded-r-2xl border-y border-r border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.bg} bg-opacity-100`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${status.text}`}>
                          {tx.approval_status}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {fundWithdrawals.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-gray-300 dark:text-slate-700 text-2xl">📁</div>
              <p className="text-sm font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">No activities detected in ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.15em]">{label}</p>
      <p className={`text-2xl font-black tracking-tighter ${highlight}`}>{value}</p>
    </div>
  )
}

function MetaDetail({ label, value, highlight = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-black ${highlight}`}>{value}</p>
    </div>
  )
}
