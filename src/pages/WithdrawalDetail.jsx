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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/withdrawals" className="text-gray-400 hover:text-gray-600">← Withdrawals</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-medium">#{w.id}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{FUND_ICONS[fund?.fund_type]}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{w.purpose}</h1>
              <p className={`text-xs font-medium ${colors.text}`}>{fund?.fund_name}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>{w.approval_status}</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Section title="Details">
            <Info label="Category" value={catLabel} />
            <Info label="Vendor" value={w.vendor_name} />
            <Info label="Location" value={w.spent_location} />
            <Info label="Date" value={formatDate(w.spent_date)} />
            <Info label="Requested By" value={w.requested_by} />
            {w.approved_by && <Info label="Approved By" value={w.approved_by} />}
            {w.remarks && <Info label="Remarks" value={w.remarks} />}
          </Section>

          <Section title="Financial Breakdown">
            <Info label="Base Amount" value={formatCurrency(w.amount_before_gst)} />
            <Info label="GST Rate" value={`${w.gst_rate}%`} />
            {w.cgst_amount > 0 && <Info label="CGST" value={formatCurrency(w.cgst_amount)} />}
            {w.sgst_amount > 0 && <Info label="SGST" value={formatCurrency(w.sgst_amount)} />}
            {w.igst_amount > 0 && <Info label="IGST" value={formatCurrency(w.igst_amount)} />}
            <div className="border-t pt-2 mt-2">
              <Info label="TOTAL" value={formatCurrency(w.total_amount)} bold />
            </div>
          </Section>
        </div>

        {(w.bill_number || w.vendor_gstin) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Invoice No" value={w.bill_number || '—'} />
              <Info label="Bill Date" value={formatDate(w.bill_date)} />
              <Info label="Vendor GSTIN" value={w.vendor_gstin || '—'} />
              <Info label="Bill Attached" value={w.bill_document_url ? <a href={w.bill_document_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 font-medium">📎 View Document</a> : 'No'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Info({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-800 ${bold ? 'font-bold text-base' : ''}`}>{value}</span>
    </div>
  )
}
