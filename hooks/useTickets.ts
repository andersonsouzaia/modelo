'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { TicketSuporte } from '@/types/database'

export function useTickets(userId?: string) {
  const [tickets, setTickets] = useState<TicketSuporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('tickets_suporte')
        .select('*, users(*)')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setTickets(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [userId])

  const createTicket = async (data: Partial<TicketSuporte>) => {
    try {
      const { data: ticket, error: err } = await supabase
        .from('tickets_suporte')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Ticket criado com sucesso!', 'success')
      await loadTickets()
      return ticket
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar ticket', 'error')
      throw err
    }
  }

  const updateTicket = async (id: string, data: Partial<TicketSuporte>) => {
    try {
      const { error: err } = await supabase
        .from('tickets_suporte')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Ticket atualizado com sucesso!', 'success')
      await loadTickets()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar ticket', 'error')
      throw err
    }
  }

  const atribuirTicket = async (id: string, userId: string) => {
    return updateTicket(id, { atribuido_para: userId, status: 'em_andamento' })
  }

  const resolverTicket = async (id: string, resolvidoPor: string) => {
    return updateTicket(id, {
      status: 'resolvido',
      resolvido_por: resolvidoPor,
      resolvido_em: new Date().toISOString(),
    })
  }

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    atribuirTicket,
    resolverTicket,
    refresh: loadTickets,
  }
}




