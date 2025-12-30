'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { usePagamentos } from '@/hooks/usePagamentos'
import { PaymentCard } from '@/components/dashboard/PaymentCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/validations'

export default function EmpresaPagamentosPage() {
  const { empresa } = useAuth()
  const { pagamentos, loading } = usePagamentos(empresa?.id)

  const pagamentosPagos = pagamentos.filter(p => p.status === 'pago')
  const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente')
  const pagamentosProcessando = pagamentos.filter(p => p.status === 'processando')
  const totalPago = pagamentosPagos.reduce((sum, p) => sum + Number(p.valor), 0)
  const totalPendente = pagamentosPendentes.reduce((sum, p) => sum + Number(p.valor), 0)

  return (
    <DashboardLayout userType="empresa">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600 mt-1">Histórico de pagamentos e faturas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Pago"
            value={formatCurrency(totalPago)}
            icon={CheckCircle}
            subtitle={`${pagamentosPagos.length} pagamentos`}
          />
          <StatCard
            title="Pendente"
            value={formatCurrency(totalPendente)}
            icon={Clock}
            subtitle={`${pagamentosPendentes.length} pagamentos`}
          />
          <StatCard
            title="Processando"
            value={pagamentosProcessando.length}
            icon={CreditCard}
            subtitle="Em processamento"
          />
          <StatCard
            title="Total de Pagamentos"
            value={pagamentos.length}
            icon={CreditCard}
            subtitle="Todos os registros"
          />
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center text-gray-500">Carregando...</div>
          </div>
        ) : pagamentos.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Nenhum pagamento encontrado"
            description="Seus pagamentos aparecerão aqui quando forem processados"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagamentos.map((pagamento) => (
              <PaymentCard key={pagamento.id} pagamento={pagamento} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}




