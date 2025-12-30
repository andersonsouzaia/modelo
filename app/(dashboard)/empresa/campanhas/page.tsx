'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCampanhas } from '@/hooks/useCampanhas'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Edit, Trash2, Pause, Play as PlayIcon, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/validations'

const STATUS_COLORS = {
  em_analise: 'warning',
  aprovada: 'info',
  reprovada: 'error',
  ativa: 'success',
  pausada: 'default',
} as const

const STATUS_LABELS = {
  em_analise: 'Em Análise',
  aprovada: 'Aprovada',
  reprovada: 'Reprovada',
  ativa: 'Ativa',
  pausada: 'Pausada',
}

export default function CampanhasPage() {
  const router = useRouter()
  const { empresa } = useAuth()
  const { campanhas, loading, deleteCampanha, pauseCampanha, activateCampanha } = useCampanhas(empresa?.id)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  if (!empresa) {
    return <Loading fullScreen text="Carregando..." />
  }

  const filteredCampanhas = campanhas.filter((campanha) => {
    const matchesSearch = campanha.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || campanha.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteCampanha(deleteModal)
      setDeleteModal(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (currentStatus === 'ativa') {
      await pauseCampanha(id)
    } else if (currentStatus === 'pausada') {
      await activateCampanha(id)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Minhas Campanhas</h1>
            <p className="text-gray-600 mt-1">Gerencie suas campanhas publicitárias</p>
          </div>
          <Link href="/empresa/campanhas/nova">
            <Button>
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovada">Aprovada</option>
              <option value="ativa">Ativa</option>
              <option value="pausada">Pausada</option>
              <option value="reprovada">Reprovada</option>
            </select>
          </div>
        </div>

        {/* Lista de Campanhas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCampanhas.length === 0 ? (
          <div className="bg-white border-2 border-primary-light rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">Nenhuma campanha encontrada.</p>
            <Link href="/empresa/campanhas/nova">
              <Button>Criar Primeira Campanha</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampanhas.map((campanha) => (
              <div
                key={campanha.id}
                className="bg-white border-2 border-primary-light rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{campanha.nome}</h3>
                    <Badge variant={STATUS_COLORS[campanha.status as keyof typeof STATUS_COLORS]}>
                      {STATUS_LABELS[campanha.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p><strong>Região:</strong> {campanha.regiao}</p>
                  <p><strong>Cidade:</strong> {campanha.cidade}</p>
                  <p><strong>Período:</strong> {formatDate(campanha.data_inicio)} - {formatDate(campanha.data_fim)}</p>
                  <p><strong>Horário:</strong> {campanha.horario_inicio} - {campanha.horario_fim}</p>
                  <p><strong>Mídias:</strong> {campanha.midias?.length || 0}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {campanha.status === 'em_analise' && (
                    <Link href={`/empresa/campanhas/${campanha.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  {(campanha.status === 'ativa' || campanha.status === 'pausada') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(campanha.id, campanha.status)}
                    >
                      {campanha.status === 'ativa' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4" />
                          <span>Ativar</span>
                        </>
                      )}
                    </Button>
                  )}
                  <Link href={`/empresa/campanhas/${campanha.id}/midias`}>
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                  {campanha.status === 'em_analise' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteModal(campanha.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar Exclusão"
        footer={
          <div className="flex space-x-4">
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}

