/**
 * Utilitário para tratamento centralizado de erros
 */

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export class ErrorHandler {
  /**
   * Converte erros do Supabase em mensagens amigáveis
   */
  static parseSupabaseError(error: any): AppError {
    if (!error) {
      return {
        message: 'Erro desconhecido',
        code: 'UNKNOWN_ERROR',
      }
    }

    // Erro de rede
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        code: 'NETWORK_ERROR',
      }
    }

    // Erro de autenticação
    if (error.message?.includes('session') || error.message?.includes('auth')) {
      return {
        message: 'Sua sessão expirou. Por favor, faça login novamente.',
        code: 'AUTH_ERROR',
        statusCode: 401,
      }
    }

    // Erro de permissão
    if (error.message?.includes('permission') || error.message?.includes('policy')) {
      return {
        message: 'Você não tem permissão para realizar esta ação.',
        code: 'PERMISSION_ERROR',
        statusCode: 403,
      }
    }

    // Erro de validação
    if (error.message?.includes('violates') || error.message?.includes('constraint')) {
      return {
        message: 'Dados inválidos. Verifique as informações e tente novamente.',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      }
    }

    // Erro genérico do Supabase
    if (error.message) {
      return {
        message: error.message,
        code: error.code || 'SUPABASE_ERROR',
        details: error,
      }
    }

    return {
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      code: 'UNKNOWN_ERROR',
      details: error,
    }
  }

  /**
   * Retorna mensagem amigável baseada no código de erro
   */
  static getFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<string, string> = {
      NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
      AUTH_ERROR: 'Sua sessão expirou. Faça login novamente.',
      PERMISSION_ERROR: 'Você não tem permissão para esta ação.',
      VALIDATION_ERROR: 'Dados inválidos. Verifique as informações.',
      NOT_FOUND: 'Registro não encontrado.',
      DUPLICATE: 'Este registro já existe.',
    }

    return friendlyMessages[error.code || ''] || error.message
  }

  /**
   * Loga erro no console (apenas em desenvolvimento)
   */
  static logError(error: AppError, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Error'}]`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      })
    }
  }
}




