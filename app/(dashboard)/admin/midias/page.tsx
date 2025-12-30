'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMidias } from '@/hooks/useMidias'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { useNotification } from '@/contexts/NotificationContext'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminMidiasPage() {
  const { admin } = useAuth()
  const { approveMidia, rejectMidia } = useMidias()
  const { showToast } = useNotification()
  const [midias, setMidias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [approveModal, setApproveModal] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (admin) {
      loadMidias()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const loadMidias = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('midias')
        .select('*, campanhas(nome, empresas(nome))')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMidias(data || [])
    } catch (err: any) {
      showToast('Erro ao carregar mídias', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approveModal) return
    try {
      await approveMidia(approveModal)
      setApproveModal(null)
      await loadMidias()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      showToast('Informe o motivo da reprovação', 'warning')
      return
    }
    try {
      await rejectMidia(rejectModal, rejectReason)
      setRejectModal(null)
      setRejectReason('')
      await loadMidias()
    } catch (err) {
      console.error(err)
    }
  }

  if (!admin) {
    return <Loading fullScreen text="Carregando..." />
  }

  const filteredMidias = midias.filter((midia) => {
    const matchesSearch =
      midia.campanhas?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      midia.campanhas?.empresas?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || midia.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestão de Mídias</h1>

        {/* Filtros */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por campanha ou empresa..."
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
              <option value="reprovada">Reprovada</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredMidias.length === 0 ? (
          <div className="bg-white border-2 border-primary-light rounded-lg p-12 text-center">
            <p className="text-gray-600">Nenhuma mídia encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMidias.map((midia) => (
              <div
                key={midia.id}
                className="bg-white border-2 border-primary-light rounded-lg overflow-hidden"
              >
                {midia.tipo === 'imagem' ? (
                  <img
                    src={midia.url}
                    alt="Mídia"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={midia.url}
                    className="w-full h-48 object-cover"
                    controls
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        midia.status === 'aprovada'
                          ? 'success'
                          : midia.status === 'reprovada'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {midia.status === 'aprovada'
                        ? 'Aprovada'
                        : midia.status === 'reprovada'
                        ? 'Reprovada'
                        : 'Em Análise'}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Campanha:</strong> {midia.campanhas?.nome}</p>
                    <p><strong>Empresa:</strong> {midia.campanhas?.empresas?.nome}</p>
                    <p><strong>Tipo:</strong> {midia.tipo === 'imagem' ? 'Imagem' : 'Vídeo'}</p>
                    <p><strong>Enviado em:</strong> {formatDate(midia.created_at)}</p>
                  </div>

                  {midia.motivo_reprovacao && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
                        <strong>Motivo:</strong> {midia.motivo_reprovacao}
                      </p>
                    </div>
                  )}

                  {midia.status === 'em_analise' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApproveModal(midia.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRejectModal(midia.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reprovar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Aprovar */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Aprovar Mídia"
        footer={
          <div className="flex space-x-4">
            <Button onClick={handleApprove}>Confirmar Aprovação</Button>
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja aprovar esta mídia?</p>
      </Modal>

      {/* Modal Reprovar */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => {
          setRejectModal(null)
          setRejectReason('')
        }}
        title="Reprovar Mídia"
        footer={
          <div className="flex space-x-4">
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirmar Reprovação
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRejectModal(null)
                setRejectReason('')
              }}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>Informe o motivo da reprovação:</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ex: Conteúdo inadequado, qualidade baixa, etc."
            rows={4}
          />
        </div>
      </Modal>
    </div>
  )
}

