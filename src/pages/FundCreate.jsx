import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FUND_TYPES, FUND_LABELS } from '../utils/constants'

export default function FundCreate() {
  const { addFund } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fund_type: 'revenue', fund_name: '', grant_agency_name: '',
    grant_start_date: '', grant_end_date: '', grant_total_sanctioned: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...form,
      total_deposited: 0, total_spent: 0, current_balance: 0,
      grant_total_sanctioned: form.grant_total_sanctioned ? parseFloat(form.grant_total_sanctioned) : null,
      grant_agency_name: form.fund_type === 'grant' ? form.grant_agency_name : null,
      grant_start_date: form.fund_type === 'grant' ? form.grant_start_date : null,
      grant_end_date: form.fund_type === 'grant' ? form.grant_end_date : null,
    }
    const result = await addFund(payload)
    setSubmitting(false)
    if (result) navigate('/funds')
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Initialize Fund</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Deploy a new fiscal repository for specific resource allocation.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 space-y-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Governance Type *</label>
            <div className="relative group">
              <select value={form.fund_type} onChange={e => setForm({ ...form, fund_type: e.target.value })}
                className="w-full appearance-none bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer">
                {FUND_TYPES.map(t => <option key={t} value={t}>{FUND_LABELS[t]}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary-500 transition-colors">⌄</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Designation / Name *</label>
            <input type="text" required value={form.fund_name} onChange={e => setForm({ ...form, fund_name: e.target.value })}
              placeholder="e.g. DST-NIDHI PRAYAS Grant"
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
          </div>
        </div>

        {form.fund_type === 'grant' && (
          <div className="space-y-8 animate-scale-in p-8 bg-primary-50/30 dark:bg-primary-900/10 rounded-[2rem] border border-primary-100 dark:border-primary-900/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white text-lg">📁</div>
              <h2 className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Grant Specifications</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Awarding Agency</label>
                <input type="text" value={form.grant_agency_name} onChange={e => setForm({ ...form, grant_agency_name: e.target.value })}
                  placeholder="Official Agency Name"
                  className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Total Sanctioned Capital (₹)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-black">₹</span>
                  <input type="number" value={form.grant_total_sanctioned} onChange={e => setForm({ ...form, grant_total_sanctioned: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-gray-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Execution Start Date</label>
                <input type="date" value={form.grant_start_date} onChange={e => setForm({ ...form, grant_start_date: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Termination Date</label>
                <input type="date" value={form.grant_end_date} onChange={e => setForm({ ...form, grant_end_date: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-50 dark:border-slate-700/50">
          <button type="button" onClick={() => navigate('/funds')}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl text-gray-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">
            Abort Initialization
          </button>
          <button type="submit" disabled={submitting}
            className="w-full sm:flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50">
            {submitting ? 'Processing Network...' : 'Confirm & Initialize Fund ⚡'}
          </button>
        </div>
      </form>
    </div>
  )
}
