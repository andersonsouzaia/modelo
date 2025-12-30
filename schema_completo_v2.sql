-- ============================================
-- SCHEMA COMPLETO DO BANCO DE DADOS MOVELLO V2.0
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Versão: 2.0
-- Data: 2024
--
-- IMPORTANTE: Este script cria uma estrutura completa e robusta
-- Recomenda-se executar em ambiente de desenvolvimento primeiro
-- ============================================

-- ============================================
-- EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Para busca de texto

-- ============================================
-- TABELA CENTRAL: users (Perfil Unificado)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (
        tipo IN (
            'empresa',
            'motorista',
            'admin'
        )
    ),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (
        status IN (
            'ativo',
            'inativo',
            'bloqueado',
            'suspenso'
        )
    ),
    ultimo_acesso TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS ESPECÍFICAS POR PERFIL
-- ============================================

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    instagram VARCHAR(100),
    website VARCHAR(255),
    telefone_comercial VARCHAR(20),
    endereco JSONB, -- {rua, numero, complemento, cidade, estado, cep}
    status VARCHAR(20) DEFAULT 'aguardando_aprovacao' CHECK (
        status IN (
            'aguardando_aprovacao',
            'ativa',
            'bloqueada',
            'suspensa'
        )
    ),
    motivo_bloqueio TEXT,
    aprovado_por UUID REFERENCES users (id),
    aprovado_em TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Motoristas
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(20) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    placa VARCHAR(7) NOT NULL,
    modelo_veiculo VARCHAR(100),
    cor_veiculo VARCHAR(50),
    ano_veiculo INTEGER,
    endereco JSONB,
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(20),
    pix VARCHAR(255),
    status VARCHAR(20) DEFAULT 'aguardando_aprovacao' CHECK (
        status IN (
            'aguardando_aprovacao',
            'aprovado',
            'bloqueado',
            'suspenso'
        )
    ),
    motivo_bloqueio TEXT,
    tablet_id UUID, -- Será referenciado após criar tablets
    aprovado_por UUID REFERENCES users (id),
    aprovado_em TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    nivel_acesso VARCHAR(50) DEFAULT 'admin' CHECK (
        nivel_acesso IN (
            'admin',
            'super_admin',
            'suporte'
        )
    ),
    departamento VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE OPERAÇÃO
-- ============================================

-- Tabela de Tablets
CREATE TABLE IF NOT EXISTS tablets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    versao_os VARCHAR(50),
    versao_app VARCHAR(50),
    motorista_id UUID, -- Será referenciado após criar motoristas
    status VARCHAR(20) DEFAULT 'offline' CHECK (
        status IN (
            'ativo',
            'offline',
            'manutencao',
            'desativado'
        )
    ),
    ultima_localizacao JSONB, -- {lat, lng, endereco, timestamp}
    ultima_sincronizacao TIMESTAMP
    WITH
        TIME ZONE,
        bateria_percentual INTEGER CHECK (
            bateria_percentual >= 0
            AND bateria_percentual <= 100
        ),
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Adicionar foreign key de tablets para motoristas
ALTER TABLE tablets
ADD CONSTRAINT fk_tablets_motorista FOREIGN KEY (motorista_id) REFERENCES motoristas (id) ON DELETE SET NULL;

-- Adicionar foreign key de motoristas para tablets
ALTER TABLE motoristas
ADD CONSTRAINT fk_motoristas_tablet FOREIGN KEY (tablet_id) REFERENCES tablets (id) ON DELETE SET NULL;

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS campanhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'em_analise' CHECK (
        status IN ('em_analise', 'aprovada', 'reprovada', 'ativa', 'pausada', 'finalizada', 'cancelada')
    ),
    motivo_reprovacao TEXT,

-- Localização e Período
regiao VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairros TEXT[], -- Array de bairros
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    dias_semana INTEGER[], -- [0=domingo, 1=segunda, ..., 6=sábado]
    frequencia INTEGER DEFAULT 1, -- Quantas vezes por hora

-- Financeiro
valor_total DECIMAL(10, 2),
valor_pago DECIMAL(10, 2) DEFAULT 0,
valor_por_visualizacao DECIMAL(10, 4),

-- Aprovação


aprovado_por UUID REFERENCES users(id),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    reprovado_por UUID REFERENCES users(id),
    reprovado_em TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mídias
CREATE TABLE IF NOT EXISTS midias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    campanha_id UUID NOT NULL REFERENCES campanhas (id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('video', 'imagem')),
    url TEXT NOT NULL,
    nome_arquivo VARCHAR(255),
    tamanho_bytes BIGINT,
    duracao_segundos INTEGER, -- Para vídeos
    ordem INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'em_analise' CHECK (
        status IN (
            'em_analise',
            'aprovada',
            'reprovada'
        )
    ),
    motivo_reprovacao TEXT,
    aprovado_por UUID REFERENCES users (id),
    aprovado_em TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE RELACIONAMENTO
-- ============================================

-- Tabela Many-to-Many: Campanhas ↔ Tablets
CREATE TABLE IF NOT EXISTS campanha_tablet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    tablet_id UUID NOT NULL REFERENCES tablets(id) ON DELETE CASCADE,

-- Estatísticas
visualizacoes INTEGER DEFAULT 0,
cliques INTEGER DEFAULT 0,
ultima_exibicao TIMESTAMP
WITH
    TIME ZONE,

-- Status


ativo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT campanha_tablet_unique UNIQUE (campanha_id, tablet_id)
);

-- ============================================
-- TABELAS FINANCEIRAS
-- ============================================

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    empresa_id UUID NOT NULL REFERENCES empresas (id) ON DELETE CASCADE,
    campanha_id UUID REFERENCES campanhas (id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (
        tipo IN (
            'campanha',
            'mensalidade',
            'taxa',
            'reembolso'
        )
    ),
    valor DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (
        status IN (
            'pendente',
            'processando',
            'pago',
            'falhou',
            'cancelado',
            'reembolsado'
        )
    ),
    metodo_pagamento VARCHAR(50) CHECK (
        metodo_pagamento IN (
            'pix',
            'cartao_credito',
            'cartao_debito',
            'boleto',
            'transferencia'
        )
    ),
    referencia_externa VARCHAR(255), -- ID do gateway de pagamento
    data_vencimento DATE,
    data_pagamento TIMESTAMP
    WITH
        TIME ZONE,
        comprovante_url TEXT,
        observacoes TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Repasses
CREATE TABLE IF NOT EXISTS repasses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    motorista_id UUID NOT NULL REFERENCES motoristas (id) ON DELETE CASCADE,
    campanha_id UUID REFERENCES campanhas (id) ON DELETE SET NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    visualizacoes INTEGER DEFAULT 0,
    valor_por_visualizacao DECIMAL(10, 4),
    valor_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (
        status IN (
            'pendente',
            'processando',
            'pago',
            'falhou'
        )
    ),
    metodo_pagamento VARCHAR(50),
    data_pagamento TIMESTAMP
    WITH
        TIME ZONE,
        comprovante_url TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Ganhos do Motorista
CREATE TABLE IF NOT EXISTS ganhos_motorista (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    motorista_id UUID NOT NULL REFERENCES motoristas (id) ON DELETE CASCADE,
    data DATE NOT NULL,
    visualizacoes INTEGER DEFAULT 0,
    ganho_dia DECIMAL(10, 2) DEFAULT 0,
    ganho_mes DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        CONSTRAINT ganhos_motorista_unique UNIQUE (motorista_id, data)
);

-- ============================================
-- TABELAS DE MÉTRICAS E ANALYTICS
-- ============================================

-- Tabela de Visualizações
CREATE TABLE IF NOT EXISTS visualizacoes_campanha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    campanha_id UUID NOT NULL REFERENCES campanhas (id) ON DELETE CASCADE,
    tablet_id UUID NOT NULL REFERENCES tablets (id) ON DELETE CASCADE,
    midia_id UUID REFERENCES midias (id) ON DELETE SET NULL,
    timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        localizacao JSONB,
        duracao_visualizacao INTEGER, -- em segundos
        tipo_interacao VARCHAR(20) CHECK (
            tipo_interacao IN (
                'visualizacao',
                'clique',
                'compartilhamento'
            )
        )
);

-- ============================================
-- TABELAS DE NOTIFICAÇÕES
-- ============================================

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (
        tipo IN (
            'sistema',
            'aprovacao',
            'reprovacao',
            'pagamento',
            'campanha',
            'suporte',
            'alerta'
        )
    ),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    link TEXT,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE SUPORTE
-- ============================================

-- Tabela de Tickets
CREATE TABLE IF NOT EXISTS tickets_suporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (
        tipo IN (
            'tecnico',
            'financeiro',
            'campanha',
            'outro'
        )
    ),
    assunto VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'aberto' CHECK (
        status IN (
            'aberto',
            'em_andamento',
            'resolvido',
            'fechado'
        )
    ),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (
        prioridade IN (
            'baixa',
            'media',
            'alta',
            'urgente'
        )
    ),
    atribuido_para UUID REFERENCES users (id),
    resolvido_por UUID REFERENCES users (id),
    resolvido_em TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens dos Tickets
CREATE TABLE IF NOT EXISTS mensagens_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    ticket_id UUID NOT NULL REFERENCES tickets_suporte (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    anexos JSONB, -- Array de URLs de arquivos
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE AUDITORIA
-- ============================================

-- Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(50), -- 'campanha', 'empresa', 'motorista', etc.
    entidade_id UUID,
    descricao TEXT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metodo_http VARCHAR(10),
    url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE CONFIGURAÇÃO
-- ============================================

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string' CHECK (
        tipo IN (
            'string',
            'number',
            'boolean',
            'json'
        )
    ),
    descricao TEXT,
    categoria VARCHAR(50),
    editavel BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_mensal DECIMAL(10, 2) NOT NULL,
    valor_por_visualizacao DECIMAL(10, 4),
    limite_campanhas INTEGER,
    limite_midias INTEGER,
    recursos JSONB, -- Recursos incluídos no plano
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS assinaturas_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    empresa_id UUID NOT NULL REFERENCES empresas (id) ON DELETE CASCADE,
    plano_id UUID NOT NULL REFERENCES planos (id),
    status VARCHAR(20) DEFAULT 'ativa' CHECK (
        status IN (
            'ativa',
            'cancelada',
            'suspensa',
            'expirada'
        )
    ),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE GEOLOCALIZAÇÃO
-- ============================================

-- Tabela de Histórico de Localização
CREATE TABLE IF NOT EXISTS historico_localizacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tablet_id UUID NOT NULL REFERENCES tablets (id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT,
    velocidade DECIMAL(5, 2), -- km/h
    timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índices para Users
CREATE INDEX IF NOT EXISTS idx_users_tipo ON users (tipo);

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Índices para Empresas
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas (cnpj);

CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas (status);

CREATE INDEX IF NOT EXISTS idx_empresas_aprovado_por ON empresas (aprovado_por);

CREATE INDEX IF NOT EXISTS idx_empresas_nome_fantasia ON empresas USING gin (
    to_tsvector ('portuguese', nome_fantasia)
);

-- Índices para Motoristas
CREATE INDEX IF NOT EXISTS idx_motoristas_cpf ON motoristas (cpf);

CREATE INDEX IF NOT EXISTS idx_motoristas_status ON motoristas (status);

CREATE INDEX IF NOT EXISTS idx_motoristas_tablet_id ON motoristas (tablet_id);

CREATE INDEX IF NOT EXISTS idx_motoristas_placa ON motoristas (placa);

-- Índices para Admins
CREATE INDEX IF NOT EXISTS idx_admins_ativo ON admins (ativo);

CREATE INDEX IF NOT EXISTS idx_admins_nivel_acesso ON admins (nivel_acesso);

-- Índices para Tablets
CREATE INDEX IF NOT EXISTS idx_tablets_motorista_id ON tablets (motorista_id);

CREATE INDEX IF NOT EXISTS idx_tablets_status ON tablets (status);

CREATE INDEX IF NOT EXISTS idx_tablets_serial_number ON tablets (serial_number);

-- Índices para Campanhas
CREATE INDEX IF NOT EXISTS idx_campanhas_empresa_id ON campanhas (empresa_id);

CREATE INDEX IF NOT EXISTS idx_campanhas_status ON campanhas (status);

CREATE INDEX IF NOT EXISTS idx_campanhas_data_inicio ON campanhas (data_inicio);

CREATE INDEX IF NOT EXISTS idx_campanhas_data_fim ON campanhas (data_fim);

CREATE INDEX IF NOT EXISTS idx_campanhas_cidade ON campanhas (cidade);

CREATE INDEX IF NOT EXISTS idx_campanhas_regiao ON campanhas (regiao);

-- Índices para Mídias
CREATE INDEX IF NOT EXISTS idx_midias_campanha_id ON midias (campanha_id);

CREATE INDEX IF NOT EXISTS idx_midias_status ON midias (status);

CREATE INDEX IF NOT EXISTS idx_midias_tipo ON midias (tipo);

-- Índices para Campanha-Tablet
CREATE INDEX IF NOT EXISTS idx_campanha_tablet_campanha ON campanha_tablet (campanha_id);

CREATE INDEX IF NOT EXISTS idx_campanha_tablet_tablet ON campanha_tablet (tablet_id);

CREATE INDEX IF NOT EXISTS idx_campanha_tablet_ativo ON campanha_tablet (ativo);

-- Índices para Pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa_id ON pagamentos (empresa_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos (status);

CREATE INDEX IF NOT EXISTS idx_pagamentos_data_vencimento ON pagamentos (data_vencimento);

-- Índices para Repasses
CREATE INDEX IF NOT EXISTS idx_repasses_motorista_id ON repasses (motorista_id);

CREATE INDEX IF NOT EXISTS idx_repasses_status ON repasses (status);

CREATE INDEX IF NOT EXISTS idx_repasses_periodo ON repasses (periodo_inicio, periodo_fim);

-- Índices para Ganhos Motorista
CREATE INDEX IF NOT EXISTS idx_ganhos_motorista_motorista ON ganhos_motorista (motorista_id);

CREATE INDEX IF NOT EXISTS idx_ganhos_motorista_data ON ganhos_motorista (data);

-- Índices para Visualizações
CREATE INDEX IF NOT EXISTS idx_visualizacoes_campanha ON visualizacoes_campanha (campanha_id);

CREATE INDEX IF NOT EXISTS idx_visualizacoes_tablet ON visualizacoes_campanha (tablet_id);

CREATE INDEX IF NOT EXISTS idx_visualizacoes_timestamp ON visualizacoes_campanha (timestamp);

CREATE INDEX IF NOT EXISTS idx_visualizacoes_midia ON visualizacoes_campanha (midia_id);

-- Índices para Notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes (user_id);

CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes (lida);

CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes (tipo);

CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON notificacoes (created_at);

-- Índices para Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets_suporte (user_id);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets_suporte (status);

CREATE INDEX IF NOT EXISTS idx_tickets_prioridade ON tickets_suporte (prioridade);

-- Índices para Mensagens Ticket
CREATE INDEX IF NOT EXISTS idx_mensagens_ticket_ticket ON mensagens_ticket (ticket_id);

CREATE INDEX IF NOT EXISTS idx_mensagens_ticket_user ON mensagens_ticket (user_id);

-- Índices para Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entidade ON activity_logs (entidade, entidade_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at);

-- Índices para Histórico Localização
CREATE INDEX IF NOT EXISTS idx_historico_localizacao_tablet ON historico_localizacao (tablet_id);

CREATE INDEX IF NOT EXISTS idx_historico_localizacao_timestamp ON historico_localizacao (timestamp);

CREATE INDEX IF NOT EXISTS idx_historico_localizacao_latitude ON historico_localizacao (latitude);

CREATE INDEX IF NOT EXISTS idx_historico_localizacao_longitude ON historico_localizacao (longitude);
-- Nota: Para busca geográfica avançada, considere habilitar a extensão cube e usar:
-- CREATE EXTENSION IF NOT EXISTS cube;
-- CREATE EXTENSION IF NOT EXISTS earthdistance;
-- CREATE INDEX idx_historico_localizacao_coords ON historico_localizacao USING gist(ll_to_earth(latitude, longitude));

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at em todas as tabelas
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motoristas_updated_at 
    BEFORE UPDATE ON motoristas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON admins
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tablets_updated_at 
    BEFORE UPDATE ON tablets
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campanhas_updated_at 
    BEFORE UPDATE ON campanhas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_midias_updated_at 
    BEFORE UPDATE ON midias
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campanha_tablet_updated_at 
    BEFORE UPDATE ON campanha_tablet
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at 
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repasses_updated_at 
    BEFORE UPDATE ON repasses
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_suporte_updated_at 
    BEFORE UPDATE ON tickets_suporte
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_sistema_updated_at 
    BEFORE UPDATE ON configuracoes_sistema
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_updated_at 
    BEFORE UPDATE ON planos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assinaturas_empresa_updated_at 
    BEFORE UPDATE ON assinaturas_empresa
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para sincronizar users com auth.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO UPDATE
    SET email = NEW.email, updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar users quando auth.users é criado
CREATE TRIGGER sync_user_on_auth_insert
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();

-- Função para calcular ganhos do motorista
CREATE OR REPLACE FUNCTION calcular_ganhos_motorista(
    p_motorista_id UUID,
    p_data DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(ct.visualizacoes * c.valor_por_visualizacao), 0)
    INTO v_total
    FROM campanha_tablet ct
    JOIN campanhas c ON c.id = ct.campanha_id
    JOIN tablets t ON t.id = ct.tablet_id
    WHERE t.motorista_id = p_motorista_id
    AND DATE(ct.ultima_exibicao) = p_data;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar ganhos do motorista automaticamente
CREATE OR REPLACE FUNCTION atualizar_ganhos_motorista()
RETURNS TRIGGER AS $$
DECLARE
    v_motorista_id UUID;
    v_data DATE;
    v_ganho DECIMAL(10,2);
BEGIN
    -- Obter motorista_id do tablet
    SELECT motorista_id INTO v_motorista_id
    FROM tablets
    WHERE id = NEW.tablet_id;
    
    IF v_motorista_id IS NOT NULL THEN
        v_data := DATE(NEW.timestamp);
        v_ganho := calcular_ganhos_motorista(v_motorista_id, v_data);
        
        INSERT INTO ganhos_motorista (motorista_id, data, visualizacoes, ganho_dia)
        VALUES (v_motorista_id, v_data, 1, v_ganho)
        ON CONFLICT (motorista_id, data) DO UPDATE
        SET 
            visualizacoes = ganhos_motorista.visualizacoes + 1,
            ganho_dia = v_ganho;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ganhos quando há visualização
CREATE TRIGGER atualizar_ganhos_on_visualizacao
AFTER INSERT ON visualizacoes_campanha
FOR EACH ROW EXECUTE FUNCTION atualizar_ganhos_motorista();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

ALTER TABLE tablets ENABLE ROW LEVEL SECURITY;

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

ALTER TABLE midias ENABLE ROW LEVEL SECURITY;

ALTER TABLE campanha_tablet ENABLE ROW LEVEL SECURITY;

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

ALTER TABLE repasses ENABLE ROW LEVEL SECURITY;

ALTER TABLE ganhos_motorista ENABLE ROW LEVEL SECURITY;

ALTER TABLE visualizacoes_campanha ENABLE ROW LEVEL SECURITY;

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

ALTER TABLE tickets_suporte ENABLE ROW LEVEL SECURITY;

ALTER TABLE mensagens_ticket ENABLE ROW LEVEL SECURITY;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

ALTER TABLE assinaturas_empresa ENABLE ROW LEVEL SECURITY;

ALTER TABLE historico_localizacao ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA USERS
-- ============================================

-- Users podem ver seus próprios dados
CREATE POLICY "Users podem ver seus próprios dados" ON users FOR
SELECT USING (auth.uid () = id);

-- Users podem atualizar seus próprios dados
CREATE POLICY "Users podem atualizar seus próprios dados" ON users FOR
UPDATE USING (auth.uid () = id);

-- ============================================
-- POLÍTICAS RLS PARA EMPRESAS
-- ============================================

-- Empresas podem ver seus próprios dados
CREATE POLICY "Empresas podem ver seus próprios dados" ON empresas FOR
SELECT USING (auth.uid () = id);

-- Empresas podem atualizar seus próprios dados
CREATE POLICY "Empresas podem atualizar seus próprios dados" ON empresas FOR
UPDATE USING (auth.uid () = id);

-- Empresas podem inserir seus próprios dados
CREATE POLICY "Empresas podem inserir seus próprios dados" ON empresas FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- ============================================
-- POLÍTICAS RLS PARA MOTORISTAS
-- ============================================

-- Motoristas podem ver seus próprios dados
CREATE POLICY "Motoristas podem ver seus próprios dados" ON motoristas FOR
SELECT USING (auth.uid () = id);

-- Motoristas podem atualizar seus próprios dados
CREATE POLICY "Motoristas podem atualizar seus próprios dados" ON motoristas FOR
UPDATE USING (auth.uid () = id);

-- Motoristas podem inserir seus próprios dados
CREATE POLICY "Motoristas podem inserir seus próprios dados" ON motoristas FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- ============================================
-- POLÍTICAS RLS PARA CAMPANHAS
-- ============================================

-- Empresas podem ver suas próprias campanhas
CREATE POLICY "Empresas podem ver suas próprias campanhas" ON campanhas FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE
                empresas.id = campanhas.empresa_id
                AND empresas.id = auth.uid ()
        )
    );

-- Empresas podem criar campanhas
CREATE POLICY "Empresas podem criar campanhas" ON campanhas FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE
                empresas.id = campanhas.empresa_id
                AND empresas.id = auth.uid ()
        )
    );

-- Empresas podem atualizar suas próprias campanhas
CREATE POLICY "Empresas podem atualizar suas próprias campanhas" ON campanhas FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM empresas
        WHERE
            empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid ()
    )
);

-- Empresas podem deletar suas próprias campanhas (apenas se em análise)
CREATE POLICY "Empresas podem deletar suas próprias campanhas" ON campanhas FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM empresas
        WHERE
            empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid ()
            AND campanhas.status = 'em_analise'
    )
);

-- ============================================
-- POLÍTICAS RLS PARA MÍDIAS
-- ============================================

-- Empresas podem ver mídias de suas campanhas
CREATE POLICY "Empresas podem ver mídias de suas campanhas" ON midias FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM campanhas
                JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE
                campanhas.id = midias.campanha_id
                AND empresas.id = auth.uid ()
        )
    );

-- Empresas podem criar mídias para suas campanhas
CREATE POLICY "Empresas podem criar mídias para suas campanhas" ON midias FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM campanhas
                JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE
                campanhas.id = midias.campanha_id
                AND empresas.id = auth.uid ()
        )
    );

-- Empresas podem atualizar mídias de suas campanhas (apenas se em análise)
CREATE POLICY "Empresas podem atualizar mídias de suas campanhas" ON midias FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
        WHERE
            campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid ()
            AND midias.status = 'em_analise'
    )
);

-- Empresas podem deletar mídias de suas campanhas (apenas se em análise)
CREATE POLICY "Empresas podem deletar mídias de suas campanhas" ON midias FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
        WHERE
            campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid ()
            AND midias.status = 'em_analise'
    )
);

-- ============================================
-- POLÍTICAS RLS PARA TABLETS
-- ============================================

-- Motoristas podem ver seu próprio tablet
CREATE POLICY "Motoristas podem ver seu próprio tablet" ON tablets FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM motoristas
            WHERE
                motoristas.id = auth.uid ()
                AND motoristas.tablet_id = tablets.id
        )
    );

-- ============================================
-- POLÍTICAS RLS PARA NOTIFICAÇÕES
-- ============================================

-- Users podem ver suas próprias notificações
CREATE POLICY "Users podem ver suas próprias notificações" ON notificacoes FOR
SELECT USING (auth.uid () = user_id);

-- Users podem atualizar suas próprias notificações
CREATE POLICY "Users podem atualizar suas próprias notificações" ON notificacoes FOR
UPDATE USING (auth.uid () = user_id);

-- ============================================
-- POLÍTICAS RLS PARA TICKETS
-- ============================================

-- Users podem ver seus próprios tickets
CREATE POLICY "Users podem ver seus próprios tickets" ON tickets_suporte FOR
SELECT USING (auth.uid () = user_id);

-- Users podem criar tickets
CREATE POLICY "Users podem criar tickets" ON tickets_suporte FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Users podem atualizar seus próprios tickets
CREATE POLICY "Users podem atualizar seus próprios tickets" ON tickets_suporte FOR
UPDATE USING (auth.uid () = user_id);

-- Users podem ver mensagens de seus tickets
CREATE POLICY "Users podem ver mensagens de seus tickets" ON mensagens_ticket FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM tickets_suporte
            WHERE
                tickets_suporte.id = mensagens_ticket.ticket_id
                AND tickets_suporte.user_id = auth.uid ()
        )
    );

-- Users podem criar mensagens em seus tickets
CREATE POLICY "Users podem criar mensagens em seus tickets" ON mensagens_ticket FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM tickets_suporte
            WHERE
                tickets_suporte.id = mensagens_ticket.ticket_id
                AND tickets_suporte.user_id = auth.uid ()
        )
        OR auth.uid () = user_id
    );

-- ============================================
-- POLÍTICAS RLS PARA ADMINS (ACESSO TOTAL)
-- ============================================

-- Admins têm acesso total a todas as tabelas
CREATE POLICY "Admins têm acesso total a users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a empresas" ON empresas FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a motoristas" ON motoristas FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a tablets" ON tablets FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a campanhas" ON campanhas FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a midias" ON midias FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a campanha_tablet" ON campanha_tablet FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a pagamentos" ON pagamentos FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a repasses" ON repasses FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a ganhos_motorista" ON ganhos_motorista FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a visualizacoes_campanha" ON visualizacoes_campanha FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a notificacoes" ON notificacoes FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a tickets_suporte" ON tickets_suporte FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a mensagens_ticket" ON mensagens_ticket FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a activity_logs" ON activity_logs FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a configuracoes_sistema" ON configuracoes_sistema FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a planos" ON planos FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a assinaturas_empresa" ON assinaturas_empresa FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

CREATE POLICY "Admins têm acesso total a historico_localizacao" ON historico_localizacao FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

-- Admins podem gerenciar outros admins
CREATE POLICY "Admins podem gerenciar outros admins" ON admins FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admins
        WHERE
            admins.id = auth.uid ()
            AND admins.ativo = true
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE
                admins.id = auth.uid ()
                AND admins.ativo = true
        )
    );

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE users IS 'Tabela central de usuários do sistema';

COMMENT ON TABLE empresas IS 'Tabela de empresas anunciantes';

COMMENT ON TABLE motoristas IS 'Tabela de motoristas parceiros';

COMMENT ON TABLE admins IS 'Tabela de administradores do sistema';

COMMENT ON
TABLE tablets IS 'Tabela de tablets instalados nos veículos';

COMMENT ON TABLE campanhas IS 'Tabela de campanhas publicitárias';

COMMENT ON
TABLE midias IS 'Tabela de mídias (imagens/vídeos) das campanhas';

COMMENT ON
TABLE campanha_tablet IS 'Relacionamento many-to-many entre campanhas e tablets';

COMMENT ON
TABLE pagamentos IS 'Tabela de pagamentos realizados pelas empresas';

COMMENT ON TABLE repasses IS 'Tabela de repasses para motoristas';

COMMENT ON
TABLE ganhos_motorista IS 'Histórico de ganhos diários dos motoristas';

COMMENT ON
TABLE visualizacoes_campanha IS 'Log de visualizações das campanhas';

COMMENT ON TABLE notificacoes IS 'Tabela de notificações do sistema';

COMMENT ON TABLE tickets_suporte IS 'Tabela de tickets de suporte';

COMMENT ON
TABLE mensagens_ticket IS 'Mensagens dos tickets de suporte';

COMMENT ON TABLE activity_logs IS 'Logs de atividades do sistema';

COMMENT ON
TABLE configuracoes_sistema IS 'Configurações gerais do sistema';

COMMENT ON TABLE planos IS 'Planos de assinatura disponíveis';

COMMENT ON TABLE assinaturas_empresa IS 'Assinaturas das empresas';

COMMENT ON
TABLE historico_localizacao IS 'Histórico de localização dos tablets';

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configurações padrão do sistema
INSERT INTO
    configuracoes_sistema (
        chave,
        valor,
        tipo,
        descricao,
        categoria
    )
VALUES (
        'valor_por_visualizacao_padrao',
        '0.10',
        'number',
        'Valor padrão pago por visualização',
        'financeiro'
    ),
    (
        'limite_tentativas_login',
        '3',
        'number',
        'Número máximo de tentativas de login',
        'seguranca'
    ),
    (
        'tempo_sessao_minutos',
        '60',
        'number',
        'Tempo de sessão em minutos',
        'seguranca'
    ),
    (
        'email_suporte',
        'suporte@movello.com',
        'string',
        'Email de suporte',
        'contato'
    ),
    (
        'telefone_suporte',
        '(00) 0000-0000',
        'string',
        'Telefone de suporte',
        'contato'
    ) ON CONFLICT (chave) DO NOTHING;

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabelas criadas: ' || COUNT(*)::text as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
);