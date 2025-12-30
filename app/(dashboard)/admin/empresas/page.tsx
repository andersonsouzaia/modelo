'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useNotification } from '@/contexts/NotificationContext'
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminEmpresasPage() {
  const { admin } = useAuth()
  const { showToast } = useNotification()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [approveModal, setApproveModal] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)

  useEffect(() => {
    if (admin) {
      loadEmpresas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const loadEmpresas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmpresas(data || [])
    } catch (err: any) {
      showToast('Erro ao carregar empresas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const approveEmpresa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ status: 'ativa' })
        .eq('id', id)

      if (error) throw error
      showToast('Empresa aprovada com sucesso!', 'success')
      setApproveModal(null)
      await loadEmpresas()
    } catch (err: any) {
      showToast('Erro ao aprovar empresa', 'error')
    }
  }

  const rejectEmpresa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ status: 'bloqueada' })
        .eq('id', id)

      if (error) throw error
      showToast('Empresa bloqueada', 'info')
      setRejectModal(null)
      await loadEmpresas()
    } catch (err: any) {
      showToast('Erro ao bloquear empresa', 'error')
    }
  }

  if (!admin) {
    return <Loading fullScreen text="Carregando..." />
  }

  const filteredEmpresas = empresas.filter((empresa) => {
    const matchesSearch =
      empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cnpj.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || empresa.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestão de Empresas</h1>

        {/* Filtros */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
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
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="ativa">Ativa</option>
              <option value="bloqueada">Bloqueada</option>
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
        ) : filteredEmpresas.length === 0 ? (
          <div className="bg-white border-2 border-primary-light rounded-lg p-12 text-center">
            <p className="text-gray-600">Nenhuma empresa encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmpresas.map((empresa) => (
              <div
                key={empresa.id}
                className="bg-white border-2 border-primary-light rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{empresa.nome}</h3>
                    <Badge
                      variant={
                        empresa.status === 'ativa'
                          ? 'success'
                          : empresa.status === 'bloqueada'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {empresa.status === 'ativa'
                        ? 'Ativa'
                        : empresa.status === 'bloqueada'
                        ? 'Bloqueada'
                        : 'Aguardando Aprovação'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p><strong>CNPJ:</strong> {empresa.cnpj}</p>
                  <p><strong>Email:</strong> {empresa.email}</p>
                  {empresa.instagram && (
                    <p><strong>Instagram:</strong> @{empresa.instagram}</p>
                  )}
                  <p><strong>Cadastro:</strong> {formatDate(empresa.created_at)}</p>
                </div>

                {empresa.status === 'aguardando_aprovacao' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApproveModal(empresa.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectModal(empresa.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Bloquear
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Aprovar */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Aprovar Empresa"
        footer={
          <div className="flex space-x-4">
            <Button onClick={() => approveEmpresa(approveModal!)}>
              Confirmar Aprovação
            </Button>
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja aprovar esta empresa?</p>
      </Modal>

      {/* Modal Bloquear */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Bloquear Empresa"
        footer={
          <div className="flex space-x-4">
            <Button variant="danger" onClick={() => rejectEmpresa(rejectModal!)}>
              Confirmar Bloqueio
            </Button>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja bloquear esta empresa?</p>
      </Modal>
    </div>
  )
}

