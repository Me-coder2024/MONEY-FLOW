import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatCurrencyShort, percentage } from '../utils/format'

export default function FoundersList() {
  const { founders: rawFounders, funds, workspaceMembers, addFounder, updateFounder, removeFounder, loading } = useApp()
  const { isOwner } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', equity_percentage: '', total_contributed: 0 })
  const [submitting, setSubmitting] = useState(false)
  
  const [editingFounder, setEditingFounder] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', equity_percentage: '' })
  const [updating, setUpdating] = useState(false)

  // Deduplicate founders by email
  const founders = Array.from(new Map(rawFounders.map(f => [f.email, f])).values())

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
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Founders & Team</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage workspace ownership and access privileges.</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)}
            className={`font-bold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 ${
              showForm 
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300' 
                : 'bg-primary-600 text-white shadow-primary-200 dark:shadow-none'
            }`}>
            {showForm ? '✕ Close Form' : '+ Invite New Founder'}
          </button>
        )}
      </div>

      {/* Add Founder Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-primary-100 dark:border-primary-900/30 p-8 border-t-8 border-t-primary-600 animate-scale-in">
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Expand the Core Team</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Invited members can access all financial records using Google Sign-In.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Legal Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Google Account Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="rahul.founder@gmail.com"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Contact Number (Optional)</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Equity Allocation %</label>
                <input type="number" min="0" max="100" step="0.1" value={form.equity_percentage}
                  onChange={e => setForm({ ...form, equity_percentage: e.target.value })}
                  placeholder="e.g. 25.5"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Initial Buy-in Contribution (₹)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                <input type="number" min="0" value={form.total_contributed || ''}
                  onChange={e => setForm({ ...form, total_contributed: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-gray-900 dark:text-white font-black focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">Automatic deposit will be created in the Sarkari Fund under this founder's name.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-gray-50 dark:border-slate-700/50">
              <button type="submit" disabled={submitting}
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary-200 dark:shadow-none transition-all hover:scale-105 disabled:opacity-50">
                {submitting ? 'Processing Invitation...' : '🤝 Confirm & Invite Founder'}
              </button>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Invitation is immediate. They can login right away.</p>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Founders" value={founders.length} icon="👥" color="text-blue-600" />
        <StatCard label="Total Capital" value={formatCurrencyShort(totalContributed)} icon="💰" color="text-indigo-600" />
        <StatCard label="Public Reserve" value={formatCurrencyShort(sarkariFund?.current_balance || 0)} icon="🏛️" color="text-emerald-600" />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Team Access List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8">
          <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">Active Access ({workspaceMembers.length})</h3>
          
          <div className="space-y-4">
            {workspaceMembers.map(member => (
              <div key={member.id} className="group p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm ${
                      member.role === 'owner' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-primary-600'
                    }`}>
                      {member.member_name?.charAt(0) || member.member_email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[120px]">{member.member_name || 'Unnamed'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{member.member_email}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {member.role === 'owner' ? 'Owner' : 'Founder'}
                  </span>
                </div>
                
                {isOwner && member.role !== 'owner' && (
                  <button onClick={() => {
                    const founder = founders.find(f => f.email === member.member_email)
                    if (founder) removeFounder(founder.id)
                  }}
                    className="w-full mt-2 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-100">
                    Revoke Access
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wealth Distribution Cards */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-2">Contribution Analytics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {founders.map((founder, i) => {
              const pct = totalContributed > 0 ? percentage(parseFloat(founder.total_contributed), totalContributed) : 0
              return (
                <div key={founder.id} 
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 relative group hover:shadow-xl hover:-translate-y-1 transition-all"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {isOwner && (
                    <button onClick={() => { setEditingFounder(founder); setEditForm({ name: founder.name, phone: founder.phone || '', equity_percentage: founder.equity_percentage || 0 }); }}
                      className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                      ✏️
                    </button>
                  )}
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl font-black shadow-inner">
                      {founder.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{founder.name}</h3>
                      <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-0.5">{founder.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Equity Stake</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{founder.equity_percentage}%</p>
                    </div>
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
                      <p className="text-[10px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest mb-1">Contribution</p>
                      <p className="text-2xl font-black text-primary-700 dark:text-primary-400 tracking-tighter">{formatCurrencyShort(founder.total_contributed)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2.5">
                      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Global Capital Share</span>
                      <span className="text-sm font-black text-gray-700 dark:text-slate-300">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {founder.phone && (
                    <div className="mt-8 pt-4 border-t border-gray-50 dark:border-slate-700/50 flex items-center gap-2 text-[11px] font-bold text-gray-400 dark:text-slate-500">
                      <span>📞</span> {founder.phone}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Founder Modal */}
      {editingFounder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in relative border border-white dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Modify Profile</h3>
              <button onClick={() => setEditingFounder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setUpdating(true);
              const updates = {
                name: editForm.name,
                phone: editForm.phone || null,
                equity_percentage: editForm.equity_percentage ? parseFloat(editForm.equity_percentage) : 0
              };
              await updateFounder(editingFounder.id, updates);
              setUpdating(false);
              setEditingFounder(null);
            }} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                <input type="text" required value={editForm.name} onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm(prev => ({...prev, phone: e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Equity stake (%)</label>
                <input type="number" min="0" max="100" step="0.1" value={editForm.equity_percentage}
                  onChange={e => setEditForm(prev => ({...prev, equity_percentage: e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-black focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingFounder(null)} 
                  className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={updating} 
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-200 dark:shadow-none transition-all">
                  {updating ? 'Saving...' : 'Update Founder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 border-l-4 border-l-primary-500">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  )
}
