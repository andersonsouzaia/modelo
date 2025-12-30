'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { ConfiguracaoSistema } from '@/types/database'

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadConfiguracoes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('configuracoes_sistema')
        .select('*')
        .order('categoria', { ascending: true })
        .order('chave', { ascending: true })

      if (err) throw err
      setConfiguracoes(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfiguracoes()
  }, [])

  const getConfig = (chave: string): string | null => {
    const config = configuracoes.find(c => c.chave === chave)
    return config?.valor || null
  }

  const getConfigNumber = (chave: string): number | null => {
    const config = configuracoes.find(c => c.chave === chave)
    if (!config || config.tipo !== 'number') return null
    return Number(config.valor) || null
  }

  const getConfigBoolean = (chave: string): boolean | null => {
    const config = configuracoes.find(c => c.chave === chave)
    if (!config || config.tipo !== 'boolean') return null
    return config.valor === 'true'
  }

  const updateConfig = async (chave: string, valor: string) => {
    try {
      const { error: err } = await supabase
        .from('configuracoes_sistema')
        .update({ valor, updated_at: new Date().toISOString() })
        .eq('chave', chave)

      if (err) throw err
      showToast('Configuração atualizada com sucesso!', 'success')
      await loadConfiguracoes()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar configuração', 'error')
      throw err
    }
  }

  return {
    configuracoes,
    loading,
    error,
    getConfig,
    getConfigNumber,
    getConfigBoolean,
    updateConfig,
    refresh: loadConfiguracoes,
  }
}




