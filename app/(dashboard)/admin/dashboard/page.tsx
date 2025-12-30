'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shield, LogOut, Tablet, Building2, Car, Image, TrendingUp } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { admin, logout, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    empresas: 0,
    motoristas: 0,
    tablets: 0,
    campanhas: 0,
    empresasPendentes: 0,
    motoristasPendentes: 0,
    midiasPendentes: 0,
  })

  useEffect(() => {
    if (admin) {
      loadStats()
    }
  }, [admin])

  const loadStats = async () => {
    const [empresas, motoristas, tablets, campanhas, empresasPendentes, motoristasPendentes, midiasPendentes] = await Promise.all([
      supabase.from('empresas').select('id', { count: 'exact', head: true }),
      supabase.from('motoristas').select('id', { count: 'exact', head: true }),
      supabase.from('tablets').select('id', { count: 'exact', head: true }),
      supabase.from('campanhas').select('id', { count: 'exact', head: true }),
      supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('status', 'aguardando_aprovacao'),
      supabase.from('motoristas').select('id', { count: 'exact', head: true }).eq('status', 'aguardando_aprovacao'),
      supabase.from('midias').select('id', { count: 'exact', head: true }).eq('status', 'em_analise'),
    ])

    setStats({
      empresas: empresas.count || 0,
      motoristas: motoristas.count || 0,
      tablets: tablets.count || 0,
      campanhas: campanhas.count || 0,
      empresasPendentes: empresasPendentes.count || 0,
      motoristasPendentes: motoristasPendentes.count || 0,
      midiasPendentes: midiasPendentes.count || 0,
    })
  }

  if (authLoading) {
    return <Loading fullScreen text="Carregando..." />
  }

  if (!admin) {
    router.push('/login-admin')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-light p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Movello Admin</h1>
                <p className="text-sm text-gray-600">Painel Administrativo</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Empresas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.empresas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Motoristas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.motoristas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Tablet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tablets</p>
                <p className="text-2xl font-bold text-gray-800">{stats.tablets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Image className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Campanhas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.campanhas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Pendências */}
        {(stats.empresasPendentes > 0 || stats.motoristasPendentes > 0 || stats.midiasPendentes > 0) && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Aprovações Pendentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.empresasPendentes > 0 && (
                <Link href="/admin/empresas" className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-yellow-800">{stats.empresasPendentes}</p>
                  <p className="text-sm text-yellow-600">Empresas aguardando</p>
                </Link>
              )}
              {stats.motoristasPendentes > 0 && (
                <Link href="/admin/motoristas" className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-yellow-800">{stats.motoristasPendentes}</p>
                  <p className="text-sm text-yellow-600">Motoristas aguardando</p>
                </Link>
              )}
              {stats.midiasPendentes > 0 && (
                <Link href="/admin/midias" className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-yellow-800">{stats.midiasPendentes}</p>
                  <p className="text-sm text-yellow-600">Mídias aguardando</p>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Menu de Gestão */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/empresas" className="bg-white border-2 border-primary-light hover:border-primary rounded-lg p-6 text-left transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestão de Empresas</h3>
                <p className="text-sm text-gray-600">Aprovar e gerenciar empresas</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/motoristas" className="bg-white border-2 border-primary-light hover:border-primary rounded-lg p-6 text-left transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestão de Motoristas</h3>
                <p className="text-sm text-gray-600">Aprovar e gerenciar motoristas</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/midias" className="bg-white border-2 border-primary-light hover:border-primary rounded-lg p-6 text-left transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Image className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestão de Mídias</h3>
                <p className="text-sm text-gray-600">Aprovar anúncios</p>
              </div>
            </div>
          </Link>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6 text-left">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Tablet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestão de Tablets</h3>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6 text-left">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Dashboard Financeiro</h3>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

