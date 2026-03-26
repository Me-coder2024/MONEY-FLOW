import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatCurrencyShort, percentage, daysLeft, formatDate } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS } from '../utils/constants'

export default function FundsList() {
  const { funds, loading } = useApp()

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-2xl" />)}</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Funds</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all fund sources</p>
        </div>
        <Link to="/funds/create"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md">
          + Add Fund
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {funds.map(fund => {
          const colors = FUND_COLORS[fund.fund_type]
          const utilization = fund.fund_type === 'grant' && fund.grant_total_sanctioned
            ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned))
            : null
          const days = fund.grant_end_date ? daysLeft(fund.grant_end_date) : null

          return (
            <Link to={`/funds/${fund.id}`} key={fund.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 ${colors.border} card-hover group`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{FUND_ICONS[fund.fund_type]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{fund.fund_name}</h3>
                  <p className={`text-xs font-medium ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Deposited</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrencyShort(fund.total_deposited)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Spent</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrencyShort(fund.total_spent)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Balance</p>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrencyShort(fund.current_balance)}</p>
                </div>
              </div>

              {utilization !== null && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilization: {utilization}%</span>
                    {days !== null && <span>{days} days left</span>}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.fill} rounded-full progress-bar-fill`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                </div>
              )}

              {fund.grant_agency_name && (
                <p className="text-xs text-gray-400 mt-3">Agency: {fund.grant_agency_name}</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
