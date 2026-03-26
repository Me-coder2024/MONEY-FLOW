import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatCurrencyShort, percentage, daysLeft, formatDate } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS } from '../utils/constants'

export default function FundsList() {
  const { funds, loading } = useApp()

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="h-56 bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700/50" />
      ))}
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Financial Repositories</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Strategic asset allocation and fund health monitoring.</p>
        </div>
        <Link to="/funds/create"
          className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest px-8 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-center">
          + Initialize New Fund
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {funds.map(fund => {
          const colors = FUND_COLORS[fund.fund_type]
          const utilization = fund.fund_type === 'grant' && fund.grant_total_sanctioned
            ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned))
            : null
          const days = fund.grant_end_date ? daysLeft(fund.grant_end_date) : null

          return (
            <Link to={`/funds/${fund.id}`} key={fund.id}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 group hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col justify-between min-h-[280px]">
              
              {/* Glass Background Decor */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${colors.bg}`} />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${colors.bg} ${colors.text} bg-opacity-10`}>
                    {FUND_ICONS[fund.fund_type]}
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
                    {days !== null && (
                      <p className={`text-[10px] font-bold mt-1 ${days < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                        {days} Days Remaining
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight mb-6">
                  {fund.fund_name}
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-8 pt-6 border-t border-gray-50 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Available Liquidity</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrencyShort(fund.current_balance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Total Burned</p>
                    <p className="text-lg font-bold text-gray-500 dark:text-slate-400">{formatCurrencyShort(fund.total_spent)}</p>
                  </div>
                </div>
              </div>

              {utilization !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                    <span>Usage Efficiency</span>
                    <span className={colors.text}>{utilization}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.fill} rounded-full`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Active Reserve</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
