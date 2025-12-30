'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GanhosMotorista } from '@/types/database'

export function useGanhosMotorista(motoristaId?: string) {
  const [ganhos, setGanhos] = useState<GanhosMotorista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalGanhos: 0,
    ganhosMes: 0,
    ganhosHoje: 0,
    totalVisualizacoes: 0,
  })

  const loadGanhos = async () => {
    if (!motoristaId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('ganhos_motorista')
        .select('*')
        .eq('motorista_id', motoristaId)
        .order('data', { ascending: false })

      if (err) throw err

      setGanhos(data || [])

      // Calcular estatísticas
      const hoje = new Date().toISOString().split('T')[0]
      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()

      const ganhosHoje = data?.find(g => g.data === hoje)?.ganho_dia || 0
      const ganhosMes = data
        ?.filter(g => {
          const dataGanho = new Date(g.data)
          return dataGanho.getMonth() === mesAtual && dataGanho.getFullYear() === anoAtual
        })
        .reduce((sum, g) => sum + Number(g.ganho_dia), 0) || 0
      const totalGanhos = data?.reduce((sum, g) => sum + Number(g.ganho_dia), 0) || 0
      const totalVisualizacoes = data?.reduce((sum, g) => sum + g.visualizacoes, 0) || 0

      setStats({
        totalGanhos,
        ganhosMes,
        ganhosHoje,
        totalVisualizacoes,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGanhos()
  }, [motoristaId])

  return {
    ganhos,
    loading,
    error,
    stats,
    refresh: loadGanhos,
  }
}




