'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useMidias } from '@/hooks/useMidias'
import { supabase } from '@/lib/supabase'
import { FileUpload } from '@/components/ui/FileUpload'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, Trash2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function CampanhaMidiasPage() {
  const params = useParams()
  const router = useRouter()
  const { empresa } = useAuth()
  const { uploadMidia, deleteMidia, uploading } = useMidias()
  const [midias, setMidias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tipoMidia, setTipoMidia] = useState<'imagem' | 'video'>('imagem')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)

  const campanhaId = params.id as string

  useEffect(() => {
    if (campanhaId) {
      loadMidias()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId])

  const loadMidias = async () => {
    try {
      const { data, error } = await supabase
        .from('midias')
        .select('*')
        .eq('campanha_id', campanhaId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMidias(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !campanhaId) return

    try {
      await uploadMidia(selectedFile, campanhaId, tipoMidia)
      setSelectedFile(null)
      await loadMidias()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return

    const midia = midias.find((m) => m.id === deleteModal)
    if (midia) {
      try {
        await deleteMidia(midia.id, midia.url)
        await loadMidias()
        setDeleteModal(null)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (!empresa) {
    return <Loading fullScreen text="Carregando..." />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/empresa/campanhas"
          className="inline-flex items-center text-primary-dark mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Campanhas
        </Link>

        <div className="bg-white border-2 border-primary-light rounded-lg p-8 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Mídias da Campanha</h1>

          {/* Upload */}
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mídia
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setTipoMidia('imagem')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tipoMidia === 'imagem'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Imagem
                </button>
                <button
                  type="button"
                  onClick={() => setTipoMidia('video')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tipoMidia === 'video'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vídeo
                </button>
              </div>
            </div>

            <FileUpload
              accept={tipoMidia === 'imagem' ? 'image/*' : 'video/*'}
              maxSize={tipoMidia === 'video' ? 100 : 10}
              onFileSelect={setSelectedFile}
              preview
              label={`Enviar ${tipoMidia === 'imagem' ? 'Imagem' : 'Vídeo'}`}
            />

            {selectedFile && (
              <div className="mt-4">
                <Button onClick={handleUpload} loading={uploading}>
                  Enviar Mídia
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Mídias */}
        {loading ? (
          <Loading text="Carregando mídias..." />
        ) : midias.length === 0 ? (
          <div className="bg-white border-2 border-primary-light rounded-lg p-12 text-center">
            <p className="text-gray-600">Nenhuma mídia enviada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {midias.map((midia) => (
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
                    {midia.status === 'em_analise' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteModal(midia.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {midia.motivo_reprovacao && (
                    <p className="text-sm text-red-600 mt-2">
                      Motivo: {midia.motivo_reprovacao}
                    </p>
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
        <p>Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}

