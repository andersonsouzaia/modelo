'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { DataTable } from '@/components/dashboard/DataTable'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { useState } from 'react'
import { Activity, User, Calendar } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/validations'

export default function AdminActivityLogsPage() {
  const [search, setSearch] = useState('')
  const [filtroEntidade, setFiltroEntidade] = useState('')
  const [filtroAcao, setFiltroAcao] = useState('')
  
  const { logs, loading } = useActivityLogs({
    entidade: filtroEntidade || undefined,
    acao: filtroAcao || undefined,
    limit: 100,
  })

  const filteredLogs = logs.filter(log => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        log.acao?.toLowerCase().includes(searchLower) ||
        log.descricao?.toLowerCase().includes(searchLower) ||
        log.user?.nome?.toLowerCase().includes(searchLower) ||
        log.user?.email?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const entidades = Array.from(new Set(logs.map(l => l.entidade).filter(Boolean)))
  const acoes = Array.from(new Set(logs.map(l => l.acao).filter(Boolean)))

  const handleClear = () => {
    setSearch('')
    setFiltroEntidade('')
    setFiltroAcao('')
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Atividade</h1>
          <p className="text-gray-600 mt-1">Histórico de todas as ações no sistema</p>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              label: 'Entidade',
              value: filtroEntidade,
              options: [
                { value: '', label: 'Todas' },
                ...entidades.map(e => ({ value: e!, label: e! })),
              ],
              onChange: setFiltroEntidade,
            },
            {
              label: 'Ação',
              value: filtroAcao,
              options: [
                { value: '', label: 'Todas' },
                ...acoes.map(a => ({ value: a!, label: a! })),
              ],
              onChange: setFiltroAcao,
            },
          ]}
          onClear={handleClear}
        />

        {/* Logs List */}
        <DataTable
          data={filteredLogs}
          loading={loading}
          columns={[
            {
              header: 'Usuário',
              accessor: (row) => (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{row.user?.nome || row.user?.email || 'Sistema'}</span>
                </div>
              ),
            },
            {
              header: 'Ação',
              accessor: 'acao',
              className: 'font-medium',
            },
            {
              header: 'Entidade',
              accessor: (row) => row.entidade || 'N/A',
            },
            {
              header: 'Descrição',
              accessor: 'descricao',
            },
            {
              header: 'Data/Hora',
              accessor: (row) => formatDateTime(row.created_at),
            },
          ]}
          emptyMessage="Nenhum log encontrado"
        />
      </div>
    </DashboardLayout>
  )
}

