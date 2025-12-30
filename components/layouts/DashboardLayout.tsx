'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/Loading'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  userType: 'empresa' | 'motorista' | 'admin'
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const { user, loading, empresa, motorista, admin } = useAuth()
  const router = useRouter()

  if (loading) {
    return <Loading fullScreen text="Carregando..." />
  }

  // Verificar autenticação
  if (!user) {
    router.push('/')
    return null
  }

  // Verificar tipo de usuário
  const hasAccess = 
    (userType === 'empresa' && empresa) ||
    (userType === 'motorista' && motorista) ||
    (userType === 'admin' && admin)

  if (!hasAccess) {
    router.push('/')
    return null
  }

  const profileData = empresa || motorista || admin

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userType={userType} />
      <div className="lg:pl-64">
        <Header 
          userType={userType}
          profileData={profileData}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}




