import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'

export default function ReportCompliance() {
  const { getComplianceScore, approvedWithdrawals, funds } = useApp()
  const compliance = getComplianceScore()

  const grantWithdrawals = approvedWithdrawals.filter(w => {
    const fund = funds.find(f => f.id === w.fund_id)
    return fund?.fund_type === 'grant'
  })

  const flagged = grantWithdrawals.filter(w => !w.bill_document_url || !w.vendor_gstin || !w.bill_number)

  const getThreshold = (score) => {
    if (score >= 90) return { label: 'AUDIT READY', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🟢' }
    if (score >= 70) return { label: 'NEEDS ATTENTION', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🟡' }
    return { label: 'CRITICAL', color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' }
  }

  const threshold = getThreshold(compliance.overall)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grant Compliance Report</h1>
          <p className="text-sm text-gray-500 mt-1">Audit readiness for grant fund transactions</p>
        </div>
        <Link to="/reports"
          className="text-sm font-medium text-primary-600 hover:text-primary-700">← Back to Reports</Link>
      </div>

      {/* Score Card */}
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ${threshold.bg}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{threshold.icon}</span>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Overall Compliance Score</p>
            <p className={`text-5xl font-extrabold ${threshold.color}`}>{compliance.overall.toFixed(1)}%</p>
            <p className={`text-sm font-medium ${threshold.color} mt-1`}>{threshold.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <ScoreCard label="Bill Attachment Rate" value={compliance.billRate} count={`${compliance.total - compliance.missing}/${compliance.total}`} />
          <ScoreCard label="GSTIN Verification Rate" value={compliance.verifiedRate} count={null} />
          <ScoreCard label="Completeness Rate" value={compliance.completenessRate} count={null} />
        </div>
      </div>

      {/* Thresholds */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Threshold Levels</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-emerald-700">🟢 90-100%</p>
            <p className="text-xs text-emerald-600">Audit Ready</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-amber-700">🟡 70-89%</p>
            <p className="text-xs text-amber-600">Needs Attention</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-red-700">🔴 Below 70%</p>
            <p className="text-xs text-red-600">Critical – Fix Immediately</p>
          </div>
        </div>
      </div>

      {/* Flagged Items */}
      {flagged.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">⚠️ Flagged Items ({flagged.length})</h3>
          <div className="space-y-2">
            {flagged.map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400">#W-{w.id}</span>
                  <span className="text-sm text-gray-700">{w.purpose}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(w.total_amount)}</span>
                  <div className="flex gap-1">
                    {!w.bill_document_url && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">No Bill</span>}
                    {!w.vendor_gstin && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">No GSTIN</span>}
                    {!w.bill_number && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">No Invoice</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreCard({ label, value, count }) {
  const color = value >= 90 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-red-600'
  const barColor = value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value.toFixed(1)}%</p>
      {count && <p className="text-xs text-gray-400 mt-1">{count}</p>}
      <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${barColor} rounded-full progress-bar-fill`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
