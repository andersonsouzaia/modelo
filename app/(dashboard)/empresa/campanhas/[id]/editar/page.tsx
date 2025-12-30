'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCampanhas } from '@/hooks/useCampanhas'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const REGIOES = [
  { value: 'norte', label: 'Norte' },
  { value: 'sul', label: 'Sul' },
  { value: 'leste', label: 'Leste' },
  { value: 'oeste', label: 'Oeste' },
  { value: 'centro', label: 'Centro' },
]

const CIDADES = [
  { value: 'sao-paulo', label: 'São Paulo' },
  { value: 'rio-de-janeiro', label: 'Rio de Janeiro' },
  { value: 'belo-horizonte', label: 'Belo Horizonte' },
  { value: 'brasilia', label: 'Brasília' },
  { value: 'curitiba', label: 'Curitiba' },
]

export default function EditarCampanhaPage() {
  const params = useParams()
  const router = useRouter()
  const { empresa } = useAuth()
  const { updateCampanha } = useCampanhas()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [campanha, setCampanha] = useState<any>(null)

  const campanhaId = params.id as string

  useEffect(() => {
    if (empresa && campanhaId) {
      loadCampanha()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId, empresa])

  const loadCampanha = async () => {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select('*')
        .eq('id', campanhaId)
        .single()

      if (error) throw error

      if (data.empresa_id !== empresa?.id) {
        router.push('/empresa/campanhas')
        return
      }

      if (data.status !== 'em_analise') {
        router.push('/empresa/campanhas')
        return
      }

      setCampanha(data)
      setFormData({
        nome: data.nome,
        regiao: data.regiao,
        cidade: data.cidade,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        horario_inicio: data.horario_inicio,
        horario_fim: data.horario_fim,
        frequencia: data.frequencia.toString(),
      })
    } catch (err) {
      console.error(err)
      router.push('/empresa/campanhas')
    } finally {
      setLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    nome: '',
    regiao: '',
    cidade: '',
    data_inicio: '',
    data_fim: '',
    horario_inicio: '',
    horario_fim: '',
    frequencia: '1',
  })

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.regiao) {
      newErrors.regiao = 'Região é obrigatória'
    }

    if (!formData.cidade) {
      newErrors.cidade = 'Cidade é obrigatória'
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória'
    }

    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de fim é obrigatória'
    }

    if (formData.data_fim && formData.data_inicio && formData.data_fim < formData.data_inicio) {
      newErrors.data_fim = 'Data de fim deve ser posterior à data de início'
    }

    if (!formData.horario_inicio) {
      newErrors.horario_inicio = 'Horário de início é obrigatório'
    }

    if (!formData.horario_fim) {
      newErrors.horario_fim = 'Horário de fim é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSaving(true)

    try {
      await updateCampanha(campanhaId, {
        nome: formData.nome,
        regiao: formData.regiao,
        cidade: formData.cidade,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        frequencia: parseInt(formData.frequencia),
      })

      router.push('/empresa/campanhas')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !empresa || !campanha) {
    return <Loading fullScreen text="Carregando..." />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/empresa/campanhas"
          className="inline-flex items-center text-primary-dark mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Campanhas
        </Link>

        <div className="bg-white border-2 border-primary-light rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Campanha</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nome da Campanha *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              error={errors.nome}
              placeholder="Ex: Promoção de Verão 2024"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Região *"
                value={formData.regiao}
                onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                options={REGIOES}
                error={errors.regiao}
              />

              <Select
                label="Cidade *"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                options={CIDADES}
                error={errors.cidade}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Data de Início *"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                error={errors.data_inicio}
              />

              <Input
                label="Data de Fim *"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                error={errors.data_fim}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Horário de Início *"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                error={errors.horario_inicio}
              />

              <Input
                label="Horário de Fim *"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                error={errors.horario_fim}
              />
            </div>

            <Input
              label="Frequência (vezes por dia)"
              type="number"
              min="1"
              max="10"
              value={formData.frequencia}
              onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
              helperText="Quantas vezes o anúncio será exibido por dia"
            />

            <div className="flex space-x-4 pt-4">
              <Button type="submit" loading={saving} className="flex-1">
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

