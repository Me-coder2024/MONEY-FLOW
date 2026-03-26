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
    if (score >= 90) return { label: 'AUDIT READY', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-900/20', icon: '💎' }
    if (score >= 70) return { label: 'NEEDS ATTENTION', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-900/20', icon: '⚠️' }
    return { label: 'CRITICAL FAILURE', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-100 dark:border-red-900/20', icon: '🛑' }
  }

  const threshold = getThreshold(compliance.overall)

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">Compliance Architecture</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Verification of fiscal integrity and audit readiness.</p>
        </div>
        <Link to="/reports"
          className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline">
          ← Return to Intelligence
        </Link>
      </div>

      {/* Main Score Hero */}
      <div className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border ${threshold.border} p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center`}>
        <div className={`absolute inset-0 opacity-5 pointer-events-none ${threshold.bg}`} />
        
        <div className="relative z-10 w-full">
          <div className="mb-8">
            <span className="text-6xl mb-4 block">{threshold.icon}</span>
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">Integrity Quotient</p>
            <p className={`text-7xl md:text-8xl font-black tracking-tighter ${threshold.color}`}>{compliance.overall.toFixed(1)}%</p>
            <p className={`text-sm font-black mt-4 uppercase tracking-widest px-6 py-2 rounded-full inline-block ${threshold.bg} ${threshold.color} border ${threshold.border}`}>
              Status: {threshold.label}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
            <ScoreStat label="Artifact Rate" value={compliance.billRate} count={`${compliance.total - compliance.missing}/${compliance.total}`} />
            <ScoreStat label="GSTIN Validation" value={compliance.verifiedRate} />
            <ScoreStat label="Data Completeness" value={compliance.completenessRate} />
          </div>
        </div>
      </div>

      {/* Threshold Documentation */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
        <div className="mb-10">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Governance Thresholds</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Procedural standards for grant management</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ThresholdBox score="90-100%" label="Diamond Standard" desc="Fully audit-ready with zero missing artifacts." color="emerald" />
          <ThresholdBox score="70-89%" label="Standard Risk" desc="Minor discrepancies requiring administrative action." color="amber" />
          <ThresholdBox score="<70%" label="Operational Failure" desc="Critical lack of documentation. Requires immediate fix." color="red" />
        </div>
      </div>

      {/* Flagged Transaction Ledger */}
      {flagged.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Anomalous Artifacts</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">High-risk disbursements requiring immediate intervention</p>
            </div>
            <div className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
              {flagged.length} Alerts
            </div>
          </div>
          
          <div className="space-y-4">
            {flagged.map(w => (
              <div key={w.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-slate-700/50 hover:border-red-200 dark:hover:border-red-900/30 transition-all">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 text-xl">⚠️</div>
                  <div>
                    <Link to={`/withdrawals/${w.id}`} className="text-sm font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{w.purpose}</Link>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mt-1">Ref: #W-{w.id.toString().slice(-6)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums mr-4">{formatCurrency(w.total_amount)}</span>
                  {!w.bill_document_url && <Badge label="Bill Missing" type="red" />}
                  {!w.vendor_gstin && <Badge label="GSTIN Missing" type="amber" />}
                  {!w.bill_number && <Badge label="Invoice Missing" type="amber" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreStat({ label, value, count }) {
  const color = value >= 90 ? 'text-emerald-500' : value >= 70 ? 'text-amber-500' : 'text-red-500'
  const barColor = value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50">
      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end justify-between mb-2">
        <p className={`text-2xl font-black ${color}`}>{value.toFixed(1)}%</p>
        {count && <p className="text-[10px] font-bold text-gray-400 tabular-nums">{count}</p>}
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ThresholdBox({ score, label, desc, color }) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400',
  }
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} text-center`}>
      <p className="text-xl font-black tracking-tighter mb-1">{score}</p>
      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-xs mt-3 opacity-70 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

function Badge({ label, type }) {
  const styles = {
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
  }
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${styles[type]}`}>
      {label}
    </span>
  )
}
