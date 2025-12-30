'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useConfiguracoes } from '@/hooks/useConfiguracoes'
import { DataTable } from '@/components/dashboard/DataTable'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { Settings, Edit } from 'lucide-react'

export default function AdminConfiguracoesPage() {
  const { configuracoes, loading, updateConfig } = useConfiguracoes()
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [editValue, setEditValue] = useState('')

  const configuracoesPorCategoria = configuracoes.reduce((acc, config) => {
    const categoria = config.categoria || 'outros'
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(config)
    return acc
  }, {} as Record<string, typeof configuracoes>)

  const handleEdit = (config: any) => {
    setSelectedConfig(config)
    setEditValue(config.valor || '')
    setShowEditModal(true)
  }

  const handleSave = async () => {
    if (!selectedConfig) return
    try {
      await updateConfig(selectedConfig.chave, editValue)
      setShowEditModal(false)
      setSelectedConfig(null)
      setEditValue('')
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações gerais do sistema</p>
        </div>

        {/* Configurações por Categoria */}
        {Object.entries(configuracoesPorCategoria).map(([categoria, configs]) => (
          <div key={categoria} className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {categoria}
            </h2>
            <DataTable
              data={configs}
              loading={loading}
              columns={[
                {
                  header: 'Chave',
                  accessor: 'chave',
                  className: 'font-medium',
                },
                {
                  header: 'Valor',
                  accessor: 'valor',
                },
                {
                  header: 'Tipo',
                  accessor: (row) => (
                    <Badge variant="info">{row.tipo}</Badge>
                  ),
                },
                {
                  header: 'Descrição',
                  accessor: 'descricao',
                },
                {
                  header: 'Ações',
                  accessor: (row) => (
                    row.editavel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )
                  ),
                },
              ]}
            />
          </div>
        ))}

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedConfig(null)
            setEditValue('')
          }}
          title={`Editar Configuração: ${selectedConfig?.chave}`}
        >
          {selectedConfig && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{selectedConfig.descricao}</p>
              {selectedConfig.tipo === 'boolean' ? (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editValue === 'true'}
                      onChange={(e) => setEditValue(e.target.checked ? 'true' : 'false')}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-light"
                    />
                    <span>Ativado</span>
                  </label>
                </div>
              ) : selectedConfig.tipo === 'number' ? (
                <Input
                  label="Valor"
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  required
                />
              ) : (
                <Input
                  label="Valor"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  required
                />
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedConfig(null)
                    setEditValue('')
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Salvar</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}




