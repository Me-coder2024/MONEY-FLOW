import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { user, workspaceId, workspaceRole } = useAuth()

  const [funds, setFunds] = useState([])
  const [founders, setFounders] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUser = { name: user?.displayName || 'User', role: workspaceRole, email: user?.email }
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const fetchAll = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return }
    setLoading(true)
    try {
      const [fundsRes, foundersRes, depositsRes, withdrawalsRes, auditRes, membersRes] = await Promise.all([
        supabase.from('funds').select('*').eq('user_id', workspaceId).order('id'),
        supabase.from('founders').select('*').eq('user_id', workspaceId).order('id'),
        supabase.from('deposits').select('*, funds(fund_name, fund_type), founders(name)').eq('user_id', workspaceId).order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*, funds(fund_name, fund_type)').eq('user_id', workspaceId).order('created_at', { ascending: false }),
        supabase.from('audit_log').select('*').eq('user_id', workspaceId).order('created_at', { ascending: false }).limit(100),
        supabase.from('workspace_members').select('*').eq('workspace_id', workspaceId).order('joined_at'),
      ])

      if (fundsRes.data) setFunds(fundsRes.data)
      if (foundersRes.data) setFounders(foundersRes.data)
      if (depositsRes.data) setDeposits(depositsRes.data)
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data)
      if (auditRes.data) setAuditLog(auditRes.data)
      if (membersRes.data) setWorkspaceMembers(membersRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      addToast('Error loading data', 'error')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  // --- FUND OPERATIONS ---
  const addFund = async (fund) => {
    const { data, error } = await supabase.from('funds').insert({ ...fund, user_id: workspaceId }).select().single()
    if (error) { addToast(error.message, 'error'); return null }
    setFunds(prev => [...prev, data])
    addToast('Fund created successfully')
    return data
  }

  // --- DEPOSIT OPERATIONS ---
  const addDeposit = async (deposit) => {
    const { data, error } = await supabase.from('deposits').insert({ ...deposit, user_id: workspaceId }).select('*, funds(fund_name, fund_type), founders(name)').single()
    if (error) { addToast(error.message, 'error'); return null }
    const fund = funds.find(f => f.id === deposit.fund_id)
    if (fund) {
      const newBalance = parseFloat(fund.current_balance) + parseFloat(deposit.amount)
      const newDeposited = parseFloat(fund.total_deposited) + parseFloat(deposit.amount)
      await supabase.from('funds').update({ current_balance: newBalance, total_deposited: newDeposited }).eq('id', deposit.fund_id)
    }
    if (deposit.founder_id) {
      const founder = founders.find(f => f.id === deposit.founder_id)
      if (founder) {
        await supabase.from('founders').update({ total_contributed: parseFloat(founder.total_contributed) + parseFloat(deposit.amount) }).eq('id', deposit.founder_id)
      }
    }
    await supabase.from('audit_log').insert({
      action: 'deposit', table_affected: 'deposits', record_id: data.id,
      performed_by: currentUser.name, new_value: { amount: deposit.amount }, user_id: workspaceId,
    })
    await fetchAll()
    addToast('Deposit recorded successfully')
    return data
  }

  // --- WITHDRAWAL OPERATIONS ---
  const addWithdrawal = async (withdrawal) => {
    const { data, error } = await supabase.from('withdrawals').insert({ ...withdrawal, user_id: workspaceId }).select('*, funds(fund_name, fund_type)').single()
    if (error) { addToast(error.message, 'error'); return null }
    await supabase.from('audit_log').insert({
      action: 'withdrawal', table_affected: 'withdrawals', record_id: data.id,
      performed_by: currentUser.name, new_value: { amount: withdrawal.total_amount, purpose: withdrawal.purpose }, user_id: workspaceId,
    })
    await fetchAll()
    addToast('Withdrawal request submitted')
    return data
  }

  const approveWithdrawal = async (id, remarks = '') => {
    const w = withdrawals.find(w => w.id === id)
    if (!w) return
    const { error } = await supabase.from('withdrawals').update({
      approval_status: 'approved', approved_by: currentUser.name, remarks,
    }).eq('id', id)
    if (error) { addToast(error.message, 'error'); return }
    const fund = funds.find(f => f.id === w.fund_id)
    if (fund) {
      const newBalance = parseFloat(fund.current_balance) - parseFloat(w.total_amount)
      const newSpent = parseFloat(fund.total_spent) + parseFloat(w.total_amount)
      await supabase.from('funds').update({ current_balance: newBalance, total_spent: newSpent }).eq('id', w.fund_id)
    }
    await fetchAll()
    addToast('Withdrawal approved')
  }

  const rejectWithdrawal = async (id, remarks = '') => {
    const { error } = await supabase.from('withdrawals').update({
      approval_status: 'rejected', approved_by: currentUser.name, remarks,
    }).eq('id', id)
    if (error) { addToast(error.message, 'error'); return }
    await fetchAll()
    addToast('Withdrawal rejected')
  }

  // --- FOUNDER OPERATIONS ---
  const addFounder = async (founder) => {
    // 1. Add to founders table
    const { data, error } = await supabase.from('founders').insert({ ...founder, user_id: workspaceId }).select().single()
    if (error) { addToast(error.message, 'error'); return null }

    // 2. Add to workspace_members so they can access this workspace when they log in
    const { error: memberError } = await supabase.from('workspace_members').upsert({
      workspace_id: workspaceId,
      member_email: founder.email,
      member_name: founder.name,
      role: 'founder',
    }, { onConflict: 'workspace_id,member_email' })

    if (memberError) console.error('Error adding workspace member:', memberError)

    await supabase.from('audit_log').insert({
      action: 'deposit', table_affected: 'founders', record_id: data.id,
      performed_by: currentUser.name, new_value: { name: founder.name, email: founder.email }, user_id: workspaceId,
    })

    await fetchAll()
    addToast(`${founder.name} added as founder! They can now log in with ${founder.email} to access this dashboard.`)
    return data
  }

  const removeFounder = async (id) => {
    const founder = founders.find(f => f.id === id)
    if (!founder) return

    // Remove from workspace_members
    await supabase.from('workspace_members').delete()
      .eq('workspace_id', workspaceId)
      .eq('member_email', founder.email)
      .neq('role', 'owner')

    // Remove from founders table
    const { error } = await supabase.from('founders').delete().eq('id', id)
    if (error) { addToast(error.message, 'error'); return }

    await fetchAll()
    addToast(`${founder.name} removed from team`)
  }

  // --- COMPUTED VALUES ---
  const totalBalance = funds.reduce((s, f) => s + parseFloat(f.current_balance || 0), 0)
  const pendingWithdrawals = withdrawals.filter(w => w.approval_status === 'pending')
  const approvedWithdrawals = withdrawals.filter(w => w.approval_status === 'approved')

  const getBurnRate = () => {
    const approved = approvedWithdrawals
    if (approved.length === 0) return { monthly: 0, runway: Infinity }
    const dates = approved.map(w => new Date(w.spent_date || w.created_at))
    const earliest = new Date(Math.min(...dates))
    const latest = new Date(Math.max(...dates))
    const months = Math.max(1, (latest - earliest) / (1000 * 60 * 60 * 24 * 30))
    const totalSpent = approved.reduce((s, w) => s + parseFloat(w.total_amount || 0), 0)
    const monthly = totalSpent / months
    const runway = monthly > 0 ? totalBalance / monthly : Infinity
    return { monthly, runway }
  }

  const getCategoryBreakdown = () => {
    const breakdown = {}
    const approved = approvedWithdrawals
    const total = approved.reduce((s, w) => s + parseFloat(w.total_amount || 0), 0)
    approved.forEach(w => {
      const cat = w.category || 'miscellaneous'
      breakdown[cat] = (breakdown[cat] || 0) + parseFloat(w.total_amount || 0)
    })
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
  }

  const getComplianceScore = () => {
    const grantWithdrawals = approvedWithdrawals.filter(w => {
      const fund = funds.find(f => f.id === w.fund_id)
      return fund?.fund_type === 'grant'
    })
    if (grantWithdrawals.length === 0) return { billRate: 100, verifiedRate: 100, completenessRate: 100, overall: 100, total: 0, missing: 0 }
    const total = grantWithdrawals.length
    const withBill = grantWithdrawals.filter(w => w.bill_document_url).length
    const withGstin = grantWithdrawals.filter(w => w.vendor_gstin).length
    const complete = grantWithdrawals.filter(w => w.bill_number && w.vendor_name && w.bill_date).length
    const billRate = (withBill / total) * 100
    const verifiedRate = (withGstin / total) * 100
    const completenessRate = (complete / total) * 100
    const overall = (billRate + verifiedRate + completenessRate) / 3
    return { billRate, verifiedRate, completenessRate, overall, total, missing: total - withBill }
  }

  const value = {
    funds, founders, deposits, withdrawals, auditLog, workspaceMembers,
    loading, currentUser, toasts, workspaceId,
    addFund, addDeposit, addWithdrawal, approveWithdrawal, rejectWithdrawal,
    addFounder, removeFounder,
    fetchAll, addToast,
    totalBalance, pendingWithdrawals, approvedWithdrawals,
    getBurnRate, getCategoryBreakdown, getComplianceScore,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
