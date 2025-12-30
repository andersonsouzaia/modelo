'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { VisualizacaoCampanha } from '@/types/database'

export function useVisualizacoes(campanhaId?: string, tabletId?: string) {
  const [visualizacoes, setVisualizacoes] = useState<VisualizacaoCampanha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalVisualizacoes: 0,
    totalCliques: 0,
    totalCompartilhamentos: 0,
    visualizacoesHoje: 0,
  })

  const loadVisualizacoes = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('visualizacoes_campanha')
        .select('*, campanhas(*), tablet:tablets(*), midias(*)')
        .order('timestamp', { ascending: false })

      if (campanhaId) {
        query = query.eq('campanha_id', campanhaId)
      }
      if (tabletId) {
        query = query.eq('tablet_id', tabletId)
      }

      const { data, error: err } = await query

      if (err) throw err

      setVisualizacoes(data || [])

      // Calcular estatísticas
      const hoje = new Date().toISOString().split('T')[0]
      const visualizacoesHoje = data?.filter(
        v => v.timestamp.startsWith(hoje)
      ).length || 0
      const totalCliques = data?.filter(
        v => v.tipo_interacao === 'clique'
      ).length || 0
      const totalCompartilhamentos = data?.filter(
        v => v.tipo_interacao === 'compartilhamento'
      ).length || 0

      setStats({
        totalVisualizacoes: data?.length || 0,
        totalCliques,
        totalCompartilhamentos,
        visualizacoesHoje,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisualizacoes()
  }, [campanhaId, tabletId])

  const registrarVisualizacao = async (
    campanhaId: string,
    tabletId: string,
    midiaId?: string,
    tipoInteracao?: 'visualizacao' | 'clique' | 'compartilhamento'
  ) => {
    try {
      const { error: err } = await supabase
        .from('visualizacoes_campanha')
        .insert({
          campanha_id: campanhaId,
          tablet_id: tabletId,
          midia_id: midiaId,
          tipo_interacao: tipoInteracao || 'visualizacao',
          timestamp: new Date().toISOString(),
        })

      if (err) throw err
      await loadVisualizacoes()
    } catch (err: any) {
      console.error('Erro ao registrar visualização:', err)
    }
  }

  return {
    visualizacoes,
    loading,
    error,
    stats,
    registrarVisualizacao,
    refresh: loadVisualizacoes,
  }
}

