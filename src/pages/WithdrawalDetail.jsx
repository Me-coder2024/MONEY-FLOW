import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate } from '../utils/format'
import { FUND_ICONS, FUND_LABELS, FUND_COLORS, STATUS_COLORS, CATEGORIES } from '../utils/constants'

export default function WithdrawalDetail() {
  const { id } = useParams()
  const { withdrawals, funds, loading } = useApp()

  const w = withdrawals.find(w => w.id === parseInt(id))
  const fund = w ? funds.find(f => f.id === w.fund_id) : null

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />
  if (!w) return <div className="text-center py-20 text-gray-500">Withdrawal not found</div>

  const colors = FUND_COLORS[fund?.fund_type] || FUND_COLORS.revenue
  const status = STATUS_COLORS[w.approval_status]
  const catLabel = CATEGORIES.find(c => c.value === w.category)?.label || w.category

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
        <Link to="/withdrawals" className="text-gray-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400 transition-colors">Disbursements</Link>
        <span className="text-gray-300 dark:text-slate-700">/</span>
        <span className="text-gray-900 dark:text-white">Request #{w.id.toString().slice(-6)}</span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Background */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 blur-3xl ${colors.bg}`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${colors.bg} ${colors.text} bg-opacity-10`}>
              {FUND_ICONS[fund?.fund_type]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                {w.purpose}
              </h1>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${colors.text}`}>{fund?.fund_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <div className={`w-2.5 h-2.5 rounded-full ${status.bg} bg-opacity-100`} />
            <span className={`text-xs font-black uppercase tracking-widest ${status.text}`}>
              {w.approval_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          <Section title="Operational Artifacts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBox label="Classification" value={catLabel} />
              <InfoBox label="Target Entity" value={w.vendor_name} />
              <InfoBox label="Logistical Node" value={w.spent_location} />
              <InfoBox label="Temporal Mark" value={formatDate(w.spent_date)} />
              <InfoBox label="Initiating Agent" value={w.requested_by} />
              {w.approved_by && <InfoBox label="Authorized By" value={w.approved_by} />}
            </div>
            {w.remarks && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Administrative Remarks</p>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{w.remarks}</p>
              </div>
            )}
          </Section>

          <Section title="Fiscal Integrity Breakdown">
            <div className="bg-primary-50/30 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-900/20 p-8 space-y-4">
              <Row label="Base Capital" value={formatCurrency(w.amount_before_gst)} />
              <Row label={`Taxation (${w.gst_rate}%)`} value={formatCurrency(w.total_amount - w.amount_before_gst)} highlight="text-primary-600 dark:text-primary-400" />
              
              <div className="pt-6 border-t border-primary-200/50 dark:border-primary-900/30 mt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Impact Total</p>
                    <p className="text-xs font-bold text-gray-400">Authorized Disbursement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-red-600 dark:text-red-400 tracking-tighter">
                      {formatCurrency(w.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {(w.bill_number || w.vendor_gstin) && (
          <div className="mt-12 pt-12 border-t border-gray-50 dark:border-slate-700/50">
            <Section title="Audit Evidence (Bill Metadata)">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBox label="Invoice Identity" value={w.bill_number || '—'} />
                <InfoBox label="Issuance Date" value={formatDate(w.bill_date)} />
                <InfoBox label="Vendor GSTIN" value={w.vendor_gstin || '—'} />
                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-between">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">Evidence Attached</p>
                  {w.bill_document_url ? (
                    <a href={w.bill_document_url} target="_blank" rel="noreferrer" 
                      className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.1em] flex items-center gap-2 hover:underline">
                      ⚡ Open Digital Artifact
                    </a>
                  ) : (
                    <span className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase">Not Available</span>
                  )}
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">{title}</h4>
      {children}
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{value || '—'}</p>
    </div>
  )
}

function Row({ label, value, highlight = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black ${highlight}`}>{value}</span>
    </div>
  )
}
