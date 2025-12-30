// ============================================
// TIPOS TYPESCRIPT BASEADOS NO SCHEMA V2.0
// ============================================

// ============================================
// TABELA CENTRAL: users
// ============================================
export interface User {
  id: string
  tipo: 'empresa' | 'motorista' | 'admin'
  email: string
  nome?: string | null
  telefone?: string | null
  avatar_url?: string | null
  status: 'ativo' | 'inativo' | 'bloqueado' | 'suspenso'
  created_at: string
  updated_at: string
}

// ============================================
// PERFIS ESPECÍFICOS
// ============================================

export interface Empresa {
  id: string // Referencia users.id
  cnpj: string
  razao_social: string
  nome_fantasia?: string | null
  instagram?: string | null
  website?: string | null
  telefone_comercial?: string | null
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    cidade?: string
    estado?: string
    cep?: string
  } | null
  status: 'aguardando_aprovacao' | 'ativa' | 'bloqueada' | 'suspensa'
  motivo_bloqueio?: string | null
  aprovado_por?: string | null
  aprovado_em?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  user?: User
}

export interface Motorista {
  id: string // Referencia users.id
  cpf: string
  rg?: string | null
  data_nascimento?: string | null
  telefone: string
  veiculo: string
  placa: string
  modelo_veiculo?: string | null
  cor_veiculo?: string | null
  ano_veiculo?: number | null
  endereco?: Record<string, unknown> | null
  banco?: string | null
  agencia?: string | null
  conta?: string | null
  pix?: string | null
  status: 'aguardando_aprovacao' | 'aprovado' | 'bloqueado' | 'suspenso'
  motivo_bloqueio?: string | null
  tablet_id?: string | null
  aprovado_por?: string | null
  aprovado_em?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  user?: User
  tablet?: Tablet
}

export interface Admin {
  id: string // Referencia users.id
  nivel_acesso: 'admin' | 'super_admin' | 'suporte'
  departamento?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  user?: User
}

// ============================================
// OPERAÇÃO
// ============================================

export interface Tablet {
  id: string
  serial_number: string
  modelo?: string | null
  versao_os?: string | null
  versao_app?: string | null
  motorista_id?: string | null
  status: 'ativo' | 'offline' | 'manutencao' | 'desativado'
  ultima_localizacao?: {
    lat: number
    lng: number
    endereco?: string
    timestamp?: string
  } | null
  ultima_sincronizacao?: string | null
  bateria_percentual?: number | null
  created_at: string
  updated_at: string
  // Relacionamentos
  motorista?: Motorista
}

export interface Campanha {
  id: string
  empresa_id: string
  nome: string
  descricao?: string | null
  status: 'em_analise' | 'aprovada' | 'reprovada' | 'ativa' | 'pausada'
  regiao: string
  cidade: string
  data_inicio: string
  data_fim: string
  horario_inicio: string
  horario_fim: string
  frequencia: number
  valor_total?: number | null
  valor_por_visualizacao?: number | null
  orcamento_maximo?: number | null
  publico_alvo?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  empresa?: Empresa
  midias?: Midia[]
  campanha_tablets?: CampanhaTablet[]
}

export interface Midia {
  id: string
  campanha_id: string
  tipo: 'video' | 'imagem'
  url: string
  nome_arquivo?: string | null
  tamanho_bytes?: number | null
  duracao_segundos?: number | null
  ordem?: number | null
  status: 'em_analise' | 'aprovada' | 'reprovada'
  motivo_reprovacao?: string | null
  aprovado_por?: string | null
  aprovado_em?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  campanha?: Campanha
}

export interface CampanhaTablet {
  id: string
  campanha_id: string
  tablet_id: string
  ativo: boolean
  visualizacoes: number
  cliques: number
  ultima_exibicao?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  campanha?: Campanha
  tablet?: Tablet
}

// ============================================
// FINANCEIRO
// ============================================

export interface Pagamento {
  id: string
  empresa_id: string
  campanha_id?: string | null
  valor: number
  status: 'pendente' | 'processando' | 'pago' | 'falhou' | 'reembolsado'
  metodo_pagamento: 'cartao' | 'pix' | 'boleto' | 'transferencia'
  data_vencimento?: string | null
  data_pagamento?: string | null
  transacao_id?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  empresa?: Empresa
  campanha?: Campanha
}

export interface Repasse {
  id: string
  motorista_id: string
  periodo_inicio: string
  periodo_fim: string
  valor_total: number
  visualizacoes: number
  status: 'pendente' | 'processando' | 'pago' | 'falhou'
  data_pagamento?: string | null
  metodo_pagamento?: 'pix' | 'transferencia' | null
  comprovante_url?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  motorista?: Motorista
  motoristas?: Motorista // Alias para compatibilidade com queries
}

export interface GanhosMotorista {
  id: string
  motorista_id: string
  data: string
  visualizacoes: number
  ganho_dia: number
  created_at: string
  updated_at: string
  // Relacionamentos
  motorista?: Motorista
}

// ============================================
// ANALYTICS
// ============================================

export interface VisualizacaoCampanha {
  id: string
  campanha_id: string
  tablet_id: string
  midia_id?: string | null
  timestamp: string
  tipo_interacao?: 'visualizacao' | 'clique' | 'compartilhamento' | null
  // Relacionamentos
  campanha?: Campanha
  tablet?: Tablet
  midia?: Midia
}

// ============================================
// NOTIFICAÇÕES E SUPORTE
// ============================================

export interface Notificacao {
  id: string
  user_id: string
  tipo: 'sistema' | 'aprovacao' | 'reprovacao' | 'pagamento' | 'campanha' | 'suporte' | 'alerta'
  titulo: string
  mensagem: string
  link?: string | null
  lida: boolean
  data_leitura?: string | null
  created_at: string
  // Relacionamentos
  user?: User
}

export interface TicketSuporte {
  id: string
  user_id: string
  tipo: 'tecnico' | 'financeiro' | 'campanha' | 'outro'
  assunto: string
  descricao: string
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  atribuido_para?: string | null
  resolvido_por?: string | null
  resolvido_em?: string | null
  created_at: string
  updated_at: string
  // Relacionamentos
  user?: User
  mensagens?: MensagemTicket[]
}

export interface MensagemTicket {
  id: string
  ticket_id: string
  user_id: string
  mensagem: string
  anexos?: string[] | null
  created_at: string
  // Relacionamentos
  ticket?: TicketSuporte
  user?: User
}

// ============================================
// AUDITORIA
// ============================================

export interface ActivityLog {
  id: string
  user_id?: string | null
  acao: string
  entidade?: string | null
  entidade_id?: string | null
  descricao?: string | null
  dados_anteriores?: Record<string, unknown> | null
  dados_novos?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  metodo_http?: string | null
  url?: string | null
  created_at: string
  // Relacionamentos
  user?: User
  users?: User // Alias para compatibilidade com queries
}

// ============================================
// CONFIGURAÇÃO
// ============================================

export interface ConfiguracaoSistema {
  id: string
  chave: string
  valor?: string | null
  tipo: 'string' | 'number' | 'boolean' | 'json'
  descricao?: string | null
  categoria?: string | null
  editavel: boolean
  created_at: string
  updated_at: string
}

export interface Plano {
  id: string
  nome: string
  descricao?: string | null
  valor_mensal: number
  valor_por_visualizacao?: number | null
  limite_campanhas?: number | null
  limite_midias?: number | null
  recursos?: Record<string, unknown> | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AssinaturaEmpresa {
  id: string
  empresa_id: string
  plano_id: string
  status: 'ativa' | 'cancelada' | 'suspensa' | 'expirada'
  data_inicio: string
  data_fim?: string | null
  valor: number
  created_at: string
  updated_at: string
  // Relacionamentos
  empresa?: Empresa
  plano?: Plano
}

// ============================================
// GEOLOCALIZAÇÃO
// ============================================

export interface HistoricoLocalizacao {
  id: string
  tablet_id: string
  latitude: number
  longitude: number
  endereco?: string | null
  velocidade?: number | null
  timestamp: string
  // Relacionamentos
  tablet?: Tablet
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export type UserType = 'empresa' | 'motorista' | 'admin'
export type StatusEmpresa = 'aguardando_aprovacao' | 'ativa' | 'bloqueada' | 'suspensa'
export type StatusMotorista = 'aguardando_aprovacao' | 'aprovado' | 'bloqueado' | 'suspenso'
export type StatusCampanha = 'em_analise' | 'aprovada' | 'reprovada' | 'ativa' | 'pausada'
export type StatusMidia = 'em_analise' | 'aprovada' | 'reprovada'
export type StatusTablet = 'ativo' | 'offline' | 'manutencao' | 'desativado'
export type StatusPagamento = 'pendente' | 'processando' | 'pago' | 'falhou' | 'reembolsado'
export type StatusRepasse = 'pendente' | 'processando' | 'pago' | 'falhou'
export type TipoMidia = 'video' | 'imagem'
export type TipoNotificacao = 'sistema' | 'aprovacao' | 'reprovacao' | 'pagamento' | 'campanha' | 'suporte' | 'alerta'
export type TipoTicket = 'tecnico' | 'financeiro' | 'campanha' | 'outro'
export type PrioridadeTicket = 'baixa' | 'media' | 'alta' | 'urgente'
export type StatusTicket = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
