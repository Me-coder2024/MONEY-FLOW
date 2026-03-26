import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'
import { FUND_COLORS } from '../utils/constants'

export default function DepositsList() {
  const { deposits, loading } = useApp()

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
          <p className="text-sm text-gray-500 mt-1">{deposits.length} total deposits recorded</p>
        </div>
        <Link to="/deposits/new"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md">
          + New Deposit
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left py-3 px-6">Date</th>
              <th className="text-left py-3 px-4">Fund</th>
              <th className="text-left py-3 px-4">Source</th>
              <th className="text-left py-3 px-4">Founder</th>
              <th className="text-center py-3 px-4">Proof</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-left py-3 px-6">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deposits.map(dep => {
              const fundColor = FUND_COLORS[dep.funds?.fund_type]
              return (
                <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-gray-500">{formatDate(dep.deposit_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'}`}>
                      {dep.funds?.fund_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-48 truncate">{dep.source_description}</td>
                  <td className="py-3 px-4 text-gray-600">{dep.founders?.name || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    {dep.proof_document_url ? (
                      <a href={dep.proof_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80" title="View Proof">
                        📄
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCurrency(dep.amount)}</td>
                  <td className="py-3 px-6 text-gray-400 font-mono text-xs">{dep.reference_number}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
