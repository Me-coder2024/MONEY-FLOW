import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calculateGST } from '../utils/gst'
import { validateGSTIN, validateWithdrawal } from '../utils/validation'
import { formatCurrency, formatCurrencyShort, percentage } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS, CATEGORIES, GST_RATES } from '../utils/constants'

const STEPS = ['Fund', 'Details', 'GST & Bill', 'Review']

export default function WithdrawalNew() {
  const { funds, addWithdrawal, currentUser } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    fund_id: '', amount_before_gst: '', purpose: '', category: '',
    vendor_name: '', spent_location: '', spent_date: new Date().toISOString().split('T')[0],
    requested_by: currentUser.name, remarks: '',
    gst_rate: 18, is_inter_state: false, vendor_gstin: '', bill_number: '',
    bill_date: '', bill_document_url: '',
  })

  const selectedFund = funds.find(f => f.id === parseInt(form.fund_id))
  const gst = calculateGST(form.amount_before_gst, form.gst_rate, form.is_inter_state)
  const gstinCheck = form.vendor_gstin ? validateGSTIN(form.vendor_gstin) : null

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validationChecks = selectedFund ? validateWithdrawal({
    ...form, total_amount: gst.grandTotal,
    bill_document_url: form.bill_document_url || (selectedFund.fund_type !== 'grant' ? 'optional' : ''),
  }, {
    ...selectedFund, pending_amount: 0,
  }) : []

  const allPassReview = validationChecks.every(c => c.passed)

  const handleSubmit = async () => {
    setSubmitting(true)
    const payload = {
      fund_id: parseInt(form.fund_id),
      requested_by: form.requested_by,
      amount_before_gst: gst.baseAmount,
      gst_rate: gst.gstRate,
      cgst_amount: gst.cgst,
      sgst_amount: gst.sgst,
      igst_amount: gst.igst,
      total_amount: gst.grandTotal,
      purpose: form.purpose,
      category: form.category,
      vendor_name: form.vendor_name,
      vendor_gstin: form.vendor_gstin || null,
      bill_number: form.bill_number || null,
      bill_date: form.bill_date || null,
      bill_document_url: form.bill_document_url || null,
      spent_location: form.spent_location,
      spent_date: form.spent_date,
      remarks: form.remarks || null,
      approval_status: 'pending',
    }
    const result = await addWithdrawal(payload)
    setSubmitting(false)
    if (result) navigate('/withdrawals')
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Withdrawal</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <button onClick={() => i < step && setStep(i)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i === step ? 'bg-primary-600 text-white shadow-lg scale-110' :
                  i < step ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </button>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`step-connector flex-1 ${i < step ? 'bg-primary-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* STEP 1: Fund Selection */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Fund Source</h2>
            <div className="space-y-3">
              {funds.map(fund => {
                const colors = FUND_COLORS[fund.fund_type]
                const selected = parseInt(form.fund_id) === fund.id
                const util = fund.fund_type === 'grant' && fund.grant_total_sanctioned
                  ? percentage(parseFloat(fund.total_spent), parseFloat(fund.grant_total_sanctioned)) : null
                return (
                  <label key={fund.id}
                    className={`block border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      selected ? `${colors.border} ${colors.bg} ring-2 ring-offset-1` : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selected ? { '--tw-ring-color': colors.hex } : {}}>
                    <input type="radio" name="fund" className="hidden"
                      checked={selected} onChange={() => update('fund_id', fund.id.toString())} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{FUND_ICONS[fund.fund_type]}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{fund.fund_name}</p>
                          <p className={`text-xs font-medium ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">Available: {formatCurrencyShort(fund.current_balance)}</p>
                        {util !== null && <p className="text-xs text-gray-500">Utilized: {util}%</p>}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Before GST) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input type="number" required min="1" value={form.amount_before_gst}
                  onChange={e => update('amount_before_gst', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Description *</label>
              <textarea rows={2} required value={form.purpose} onChange={e => update('purpose', e.target.value)}
                placeholder="Describe what this spending is for..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                <input type="text" required value={form.vendor_name} onChange={e => update('vendor_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (Where) *</label>
                <input type="text" required value={form.spent_location} onChange={e => update('spent_location', e.target.value)}
                  placeholder="e.g., Pune, Maharashtra"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={form.spent_date} onChange={e => update('spent_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
              <textarea rows={2} value={form.remarks} onChange={e => update('remarks', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
            </div>
          </div>
        )}

        {/* STEP 3: GST & Bill */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">GST & Bill Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate *</label>
                <select value={form.gst_rate} onChange={e => update('gst_rate', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%{r === 0 ? ' (Exempt)' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all text-sm
                    ${!form.is_inter_state ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>
                    <input type="radio" name="gst_type" checked={!form.is_inter_state}
                      onChange={() => update('is_inter_state', false)} className="hidden" />
                    Intra-State
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all text-sm
                    ${form.is_inter_state ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>
                    <input type="radio" name="gst_type" checked={form.is_inter_state}
                      onChange={() => update('is_inter_state', true)} className="hidden" />
                    Inter-State
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor GSTIN</label>
                <input type="text" value={form.vendor_gstin} onChange={e => update('vendor_gstin', e.target.value.toUpperCase())}
                  placeholder="e.g., 27AAPFU0939F1ZV" maxLength={15}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono" />
                {gstinCheck && (
                  <span className={`text-xs mt-1 block ${gstinCheck.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                    {gstinCheck.valid ? '✅' : '❌'} {gstinCheck.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill / Invoice Number</label>
                <input type="text" value={form.bill_number} onChange={e => update('bill_number', e.target.value)}
                  placeholder="e.g., INV-2025-00456"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
              <input type="date" value={form.bill_date} onChange={e => update('bill_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none max-w-xs" />
            </div>

            {/* GST Auto-Calculated Breakdown */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Auto Calculated GST Breakdown</h3>
              <div className="space-y-2 text-sm">
                <Row label="Base Amount" value={formatCurrency(gst.baseAmount)} />
                <div className="border-t border-gray-200 pt-2 mt-2" />
                <Row label={`CGST (${gst.cgstRate}%)`} value={formatCurrency(gst.cgst)} />
                <Row label={`SGST (${gst.sgstRate}%)`} value={formatCurrency(gst.sgst)} />
                <Row label={`IGST (${gst.igstRate}%)`} value={formatCurrency(gst.igst)} />
                <div className="border-t border-gray-200 pt-2 mt-2" />
                <Row label="Total Tax" value={formatCurrency(gst.totalTax)} />
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">GRAND TOTAL</span>
                    <span className="font-extrabold text-emerald-700 text-xl">{formatCurrency(gst.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload (Simulated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload GST Bill {selectedFund?.fund_type === 'grant' && <span className="text-red-500">*</span>}
              </label>
              <div className="upload-zone border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer"
                onClick={() => update('bill_document_url', 'gst_bill_uploaded.pdf')}>
                {form.bill_document_url ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <span>✅</span>
                    <span className="font-medium">{form.bill_document_url}</span>
                    <button onClick={e => { e.stopPropagation(); update('bill_document_url', '') }}
                      className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500">📄 Click to simulate bill upload</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
              {selectedFund?.fund_type === 'grant' && <p className="text-xs text-amber-600 mt-1">⚠️ Mandatory for Grant Fund</p>}
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Review & Confirm</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5">
              <Section title="Fund Source">
                <p className="text-sm"><span className="text-xl mr-2">{FUND_ICONS[selectedFund?.fund_type]}</span>
                  <strong>{selectedFund?.fund_name}</strong></p>
                <p className="text-xs text-gray-500 mt-1">
                  Available After This: {formatCurrency(selectedFund?.current_balance)} - {formatCurrency(gst.grandTotal)} = {formatCurrency(parseFloat(selectedFund?.current_balance || 0) - gst.grandTotal)}
                </p>
              </Section>

              <Section title="Details">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Detail label="Purpose" value={form.purpose} />
                  <Detail label="Category" value={CATEGORIES.find(c => c.value === form.category)?.label} />
                  <Detail label="Vendor" value={form.vendor_name} />
                  <Detail label="Location" value={form.spent_location} />
                  <Detail label="Date" value={form.spent_date} />
                  <Detail label="Requested By" value={form.requested_by} />
                </div>
              </Section>

              <Section title="Financial Breakdown">
                <div className="space-y-1 text-sm">
                  <Row label="Base Amount" value={formatCurrency(gst.baseAmount)} />
                  {gst.cgst > 0 && <Row label={`CGST (${gst.cgstRate}%)`} value={formatCurrency(gst.cgst)} />}
                  {gst.sgst > 0 && <Row label={`SGST (${gst.sgstRate}%)`} value={formatCurrency(gst.sgst)} />}
                  {gst.igst > 0 && <Row label={`IGST (${gst.igstRate}%)`} value={formatCurrency(gst.igst)} />}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-red-600">
                      <span>TOTAL DEBIT</span><span>{formatCurrency(gst.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </Section>

              {form.bill_number && (
                <Section title="Bill Details">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Detail label="Invoice No" value={form.bill_number} />
                    <Detail label="Bill Date" value={form.bill_date} />
                    <Detail label="Vendor GSTIN" value={form.vendor_gstin || '—'} />
                    <Detail label="Attached" value={form.bill_document_url ? '📎 ' + form.bill_document_url : '—'} />
                  </div>
                </Section>
              )}

              <Section title="Validation Checks">
                <div className="space-y-1.5">
                  {validationChecks.map(check => (
                    <div key={check.id} className={`flex items-center gap-2 text-sm ${check.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span>{check.passed ? '✅' : '❌'}</span>
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <p className="text-xs text-amber-600 mt-4">⚠️ This will be sent for approval to Admin/Manager</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/withdrawals')}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 0 && !form.fund_id}
              className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm transition-all hover:shadow-md disabled:opacity-40">
              Next Step →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting || !allPassReview}
              className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-40">
              {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}:</span>
      <span className="ml-1 text-gray-800">{value}</span>
    </div>
  )
}
