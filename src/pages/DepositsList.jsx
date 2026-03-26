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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
          <p className="text-sm text-gray-500 mt-1">{deposits.length} total deposits recorded</p>
        </div>
        <Link to="/deposits/new"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md">
          + New Deposit
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left py-3 px-6">Date</th>
              <th className="text-left py-3 px-4">Fund</th>
              <th className="text-left py-3 px-4">Source</th>
              <th className="text-left py-3 px-4">Founder</th>
              <th className="text-center py-3 px-4">Proof</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-left py-3 px-6">Reference</th>
              {isOwner && <th className="text-right py-3 px-6">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deposits.map(dep => {
              const fundColor = FUND_COLORS[dep.funds?.fund_type]
              return (
                <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-gray-500">{formatDate(dep.deposit_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${fundColor?.light || 'bg-gray-100'} ${fundColor?.text || 'text-gray-700'}`}>
                      {dep.funds?.fund_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-48 truncate">{dep.source_description}</td>
                  <td className="py-3 px-4 text-gray-600">{dep.founders?.name || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    {dep.proof_document_url ? (
                      <a href={dep.proof_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80" title="View Proof">
                        📄
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCurrency(dep.amount)}</td>
                  <td className="py-3 px-6 text-gray-400 font-mono text-xs">{dep.reference_number}</td>
                  {isOwner && (
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(dep)} className="text-xs font-semibold text-gray-500 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 px-2 py-1 rounded-md transition-colors">Edit</button>
                        <button onClick={() => handleDelete(dep.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Deposit Modal */}
      {editingDeposit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Deposit</h3>
            <form onSubmit={handleUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input type="number" min="1" step="0.01" required value={editForm.amount} onChange={e => setEditForm(prev => ({...prev, amount: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={editForm.deposit_date} onChange={e => setEditForm(prev => ({...prev, deposit_date: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Description</label>
                <input type="text" value={editForm.source_description} onChange={e => setEditForm(prev => ({...prev, source_description: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input type="text" value={editForm.reference_number} onChange={e => setEditForm(prev => ({...prev, reference_number: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Proof (Optional)</label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={e => { if(e.target.files[0]) setProofFile(e.target.files[0]) }} />
                  {proofFile ? <span className="text-emerald-600 text-sm font-medium">{proofFile.name}</span> : <span className="text-gray-500 text-sm">Click to upload new proof file</span>}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setEditingDeposit(null)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
