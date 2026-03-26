import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FUND_LABELS } from '../utils/constants'
import { formatCurrency } from '../utils/format'
import { uploadToCloudinary } from '../utils/cloudinary'

export default function DepositNew() {
  const { funds, founders: rawFounders, addDeposit } = useApp()
  const founders = Array.from(new Map(rawFounders.map(f => [f.email, f])).values())
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fund_id: '', founder_id: '', amount: '', deposit_date: new Date().toISOString().split('T')[0],
    reference_number: '', source_description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [proofFile, setProofFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef(null)

  const selectedFund = funds.find(f => f.id === parseInt(form.fund_id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    let uploadedUrl = null
    if (proofFile) {
      setUploadProgress('Uploading proof...')
      try {
        uploadedUrl = await uploadToCloudinary(proofFile)
      } catch (err) {
        alert('Failed to upload proof. Please try again.')
        setSubmitting(false)
        setUploadProgress('')
        return
      }
    }

    const payload = {
      ...form,
      fund_id: parseInt(form.fund_id),
      founder_id: form.founder_id ? parseInt(form.founder_id) : null,
      amount: parseFloat(form.amount),
      proof_document_url: uploadedUrl || null
    }
    const result = await addDeposit(payload)
    setSubmitting(false)
    if (result) navigate('/deposits')
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Record Deposit</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Inject capital into workspace funds with full tracking.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 space-y-8 relative overflow-hidden">
        {/* Progress Bar for Upload */}
        {submitting && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-50 dark:bg-slate-900">
            <div className="h-full bg-primary-600 animate-pulse-slow" style={{ width: '60%' }} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Destination Fund</label>
              <div className="relative group">
                <select required value={form.fund_id} onChange={e => setForm({ ...form, fund_id: e.target.value })}
                  className="w-full appearance-none bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer">
                  <option value="">Select fund...</option>
                  {funds.map(f => <option key={f.id} value={f.id}>{f.fund_name} ({FUND_LABELS[f.fund_type]})</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary-500 transition-colors">⌄</div>
              </div>
            </div>

            {selectedFund?.fund_type === 'sarkari' && (
              <div className="animate-scale-in">
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Contributing Founder</label>
                <div className="relative group">
                  <select value={form.founder_id} onChange={e => setForm({ ...form, founder_id: e.target.value })}
                    className="w-full appearance-none bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer">
                    <option value="">Select founder...</option>
                    {founders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 font-bold">👤</div>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-black uppercase tracking-widest">Buy-in transaction</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Date</label>
                <input type="date" required value={form.deposit_date} onChange={e => setForm({ ...form, deposit_date: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Amount (₹)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-black">₹</span>
                  <input type="number" required min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-gray-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Reference (UTR/Bank ID)</label>
              <input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })}
                placeholder="e.g. TXN987234..."
                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Source Description</label>
          <textarea rows={2} value={form.source_description} onChange={e => setForm({ ...form, source_description: e.target.value })}
            placeholder="Where is this money coming from? (e.g. Yearly subscription revenue, Loan from X)"
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" />
        </div>

        <div className="bg-gray-50 dark:bg-slate-900/30 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase mb-1">Payment Evidence</h4>
              <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Upload bank screenshot or PDF receipt for the audit trail.</p>
            </div>
            
            <div className="flex-shrink-0">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf"
                onChange={e => { if(e.target.files[0]) setProofFile(e.target.files[0]) }} />
              
              {proofFile ? (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs truncate max-w-[150px]">{proofFile.name}</span>
                  <button type="button" onClick={() => setProofFile(null)} className="text-emerald-400 hover:text-red-500">✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  Attach Screenshot
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-50 dark:border-slate-700/50">
          <button type="button" onClick={() => navigate('/deposits')}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl text-gray-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">
            Discard
          </button>
          <button type="submit" disabled={submitting}
            className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none transition-all hover:scale-[1.02] disabled:opacity-50">
            {submitting ? (uploadProgress || 'Processing...') : '🤝 Finalize Deposit Record'}
          </button>
        </div>
      </form>
    </div>
  )
}
