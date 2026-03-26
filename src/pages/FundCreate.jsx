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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Fund</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fund Type *</label>
          <select value={form.fund_type} onChange={e => setForm({ ...form, fund_type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
            {FUND_TYPES.map(t => <option key={t} value={t}>{FUND_LABELS[t]}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fund Name *</label>
          <input type="text" required value={form.fund_name} onChange={e => setForm({ ...form, fund_name: e.target.value })}
            placeholder="e.g., DST-NIDHI PRAYAS Grant"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>

        {form.fund_type === 'grant' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grant Agency Name</label>
              <input type="text" value={form.grant_agency_name} onChange={e => setForm({ ...form, grant_agency_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={form.grant_start_date} onChange={e => setForm({ ...form, grant_start_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={form.grant_end_date} onChange={e => setForm({ ...form, grant_end_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Sanctioned Amount (₹)</label>
              <input type="number" value={form.grant_total_sanctioned} onChange={e => setForm({ ...form, grant_total_sanctioned: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/funds')}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Fund'}
          </button>
        </div>
      </form>
    </div>
  )
}
