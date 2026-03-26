import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate } from '../utils/format'
import { FUND_COLORS } from '../utils/constants'
import { uploadToCloudinary } from '../utils/cloudinary'

export default function DepositsList() {
  const { deposits, updateDeposit, removeDeposit, loading } = useApp()
  const { isOwner } = useAuth()

  const [editingDeposit, setEditingDeposit] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [proofFile, setProofFile] = useState(null)
  const [updating, setUpdating] = useState(false)
  const fileInputRef = useRef(null)

  const handleEditClick = (dep) => {
    setEditingDeposit(dep)
    setEditForm({
      amount: dep.amount,
      deposit_date: dep.deposit_date,
      source_description: dep.source_description || '',
      reference_number: dep.reference_number || '',
      proof_document_url: dep.proof_document_url || ''
    })
    setProofFile(null)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    let url = editForm.proof_document_url
    if (proofFile) {
      try {
        url = await uploadToCloudinary(proofFile)
      } catch(err) {
        alert('Failed to upload proof.')
        setUpdating(false)
        return
      }
    }
    
    await updateDeposit(editingDeposit.id, {
      amount: parseFloat(editForm.amount),
      deposit_date: editForm.deposit_date,
      source_description: editForm.source_description,
      reference_number: editForm.reference_number,
      proof_document_url: url
    })
    setUpdating(false)
    setEditingDeposit(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deposit? This will securely revert the Fund balance and Founder contribution to match.')) {
      await removeDeposit(id)
    }
  }

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl" />

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Deposits</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Founders' contributions and fund top-ups</p>
        </div>
        <Link to="/deposits/new"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:scale-105 text-center">
          + Record New Deposit
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700/50">
                <th className="text-left py-4 px-6">Date</th>
                <th className="text-left py-4 px-4 whitespace-nowrap">Target Fund</th>
                <th className="text-left py-4 px-4 w-1/4">Source Details</th>
                <th className="text-left py-4 px-4">Contributor</th>
                <th className="text-center py-4 px-4">Proof</th>
                <th className="text-right py-4 px-4">Amount</th>
                <th className="text-left py-4 px-6">Reference</th>
                {isOwner && <th className="text-right py-4 px-6">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {deposits.map(dep => {
                const fundColor = FUND_COLORS[dep.funds?.fund_type]
                return (
                  <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="py-4 px-6 text-gray-500 dark:text-slate-400 font-mono text-xs">{formatDate(dep.deposit_date)}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'} dark:bg-slate-900/40`}>
                        {dep.funds?.fund_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-slate-200 font-medium max-w-48 truncate">{dep.source_description}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-slate-300 font-semibold">{dep.founders?.name || '—'}</td>
                    <td className="py-4 px-4 text-center">
                      {dep.proof_document_url ? (
                        <a href={dep.proof_document_url} target="_blank" rel="noopener noreferrer" 
                          className="w-8 h-8 inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-transform" title="View Document">
                          📄
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(dep.amount)}</td>
                    <td className="py-4 px-6 text-gray-400 dark:text-slate-500 font-mono text-[10px] tracking-tight">{dep.reference_number || 'NA'}</td>
                    {isOwner && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(dep)} 
                            className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(dep.id)} 
                            className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {deposits.length === 0 && (
          <div className="p-20 text-center">
            <span className="text-4xl">📥</span>
            <p className="text-gray-400 dark:text-slate-500 mt-4 font-medium uppercase tracking-widest text-xs">No deposits found</p>
          </div>
        )}
      </div>

      {/* Edit Deposit Modal */}
      {editingDeposit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto border border-white dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit Transaction</h3>
              <button onClick={() => setEditingDeposit(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Deposit Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" min="1" step="0.01" required value={editForm.amount} onChange={e => setEditForm(prev => ({...prev, amount: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Date</label>
                  <input type="date" required value={editForm.deposit_date} onChange={e => setEditForm(prev => ({...prev, deposit_date: e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Source / Note</label>
                  <input type="text" value={editForm.source_description} onChange={e => setEditForm(prev => ({...prev, source_description: e.target.value}))}
                    placeholder="e.g. UPI from Founder"
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Ref ID / Transaction No</label>
                  <input type="text" value={editForm.reference_number} onChange={e => setEditForm(prev => ({...prev, reference_number: e.target.value}))}
                    placeholder="e.g. T250326..."
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Payment Proof (Replacement)</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-all bg-gray-50/50 dark:bg-slate-900/20" 
                  onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={e => { if(e.target.files[0]) setProofFile(e.target.files[0]) }} />
                  {proofFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📄</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">{proofFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl opacity-50">📤</span>
                      <span className="text-xs font-bold text-gray-400 dark:text-slate-500">Tap to upload proof image/PDF</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingDeposit(null)} 
                  className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={updating} 
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-200 dark:shadow-none transition-all disabled:opacity-50">
                  {updating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Saving...
                    </span>
                  ) : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
