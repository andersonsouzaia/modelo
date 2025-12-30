'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { HistoricoLocalizacao } from '@/types/database'

export function useHistoricoLocalizacao(tabletId?: string, limit?: number) {
  const [localizacoes, setLocalizacoes] = useState<HistoricoLocalizacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLocalizacoes = async () => {
    if (!tabletId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('historico_localizacao')
        .select('*, tablets(*)')
        .eq('tablet_id', tabletId)
        .order('timestamp', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: err } = await query

      if (err) throw err
      setLocalizacoes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLocalizacoes()

    // Subscribe to real-time updates
    if (tabletId) {
      const channel = supabase
        .channel(`location-${tabletId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'historico_localizacao',
            filter: `tablet_id=eq.${tabletId}`,
          },
          () => {
            loadLocalizacoes()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [tabletId, limit])

  const registrarLocalizacao = async (
    tabletId: string,
    latitude: number,
    longitude: number,
    endereco?: string,
    velocidade?: number
  ) => {
    try {
      const { error: err } = await supabase
        .from('historico_localizacao')
        .insert({
          tablet_id: tabletId,
          latitude,
          longitude,
          endereco,
          velocidade,
          timestamp: new Date().toISOString(),
        })

      if (err) throw err
      await loadLocalizacoes()
    } catch (err: any) {
      console.error('Erro ao registrar localização:', err)
    }
  }

  return {
    localizacoes,
    loading,
    error,
    registrarLocalizacao,
    refresh: loadLocalizacoes,
  }
}




