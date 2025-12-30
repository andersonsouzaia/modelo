'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { MensagemTicket } from '@/types/database'

export function useMensagensTicket(ticketId: string) {
  const [mensagens, setMensagens] = useState<MensagemTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadMensagens = async () => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('mensagens_ticket')
        .select('*, users(*)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (err) throw err
      setMensagens(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar mensagens', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMensagens()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens_ticket',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          loadMensagens()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId])

  const enviarMensagem = async (mensagem: string, anexos?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: novaMensagem, error: err } = await supabase
        .from('mensagens_ticket')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          mensagem,
          anexos: anexos || null,
        })
        .select()
        .single()

      if (err) throw err
      await loadMensagens()
      return novaMensagem
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar mensagem', 'error')
      throw err
    }
  }

  return {
    mensagens,
    loading,
    error,
    enviarMensagem,
    refresh: loadMensagens,
  }
}




