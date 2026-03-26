import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../lib/firebase'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState(null)
  const [workspaceRole, setWorkspaceRole] = useState('owner')

  // Resolve which workspace this user belongs to
  const resolveWorkspace = async (firebaseUser) => {
    if (!firebaseUser) {
      setWorkspaceId(null)
      setWorkspaceRole('owner')
      return
    }

    const email = firebaseUser.email

    // 1. Check if this email was invited to any workspace
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('member_email', email)
      .neq('role', 'owner')
      .limit(1)
      .maybeSingle()

    if (membership) {
      // User was invited — use that workspace
      setWorkspaceId(membership.workspace_id)
      setWorkspaceRole(membership.role)
      return
    }

    // 2. Check if this user already owns a workspace
    const { data: ownership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', firebaseUser.uid)
      .eq('role', 'owner')
      .limit(1)
      .maybeSingle()

    if (ownership) {
      setWorkspaceId(firebaseUser.uid)
      setWorkspaceRole('owner')

      // Self-heal: Ensure owner is in founders table
      const { data: founderCheck } = await supabase.from('founders').select('id').eq('email', email).eq('user_id', firebaseUser.uid).maybeSingle()
      if (!founderCheck) {
        await supabase.from('founders').insert({
          user_id: firebaseUser.uid,
          name: ownership.member_name || firebaseUser.displayName || email.split('@')[0],
          email: email,
          equity_percentage: 100,
        })
      }
      return
    }

    // 3. First time user — create their workspace (add themselves as owner)
    await supabase.from('workspace_members').insert({
      workspace_id: firebaseUser.uid,
      member_email: email,
      member_name: firebaseUser.displayName || '',
      role: 'owner',
    })
    
    // Auto-add owner to founders
    await supabase.from('founders').insert({
      user_id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0],
      email: email,
      equity_percentage: 100,
    })

    setWorkspaceId(firebaseUser.uid)
    setWorkspaceRole('owner')
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await resolveWorkspace(firebaseUser)
      } else {
        setWorkspaceId(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await resolveWorkspace(result.user)
      return result.user
    } catch (error) {
      console.error('Google Sign-In error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setWorkspaceId(null)
      setWorkspaceRole('owner')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    workspaceId,
    workspaceRole,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    isOwner: workspaceRole === 'owner',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
