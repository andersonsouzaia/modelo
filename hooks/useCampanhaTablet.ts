'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { CampanhaTablet } from '@/types/database'

export function useCampanhaTablet(campanhaId?: string, tabletId?: string) {
  const [vinculos, setVinculos] = useState<CampanhaTablet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadVinculos = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('campanha_tablet')
        .select('*, campanhas(*), tablet:tablets(*)')
        .order('created_at', { ascending: false })

      if (campanhaId) {
        query = query.eq('campanha_id', campanhaId)
      }
      if (tabletId) {
        query = query.eq('tablet_id', tabletId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setVinculos(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar vínculos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVinculos()
  }, [campanhaId, tabletId])

  const vincularCampanhaTablet = async (campanhaId: string, tabletId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('campanha_tablet')
        .insert({
          campanha_id: campanhaId,
          tablet_id: tabletId,
          ativo: true,
          visualizacoes: 0,
          cliques: 0,
        })
        .select()
        .single()

      if (err) throw err
      showToast('Campanha vinculada ao tablet com sucesso!', 'success')
      await loadVinculos()
      return data
    } catch (err: any) {
      showToast(err.message || 'Erro ao vincular campanha', 'error')
      throw err
    }
  }

  const desvincularCampanhaTablet = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('campanha_tablet')
        .delete()
        .eq('id', id)

      if (err) throw err
      showToast('Vínculo removido com sucesso!', 'success')
      await loadVinculos()
    } catch (err: any) {
      showToast(err.message || 'Erro ao remover vínculo', 'error')
      throw err
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error: err } = await supabase
        .from('campanha_tablet')
        .update({ ativo })
        .eq('id', id)

      if (err) throw err
      showToast(`Campanha ${ativo ? 'ativada' : 'desativada'} no tablet!`, 'success')
      await loadVinculos()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status', 'error')
      throw err
    }
  }

  return {
    vinculos,
    loading,
    error,
    vincularCampanhaTablet,
    desvincularCampanhaTablet,
    toggleAtivo,
    refresh: loadVinculos,
  }
}

