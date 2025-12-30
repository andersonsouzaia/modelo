'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { usePlanos } from '@/hooks/usePlanos'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useState } from 'react'
import { Package, Plus, Edit, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/validations'

export default function AdminPlanosPage() {
  const { planos, loading, createPlano, updatePlano } = usePlanos()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlano, setSelectedPlano] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor_mensal: '',
    valor_por_visualizacao: '',
    limite_campanhas: '',
    limite_midias: '',
    ativo: true,
  })

  const planosAtivos = planos.filter(p => p.ativo).length

  const handleCreatePlano = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPlano({
        ...formData,
        valor_mensal: parseFloat(formData.valor_mensal),
        valor_por_visualizacao: formData.valor_por_visualizacao
          ? parseFloat(formData.valor_por_visualizacao)
          : null,
        limite_campanhas: formData.limite_campanhas ? parseInt(formData.limite_campanhas) : null,
        limite_midias: formData.limite_midias ? parseInt(formData.limite_midias) : null,
      })
      setShowCreateModal(false)
      setFormData({
        nome: '',
        descricao: '',
        valor_mensal: '',
        valor_por_visualizacao: '',
        limite_campanhas: '',
        limite_midias: '',
        ativo: true,
      })
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleEdit = (plano: any) => {
    setSelectedPlano(plano)
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao || '',
      valor_mensal: plano.valor_mensal.toString(),
      valor_por_visualizacao: plano.valor_por_visualizacao?.toString() || '',
      limite_campanhas: plano.limite_campanhas?.toString() || '',
      limite_midias: plano.limite_midias?.toString() || '',
      ativo: plano.ativo,
    })
    setShowEditModal(true)
  }

  const handleUpdatePlano = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlano) return
    try {
      await updatePlano(selectedPlano.id, {
        ...formData,
        valor_mensal: parseFloat(formData.valor_mensal),
        valor_por_visualizacao: formData.valor_por_visualizacao
          ? parseFloat(formData.valor_por_visualizacao)
          : null,
        limite_campanhas: formData.limite_campanhas ? parseInt(formData.limite_campanhas) : null,
        limite_midias: formData.limite_midias ? parseInt(formData.limite_midias) : null,
      })
      setShowEditModal(false)
      setSelectedPlano(null)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planos de Assinatura</h1>
            <p className="text-gray-600 mt-1">Gerencie os planos disponíveis para empresas</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total de Planos"
            value={planos.length}
            icon={Package}
          />
          <StatCard
            title="Planos Ativos"
            value={planosAtivos}
            icon={CheckCircle}
          />
        </div>

        {/* Planos List */}
        <DataTable
          data={planos}
          loading={loading}
          columns={[
            {
              header: 'Nome',
              accessor: 'nome',
              className: 'font-medium',
            },
            {
              header: 'Valor Mensal',
              accessor: (row) => formatCurrency(row.valor_mensal),
            },
            {
              header: 'Valor por Visualização',
              accessor: (row) => row.valor_por_visualizacao
                ? formatCurrency(row.valor_por_visualizacao)
                : 'N/A',
            },
            {
              header: 'Limite Campanhas',
              accessor: (row) => row.limite_campanhas || 'Ilimitado',
            },
            {
              header: 'Limite Mídias',
              accessor: (row) => row.limite_midias || 'Ilimitado',
            },
            {
              header: 'Status',
              accessor: (row) => (
                <Badge variant={row.ativo ? 'success' : 'error'}>
                  {row.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              ),
            },
            {
              header: 'Ações',
              accessor: (row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(row)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ),
            },
          ]}
        />

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Plano"
        >
          <form onSubmit={handleCreatePlano} className="space-y-4">
            <Input
              label="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Ex: Plano Básico"
            />
            <Textarea
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os recursos do plano"
              rows={3}
            />
            <Input
              label="Valor Mensal *"
              type="number"
              step="0.01"
              value={formData.valor_mensal}
              onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
              required
              placeholder="0.00"
            />
            <Input
              label="Valor por Visualização"
              type="number"
              step="0.0001"
              value={formData.valor_por_visualizacao}
              onChange={(e) => setFormData({ ...formData, valor_por_visualizacao: e.target.value })}
              placeholder="0.0000"
            />
            <Input
              label="Limite de Campanhas"
              type="number"
              value={formData.limite_campanhas}
              onChange={(e) => setFormData({ ...formData, limite_campanhas: e.target.value })}
              placeholder="Deixe vazio para ilimitado"
            />
            <Input
              label="Limite de Mídias"
              type="number"
              value={formData.limite_midias}
              onChange={(e) => setFormData({ ...formData, limite_midias: e.target.value })}
              placeholder="Deixe vazio para ilimitado"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-light"
              />
              <label htmlFor="ativo" className="text-sm text-gray-700">
                Plano ativo
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Plano</Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPlano(null)
          }}
          title={`Editar Plano: ${selectedPlano?.nome}`}
        >
          <form onSubmit={handleUpdatePlano} className="space-y-4">
            <Input
              label="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Textarea
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
            <Input
              label="Valor Mensal *"
              type="number"
              step="0.01"
              value={formData.valor_mensal}
              onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
              required
            />
            <Input
              label="Valor por Visualização"
              type="number"
              step="0.0001"
              value={formData.valor_por_visualizacao}
              onChange={(e) => setFormData({ ...formData, valor_por_visualizacao: e.target.value })}
            />
            <Input
              label="Limite de Campanhas"
              type="number"
              value={formData.limite_campanhas}
              onChange={(e) => setFormData({ ...formData, limite_campanhas: e.target.value })}
            />
            <Input
              label="Limite de Mídias"
              type="number"
              value={formData.limite_midias}
              onChange={(e) => setFormData({ ...formData, limite_midias: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-light"
              />
              <label htmlFor="edit-ativo" className="text-sm text-gray-700">
                Plano ativo
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedPlano(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

