'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  empresa: any | null
  motorista: any | null
  admin: any | null
  userType: 'empresa' | 'motorista' | 'admin' | null
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [empresa, setEmpresa] = useState<any | null>(null)
  const [motorista, setMotorista] = useState<any | null>(null)
  const [admin, setAdmin] = useState<any | null>(null)

  const loadUserData = async (userId: string) => {
    try {
      // Verificar se há sessão antes de fazer queries
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Sem sessão, limpar dados
        setEmpresa(null)
        setMotorista(null)
        setAdmin(null)
        return
      }

      // Fazer queries sequenciais para evitar problemas de RLS e recursão
      // Primeiro verificar empresas
      const empresaRes = await supabase.from('empresas').select('*').eq('id', userId).single()
      
      // Se não for empresa, verificar motorista
      let motoristaRes = { data: null, error: null }
      if (!empresaRes.data || empresaRes.error) {
        motoristaRes = await supabase.from('motoristas').select('*, tablets(*)').eq('id', userId).single()
      }
      
      // Se não for motorista nem empresa, verificar admin (só se não houver erro 500)
      let adminRes = { data: null, error: null }
      if ((!empresaRes.data || empresaRes.error) && (!motoristaRes.data || motoristaRes.error)) {
        // Tentar buscar admin apenas se não houver erro 500 (recursão)
        try {
          adminRes = await supabase.from('admins').select('*').eq('id', userId).eq('ativo', true).single()
        } catch (adminErr: any) {
          // Ignorar erros de recursão (500)
          if (adminErr?.message?.includes('recursion') || adminErr?.status === 500) {
            console.warn('Erro de recursão ao buscar admin - execute SQL_FIX_RECURSION_ADMINS.sql')
            adminRes = { data: null, error: adminErr }
          } else {
            adminRes = { data: null, error: adminErr }
          }
        }
      }

      // Ignorar erros 406 (Not Acceptable) que ocorrem quando RLS bloqueia
      if (empresaRes.data && !empresaRes.error) {
        setEmpresa(empresaRes.data)
        setMotorista(null)
        setAdmin(null)
      } else if (motoristaRes.data && !motoristaRes.error) {
        setMotorista(motoristaRes.data)
        setEmpresa(null)
        setAdmin(null)
      } else if (adminRes.data && !adminRes.error) {
        setAdmin(adminRes.data)
        setEmpresa(null)
        setMotorista(null)
      } else {
        // Nenhum tipo de usuário encontrado
        setEmpresa(null)
        setMotorista(null)
        setAdmin(null)
      }
    } catch (err: any) {
      // Ignorar erros de RLS quando não há sessão
      if (err?.message?.includes('session') || err?.message?.includes('406')) {
        setEmpresa(null)
        setMotorista(null)
        setAdmin(null)
        return
      }
      console.error('Error loading user data:', err)
      setEmpresa(null)
      setMotorista(null)
      setAdmin(null)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          setLoading(false)
          return
        }
        
        setUser(user)
        
        if (user) {
          await loadUserData(user.id)
        } else {
          setEmpresa(null)
          setMotorista(null)
          setAdmin(null)
        }
      } catch (err) {
        console.error('Error in checkUser:', err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setEmpresa(null)
          setMotorista(null)
          setAdmin(null)
        }
      } catch (err) {
        console.error('Error in auth state change:', err)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEmpresa(null)
    setMotorista(null)
    setAdmin(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const refreshUser = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  const userType = empresa ? 'empresa' : motorista ? 'motorista' : admin ? 'admin' : null

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        empresa,
        motorista,
        admin,
        userType,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

