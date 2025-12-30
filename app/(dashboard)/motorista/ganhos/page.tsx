'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useGanhosMotorista } from '@/hooks/useGanhosMotorista'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DollarSign, TrendingUp, Calendar, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/validations'

export default function MotoristaGanhosPage() {
  const { motorista } = useAuth()
  const { ganhos, stats, loading } = useGanhosMotorista(motorista?.id)

  return (
    <DashboardLayout userType="motorista">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Ganhos</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus ganhos diários e mensais</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Ganhos Hoje"
            value={formatCurrency(stats.ganhosHoje)}
            icon={Calendar}
            subtitle="Últimas 24 horas"
          />
          <StatCard
            title="Ganhos do Mês"
            value={formatCurrency(stats.ganhosMes)}
            icon={TrendingUp}
            subtitle="Este mês"
          />
          <StatCard
            title="Total Ganho"
            value={formatCurrency(stats.totalGanhos)}
            icon={DollarSign}
            subtitle="Todos os tempos"
          />
          <StatCard
            title="Visualizações"
            value={stats.totalVisualizacoes.toLocaleString('pt-BR')}
            icon={Eye}
            subtitle="Total de visualizações"
          />
        </div>

        {/* Histórico */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Ganhos</h2>
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center text-gray-500">Carregando...</div>
            </div>
          ) : ganhos.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum ganho registrado ainda"
              description="Seus ganhos aparecerão aqui conforme suas campanhas forem visualizadas"
            />
          ) : (
            <DataTable
              data={ganhos}
              columns={[
                {
                  header: 'Data',
                  accessor: (row) => formatDate(row.data),
                  className: 'font-medium',
                },
                {
                  header: 'Visualizações',
                  accessor: 'visualizacoes',
                },
                {
                  header: 'Ganho do Dia',
                  accessor: (row) => formatCurrency(row.ganho_dia),
                  className: 'font-semibold text-green-600',
                },
              ]}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}




