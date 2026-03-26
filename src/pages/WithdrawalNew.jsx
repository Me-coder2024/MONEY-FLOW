import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calculateGST } from '../utils/gst'
import { validateGSTIN, validateWithdrawal } from '../utils/validation'
import { formatCurrency, formatCurrencyShort, percentage } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, FUND_ICONS, CATEGORIES, GST_RATES } from '../utils/constants'
import { uploadToCloudinary } from '../utils/cloudinary'

const STEPS = ['Fund', 'Details', 'GST & Bill', 'Review']

export default function WithdrawalNew() {
  const { funds, addWithdrawal, currentUser } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [billFile, setBillFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef(null)

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
    bill_document_url: billFile ? 'has_file' : '',
  }, {
    ...selectedFund, pending_amount: 0,
  }) : []

  const allPassReview = validationChecks.every(c => c.passed)

  const handleSubmit = async () => {
    setSubmitting(true)
    
    const isGrant = selectedFund?.fund_type === 'grant'
    
    let uploadedUrl = null
    if (billFile) {
      setUploadProgress('Uploading bill...')
      try {
        uploadedUrl = await uploadToCloudinary(billFile)
      } catch (err) {
        alert('Failed to upload bill document. Please try again.')
        setSubmitting(false)
        setUploadProgress('')
        return
      }
    } else if (isGrant) {
      alert('Bill document is required for Grant funds.')
      setSubmitting(false)
      return
    }

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
      bill_document_url: uploadedUrl,
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
    <div className="max-w-4xl mx-auto animate-fade-in pb-20 px-4 md:px-0">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Withdrawal Request</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Multi-step fiscal disbursement protocol.</p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="relative group">
            <button onClick={() => i < step && setStep(i)}
              className={`w-full h-1.5 rounded-full transition-all ${
                i <= step ? 'bg-primary-600 shadow-md shadow-primary-200 dark:shadow-none' : 'bg-gray-200 dark:bg-slate-700'
              }`} />
            <div className="mt-3 text-center md:text-left">
              <span className={`text-[10px] font-black uppercase tracking-widest block transition-all ${
                i === step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-slate-600'
              }`}>
                Step 0{i + 1}
              </span>
              <span className={`text-xs font-bold hidden sm:block mt-1 ${
                i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'
              }`}>
                {s}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-6 md:p-12 relative overflow-hidden min-h-[500px]">
        {/* Progress Bar for Upload */}
        {submitting && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-50 dark:bg-slate-900">
            <div className="h-full bg-primary-600 animate-pulse-slow" style={{ width: '75%' }} />
          </div>
        )}

        {/* STEP 1: Fund Selection */}
        {step === 0 && (
          <div className="space-y-6 animate-scale-in">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Source Allocation</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Which fund will back this expenditure?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {funds.map(fund => {
                const colors = FUND_COLORS[fund.fund_type]
                const selected = parseInt(form.fund_id) === fund.id
                return (
                  <label key={fund.id}
                    className={`block border-2 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.01] ${
                      selected 
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-lg shadow-primary-100 dark:shadow-none' 
                        : 'border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-900/40'
                    }`}>
                    <input type="radio" name="fund" className="hidden"
                      checked={selected} onChange={() => update('fund_id', fund.id.toString())} />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                          selected ? 'bg-primary-600 text-white' : 'bg-gray-50 dark:bg-slate-900 text-gray-400'
                        }`}>
                          {FUND_ICONS[fund.fund_type]}
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{fund.fund_name}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${colors.text}`}>{FUND_LABELS[fund.fund_type]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrencyShort(fund.current_balance)}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Available</p>
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
          <div className="space-y-8 animate-scale-in">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Transaction Metadata</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Specify purpose and logistical details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Amount (Pre-tax Base) *</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-black text-lg">₹</span>
                    <input type="number" required min="1" value={form.amount_before_gst}
                      onChange={e => update('amount_before_gst', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-gray-900 dark:text-white font-black text-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Purpose / Intent *</label>
                  <textarea rows={3} required value={form.purpose} onChange={e => update('purpose', e.target.value)}
                    placeholder="Brief description of this spending..."
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Category *</label>
                    <select required value={form.category} onChange={e => update('category', e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                      <option value="">Select...</option>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Vendor Name *</label>
                    <input type="text" required value={form.vendor_name} onChange={e => update('vendor_name', e.target.value)}
                      placeholder="Organization/Person"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Location *</label>
                    <input type="text" required value={form.spent_location} onChange={e => update('spent_location', e.target.value)}
                      placeholder="City/State"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Spending Date *</label>
                    <input type="date" required value={form.spent_date} onChange={e => update('spent_date', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GST & Bill */}
        {step === 2 && (
          <div className="space-y-8 animate-scale-in">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Financial Compliances</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure tax settings and audit evidence.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">GST Rate (%)</label>
                    <select value={form.gst_rate} onChange={e => update('gst_rate', parseInt(e.target.value))}
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-black focus:ring-2 focus:ring-primary-500 outline-none">
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%{r === 0 ? ' (Exempt)' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Jurisdiction</label>
                    <div className="flex bg-gray-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700">
                      <button type="button" onClick={() => update('is_inter_state', false)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${!form.is_inter_state ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-400 dark:text-slate-500'}`}>
                        Intra-State
                      </button>
                      <button type="button" onClick={() => update('is_inter_state', true)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${form.is_inter_state ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-400 dark:text-slate-500'}`}>
                        Inter-State
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Vendor GSTIN</label>
                    <input type="text" value={form.vendor_gstin} onChange={e => update('vendor_gstin', e.target.value.toUpperCase())}
                      placeholder="15-digit alphanumeric" maxLength={15}
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                    {gstinCheck && (
                      <span className={`text-[10px] uppercase font-black tracking-widest mt-2 block ${gstinCheck.valid ? 'text-emerald-500' : 'text-red-500'}`}>
                        {gstinCheck.valid ? '✓ Validated' : '✗ Invalid Format'}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Invoice Number</label>
                    <input type="text" value={form.bill_number} onChange={e => update('bill_number', e.target.value)}
                      placeholder="No. found on bill"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>

                <div className="p-6 bg-primary-50/50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-900/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white text-lg">💡</div>
                    <p className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Tax Breakdown</p>
                  </div>
                  <div className="space-y-3">
                    <Row label="Base Pre-GST" value={formatCurrency(gst.baseAmount)} />
                    <Row label={`${form.is_inter_state ? 'IGST' : 'CGST + SGST'} Total`} value={formatCurrency(gst.totalTax)} dark />
                    <div className="pt-3 border-t border-primary-200/50 dark:border-primary-900/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-900 dark:text-white tracking-widest uppercase">Escalated Total</span>
                        <span className="text-xl font-black text-primary-700 dark:text-primary-400 tracking-tighter">{formatCurrency(gst.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Evidence Artifact (Bill) *</label>
                <div className="upload-zone border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[2rem] p-10 text-center cursor-pointer hover:border-primary-500 transition-all bg-gray-50/30 dark:bg-slate-900/20 group"
                  onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf"
                    onChange={e => { if(e.target.files[0]) { setBillFile(e.target.files[0]); update('bill_document_url', e.target.files[0].name); } }} />
                  
                  {billFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 text-2xl shadow-inner">📄</div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-full px-4">{billFile.name}</p>
                        <button onClick={e => { e.stopPropagation(); setBillFile(null); update('bill_document_url', ''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline">Remove Artifact</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto text-gray-400 text-2xl group-hover:scale-110 transition-transform shadow-sm">⚡</div>
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Deploy Invoice</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">Click to browse or drop<br/>PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="space-y-8 animate-scale-in">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Final Authorization</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review your request parameters before submission.</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700/50 space-y-10">
              <Section title="Fund Allocation">
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <span className="text-3xl">{FUND_ICONS[selectedFund?.fund_type]}</span>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{selectedFund?.fund_name}</p>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{FUND_LABELS[selectedFund?.fund_type]}</p>
                  </div>
                </div>
              </Section>

              <Section title="Logistics & Compliance">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="Intent" value={form.purpose} />
                  <Detail label="Vendor" value={form.vendor_name} />
                  <Detail label="Location" value={form.spent_location} />
                  <Detail label="Invoice" value={form.bill_number || 'N/A'} />
                  <Detail label="Asset" value={form.bill_document_url ? 'Attached ✓' : 'N/A'} />
                  <Detail label="Agent" value={form.requested_by} />
                </div>
              </Section>

              <Section title="Fiscal Integrity Check">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validationChecks.map(check => (
                    <div key={check.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                      check.passed 
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-500'
                    }`}>
                      <span className="text-lg">{check.passed ? '✓' : '✗'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{check.label}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="pt-8 border-t border-gray-100 dark:border-slate-700/50">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Fiscal Liability</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Inclusive of {form.gst_rate}% tax</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-red-600 dark:text-red-400 tracking-tighter">{formatCurrency(gst.grandTotal)}</p>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Total Debit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest text-center">
                ⚠️ This request will be queued for administrative concurrence.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-12 pt-8 border-t border-gray-50 dark:border-slate-700/50">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/withdrawals')}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl text-gray-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">
            {step === 0 ? 'Abort Request' : '← Previous Protocol'}
          </button>
          
          <div className="flex-1 w-full" />

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 0 && !form.fund_id}
              className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-gray-900 dark:bg-slate-700 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 disabled:opacity-40">
              Advance Sequence →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting || !allPassReview}
              className="w-full sm:w-auto px-14 py-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-100 dark:shadow-none transition-all hover:scale-105 disabled:opacity-40">
              {submitting ? (uploadProgress || 'Committing...') : 'Authorize & Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, dark }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${dark ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-4">{title}</h4>
      {children}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-sm font-bold text-gray-700 dark:text-slate-300 line-clamp-1">{value || '—'}</span>
    </div>
  )
}
