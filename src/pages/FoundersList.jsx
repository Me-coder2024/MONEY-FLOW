import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatCurrencyShort, percentage } from '../utils/format'

export default function FoundersList() {
  const { founders, funds, workspaceMembers, addFounder, removeFounder, loading } = useApp()
  const { isOwner } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', equity_percentage: '', total_contributed: 0 })
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />

  const sarkariFund = funds.find(f => f.fund_type === 'sarkari')
  const totalContributed = founders.reduce((s, f) => s + parseFloat(f.total_contributed || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSubmitting(true)
    const result = await addFounder({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      equity_percentage: form.equity_percentage ? parseFloat(form.equity_percentage) : 0,
      total_contributed: 0,
      initial_contribution: form.total_contributed ? parseFloat(form.total_contributed) : 0,
    })
    setSubmitting(false)
    if (result) {
      setForm({ name: '', email: '', phone: '', equity_percentage: '', total_contributed: 0 })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Founders & Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members who can access this dashboard</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md">
            {showForm ? '✕ Cancel' : '+ Add Founder'}
          </button>
        )}
      </div>

      {/* Add Founder Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-primary-500 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Invite a Founder</h3>
          <p className="text-sm text-gray-500 mb-5">They will be able to log in with Google using their email and see this same dashboard.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Rahul Sharma"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g., rahul@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Must be the same email they use for Google Sign-In</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 99999 99999"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equity % (Optional)</label>
                <input type="number" min="0" max="100" step="0.1" value={form.equity_percentage}
                  onChange={e => setForm({ ...form, equity_percentage: e.target.value })}
                  placeholder="e.g., 25"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Contribution Amount (₹, Optional)</label>
              <input type="number" min="0" value={form.total_contributed || ''}
                onChange={e => setForm({ ...form, total_contributed: e.target.value })}
                placeholder="e.g., 50000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              <p className="text-xs text-gray-400 mt-1">This amount will be automatically deposited into the Sarkari Fund.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>How it works:</strong> Once added, this person can sign in at this same URL with their Google account ({form.email || 'their email'}).
                They'll see the exact same dashboard, funds, and transactions.
              </p>
            </div>
            <button type="submit" disabled={submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50">
              {submitting ? 'Adding...' : '🤝 Add Founder & Grant Access'}
            </button>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 border-l-4 border-blue-500">
          <p className="text-xs text-gray-400 uppercase font-medium">Total Founders</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{founders.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 border-l-4 border-blue-500">
          <p className="text-xs text-gray-400 uppercase font-medium">Total Contributed</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{formatCurrencyShort(totalContributed)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 border-l-4 border-blue-500">
          <p className="text-xs text-gray-400 uppercase font-medium">Sarkari Fund Balance</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{formatCurrencyShort(sarkariFund?.current_balance || 0)}</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Team Members ({workspaceMembers.length})</h3>
        {workspaceMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">👥</span>
            <p>No team members yet. Add a founder to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workspaceMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    member.role === 'owner' ? 'gradient-indigo' : 'gradient-blue'
                  }`}>
                    {member.member_name?.charAt(0) || member.member_email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{member.member_name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-400">{member.member_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {member.role === 'owner' ? '👑 Owner' : '🤝 Founder'}
                  </span>
                  {isOwner && member.role !== 'owner' && (
                    <button onClick={() => {
                      const founder = founders.find(f => f.email === member.member_email)
                      if (founder) removeFounder(founder.id)
                    }}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Founder Cards with Financial Details */}
      {founders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {founders.map(founder => {
            const pct = totalContributed > 0 ? percentage(parseFloat(founder.total_contributed), totalContributed) : 0
            return (
              <div key={founder.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-blue flex items-center justify-center text-white text-lg font-bold">
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{founder.name}</h3>
                    <p className="text-xs text-gray-400">{founder.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase">Equity</p>
                    <p className="text-lg font-bold text-gray-800">{founder.equity_percentage}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase">Contributed</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrencyShort(founder.total_contributed)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Contribution share</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {founder.phone && <p className="text-xs text-gray-400 mt-3">📞 {founder.phone}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
