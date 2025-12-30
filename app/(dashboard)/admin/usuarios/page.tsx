'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Building2, Car, Shield, UserCheck, UserX } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (filtroTipo !== 'todos') {
          query = query.eq('tipo', filtroTipo)
        }

        const { data, error } = await query
        if (error) throw error
        setUsuarios(data || [])
      } catch (err: any) {
        console.error('Erro ao carregar usuários:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsuarios()
  }, [filtroTipo])

  const usuariosEmpresa = usuarios.filter(u => u.tipo === 'empresa').length
  const usuariosMotorista = usuarios.filter(u => u.tipo === 'motorista').length
  const usuariosAdmin = usuarios.filter(u => u.tipo === 'admin').length
  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'empresa':
        return <Building2 className="w-4 h-4" />
      case 'motorista':
        return <Car className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      ativo: 'success',
      inativo: 'info',
      bloqueado: 'error',
      suspenso: 'warning',
    }
    return <Badge variant={statusMap[status] || 'info'}>{status}</Badge>
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os usuários cadastrados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Usuários"
            value={usuarios.length}
            icon={Users}
          />
          <StatCard
            title="Empresas"
            value={usuariosEmpresa}
            icon={Building2}
          />
          <StatCard
            title="Motoristas"
            value={usuariosMotorista}
            icon={Car}
          />
          <StatCard
            title="Usuários Ativos"
            value={usuariosAtivos}
            icon={UserCheck}
          />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none"
            >
              <option value="todos">Todos</option>
              <option value="empresa">Empresas</option>
              <option value="motorista">Motoristas</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Usuários List */}
        <DataTable
          data={usuarios}
          loading={loading}
          columns={[
            {
              header: 'Nome',
              accessor: (row) => (
                <div className="flex items-center space-x-2">
                  {getTipoIcon(row.tipo)}
                  <span className="font-medium">{row.nome || row.email}</span>
                </div>
              ),
            },
            {
              header: 'Email',
              accessor: 'email',
            },
            {
              header: 'Tipo',
              accessor: (row) => (
                <span className="capitalize"><Badge variant="info">{row.tipo}</Badge></span>
              ),
            },
            {
              header: 'Status',
              accessor: (row) => getStatusBadge(row.status),
            },
            {
              header: 'Criado em',
              accessor: (row) => formatDate(row.created_at),
            },
          ]}
          emptyMessage="Nenhum usuário encontrado"
        />
      </div>
    </DashboardLayout>
  )
}

