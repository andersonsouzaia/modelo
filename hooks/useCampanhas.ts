import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'

export function useCampanhas(empresaId?: string) {
  const [campanhas, setCampanhas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadCampanhas = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from('campanhas').select('*, empresas(nome), midias(*)').order('created_at', { ascending: false })

      if (empresaId) {
        query = query.eq('empresa_id', empresaId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setCampanhas(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar campanhas', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampanhas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId])

  const createCampanha = async (data: any) => {
    try {
      const { data: campanha, error: err } = await supabase
        .from('campanhas')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Campanha criada com sucesso!', 'success')
      await loadCampanhas()
      return campanha
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar campanha', 'error')
      throw err
    }
  }

  const updateCampanha = async (id: string, data: any) => {
    try {
      const { error: err } = await supabase
        .from('campanhas')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Campanha atualizada com sucesso!', 'success')
      await loadCampanhas()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar campanha', 'error')
      throw err
    }
  }

  const deleteCampanha = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id)

      if (err) throw err
      showToast('Campanha deletada com sucesso!', 'success')
      await loadCampanhas()
    } catch (err: any) {
      showToast(err.message || 'Erro ao deletar campanha', 'error')
      throw err
    }
  }

  const pauseCampanha = async (id: string) => {
    return updateCampanha(id, { status: 'pausada' })
  }

  const activateCampanha = async (id: string) => {
    return updateCampanha(id, { status: 'ativa' })
  }

  return {
    campanhas,
    loading,
    error,
    createCampanha,
    updateCampanha,
    deleteCampanha,
    pauseCampanha,
    activateCampanha,
    refresh: loadCampanhas,
  }
}

