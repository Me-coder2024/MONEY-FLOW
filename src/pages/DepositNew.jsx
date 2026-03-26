import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FUND_LABELS } from '../utils/constants'
import { formatCurrency } from '../utils/format'

export default function DepositNew() {
  const { funds, founders, addDeposit } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fund_id: '', founder_id: '', amount: '', deposit_date: new Date().toISOString().split('T')[0],
    reference_number: '', source_description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedFund = funds.find(f => f.id === parseInt(form.fund_id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...form,
      fund_id: parseInt(form.fund_id),
      founder_id: form.founder_id ? parseInt(form.founder_id) : null,
      amount: parseFloat(form.amount),
    }
    const result = await addDeposit(payload)
    setSubmitting(false)
    if (result) navigate('/deposits')
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Record New Deposit</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fund *</label>
          <select required value={form.fund_id} onChange={e => setForm({ ...form, fund_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
            <option value="">Select fund...</option>
            {funds.map(f => <option key={f.id} value={f.id}>{f.fund_name} ({FUND_LABELS[f.fund_type]})</option>)}
          </select>
        </div>

        {selectedFund?.fund_type === 'sarkari' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founder</label>
            <select value={form.founder_id} onChange={e => setForm({ ...form, founder_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="">Select founder...</option>
              {founders.map(f => <option key={f.id} value={f.id}>{f.name} ({f.equity_percentage}%)</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" required min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" required value={form.deposit_date} onChange={e => setForm({ ...form, deposit_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })}
            placeholder="e.g., DEP-004"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source Description</label>
          <textarea rows={3} value={form.source_description} onChange={e => setForm({ ...form, source_description: e.target.value })}
            placeholder="Describe the source of this deposit..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/deposits')}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50">
            {submitting ? 'Recording...' : 'Record Deposit'}
          </button>
        </div>
      </form>
    </div>
  )
}
