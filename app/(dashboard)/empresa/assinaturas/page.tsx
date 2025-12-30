'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useAssinaturas } from '@/hooks/useAssinaturas'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { usePlanos } from '@/hooks/usePlanos'
import { useState } from 'react'
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'
import { formatCurrency } from '@/lib/utils/format'

export default function EmpresaAssinaturasPage() {
  const { empresa } = useAuth()
  const { assinaturas, loading, createAssinatura, cancelarAssinatura } = useAssinaturas(empresa?.id)
  const { planos } = usePlanos()
  const [showAssinarModal, setShowAssinarModal] = useState(false)
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [selectedAssinatura, setSelectedAssinatura] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    plano_id: '',
    data_inicio: new Date().toISOString().split('T')[0],
  })

  const assinaturaAtiva = assinaturas.find(a => a.status === 'ativa')

  const handleAssinar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa || !formData.plano_id) return

    const planoSelecionado = planos.find(p => p.id === formData.plano_id)
    if (!planoSelecionado) return

    try {
      await createAssinatura({
        empresa_id: empresa.id,
        plano_id: formData.plano_id,
        data_inicio: formData.data_inicio,
        valor: planoSelecionado.valor_mensal,
        status: 'ativa',
      })
      setShowAssinarModal(false)
      setFormData({
        plano_id: '',
        data_inicio: new Date().toISOString().split('T')[0],
      })
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleCancelar = async () => {
    if (!selectedAssinatura) return
    try {
      await cancelarAssinatura(selectedAssinatura)
      setShowCancelarModal(false)
      setSelectedAssinatura(null)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      ativa: 'success',
      cancelada: 'error',
      suspensa: 'warning',
      expirada: 'info',
    }
    return <Badge variant={statusMap[status] || 'info'}>{status}</Badge>
  }

  return (
    <DashboardLayout userType="empresa">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Assinaturas</h1>
            <p className="text-gray-600 mt-1">Gerencie seu plano de assinatura</p>
          </div>
          {!assinaturaAtiva && (
            <Button onClick={() => setShowAssinarModal(true)}>
              Assinar Plano
            </Button>
          )}
        </div>

        {/* Stats */}
        {assinaturaAtiva && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Plano Atual"
              value={assinaturaAtiva.plano?.nome || 'N/A'}
              icon={CreditCard}
              subtitle={formatCurrency(assinaturaAtiva.valor)}
            />
            <StatCard
              title="Data Início"
              value={formatDate(assinaturaAtiva.data_inicio)}
              icon={Calendar}
              subtitle="Início da assinatura"
            />
            {assinaturaAtiva.data_fim && (
              <StatCard
                title="Data Fim"
                value={formatDate(assinaturaAtiva.data_fim)}
                icon={Calendar}
                subtitle="Fim da assinatura"
              />
            )}
          </div>
        )}

        {/* Assinaturas List */}
        <DataTable
          data={assinaturas}
          loading={loading}
          columns={[
            {
              header: 'Plano',
              accessor: (row) => row.plano?.nome || 'N/A',
              className: 'font-medium',
            },
            {
              header: 'Valor',
              accessor: (row) => formatCurrency(row.valor),
            },
            {
              header: 'Status',
              accessor: (row) => getStatusBadge(row.status),
            },
            {
              header: 'Data Início',
              accessor: (row) => formatDate(row.data_inicio),
            },
            {
              header: 'Data Fim',
              accessor: (row) => row.data_fim ? formatDate(row.data_fim) : 'N/A',
            },
            {
              header: 'Ações',
              accessor: (row) => (
                row.status === 'ativa' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAssinatura(row.id)
                      setShowCancelarModal(true)
                    }}
                  >
                    Cancelar
                  </Button>
                )
              ),
            },
          ]}
          emptyMessage="Nenhuma assinatura encontrada"
        />

        {/* Assinar Modal */}
        <Modal
          isOpen={showAssinarModal}
          onClose={() => setShowAssinarModal(false)}
          title="Assinar Plano"
        >
          <form onSubmit={handleAssinar} className="space-y-4">
            <Select
              label="Plano *"
              value={formData.plano_id}
              onChange={(e) => setFormData({ ...formData, plano_id: e.target.value })}
              required
              options={planos.map(plano => ({
                value: plano.id,
                label: `${plano.nome} - ${formatCurrency(plano.valor_mensal)}/mês`,
              }))}
            />
            <div className="text-sm text-gray-600">
              {formData.plano_id && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const plano = planos.find(p => p.id === formData.plano_id)
                    return plano ? (
                      <div>
                        <p className="font-medium">{plano.nome}</p>
                        <p className="text-xs mt-1">{plano.descricao}</p>
                        <div className="mt-2 space-y-1 text-xs">
                          <p>• Valor: {formatCurrency(plano.valor_mensal)}/mês</p>
                          {plano.limite_campanhas && (
                            <p>• Limite de campanhas: {plano.limite_campanhas}</p>
                          )}
                          {plano.limite_midias && (
                            <p>• Limite de mídias: {plano.limite_midias}</p>
                          )}
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssinarModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.plano_id}>
                Assinar Plano
              </Button>
            </div>
          </form>
        </Modal>

        {/* Cancelar Modal */}
        <Modal
          isOpen={showCancelarModal}
          onClose={() => {
            setShowCancelarModal(false)
            setSelectedAssinatura(null)
          }}
          title="Cancelar Assinatura"
        >
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso até o fim do período pago.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelarModal(false)
                setSelectedAssinatura(null)
              }}
            >
              Não Cancelar
            </Button>
            <Button onClick={handleCancelar}>
              Sim, Cancelar
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

