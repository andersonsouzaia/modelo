-- ============================================
-- SCHEMA COMPLETO DO BANCO DE DADOS MOVELLO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Versão: 1.0
-- Data: 2024

-- ============================================
-- EXTENSÕES
-- ============================================

-- Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    instagram VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'aguardando_aprovacao' CHECK (
        status IN (
            'aguardando_aprovacao',
            'ativa',
            'bloqueada'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nivel_acesso VARCHAR(50) DEFAULT 'admin',
    ativo BOOLEAN DEFAULT true,
    user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tablets (criada antes de motoristas para evitar dependência circular)
CREATE TABLE IF NOT EXISTS tablets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    motorista_id UUID,
    status VARCHAR(20) DEFAULT 'offline' CHECK (
        status IN (
            'ativo',
            'offline',
            'manutencao'
        )
    ),
    last_location JSONB,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Motoristas
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf VARCHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    veiculo VARCHAR(100) NOT NULL,
    placa VARCHAR(7) NOT NULL,
    status VARCHAR(20) DEFAULT 'aguardando_aprovacao' CHECK (
        status IN (
            'aguardando_aprovacao',
            'aprovado',
            'bloqueado'
        )
    ),
    tablet_id UUID REFERENCES tablets (id) ON DELETE SET NULL,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona foreign key de tablets para motoristas após criar motoristas
ALTER TABLE tablets
ADD CONSTRAINT fk_tablets_motorista FOREIGN KEY (motorista_id) REFERENCES motoristas (id) ON DELETE SET NULL;

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS campanhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas (id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'em_analise' CHECK (
        status IN (
            'em_analise',
            'aprovada',
            'reprovada',
            'ativa',
            'pausada'
        )
    ),
    regiao VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    frequencia INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mídias
CREATE TABLE IF NOT EXISTS midias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas (id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('video', 'imagem')),
    url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'em_analise' CHECK (
        status IN (
            'em_analise',
            'aprovada',
            'reprovada'
        )
    ),
    motivo_reprovacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índices para Empresas
CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas (email);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas (cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas (status);

-- Índices para Motoristas
CREATE INDEX IF NOT EXISTS idx_motoristas_user_id ON motoristas (user_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_cpf ON motoristas (cpf);
CREATE INDEX IF NOT EXISTS idx_motoristas_status ON motoristas (status);
CREATE INDEX IF NOT EXISTS idx_motoristas_tablet_id ON motoristas (tablet_id);

-- Índices para Admins
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);
CREATE INDEX IF NOT EXISTS idx_admins_ativo ON admins (ativo);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins (user_id);

-- Índices para Tablets
CREATE INDEX IF NOT EXISTS idx_tablets_motorista_id ON tablets (motorista_id);
CREATE INDEX IF NOT EXISTS idx_tablets_status ON tablets (status);
CREATE INDEX IF NOT EXISTS idx_tablets_serial_number ON tablets (serial_number);

-- Índices para Campanhas
CREATE INDEX IF NOT EXISTS idx_campanhas_empresa_id ON campanhas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status ON campanhas (status);
CREATE INDEX IF NOT EXISTS idx_campanhas_data_inicio ON campanhas (data_inicio);
CREATE INDEX IF NOT EXISTS idx_campanhas_data_fim ON campanhas (data_fim);

-- Índices para Mídias
CREATE INDEX IF NOT EXISTS idx_midias_campanha_id ON midias (campanha_id);
CREATE INDEX IF NOT EXISTS idx_midias_status ON midias (status);

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

-- Triggers para atualizar updated_at
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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilita RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE midias ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA EMPRESAS
-- ============================================

-- Empresas podem ver seus próprios dados
CREATE POLICY "Empresas podem ver seus próprios dados" 
    ON empresas FOR SELECT 
    USING (auth.uid() = id);

-- Empresas podem atualizar seus próprios dados
CREATE POLICY "Empresas podem atualizar seus próprios dados" 
    ON empresas FOR UPDATE 
    USING (auth.uid() = id);

-- Empresas podem inserir seus próprios dados (no cadastro)
CREATE POLICY "Empresas podem inserir seus próprios dados" 
    ON empresas FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS RLS PARA MOTORISTAS
-- ============================================

-- Motoristas podem ver seus próprios dados
CREATE POLICY "Motoristas podem ver seus próprios dados" 
    ON motoristas FOR SELECT 
    USING (auth.uid() = user_id);

-- Motoristas podem atualizar seus próprios dados
CREATE POLICY "Motoristas podem atualizar seus próprios dados" 
    ON motoristas FOR UPDATE 
    USING (auth.uid() = user_id);

-- Motoristas podem inserir seus próprios dados (no cadastro)
CREATE POLICY "Motoristas podem inserir seus próprios dados" 
    ON motoristas FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS PARA CAMPANHAS
-- ============================================

-- Empresas podem ver suas próprias campanhas
CREATE POLICY "Empresas podem ver suas próprias campanhas" 
    ON campanhas FOR SELECT 
    USING (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid()
        )
    );

-- Empresas podem criar campanhas
CREATE POLICY "Empresas podem criar campanhas" 
    ON campanhas FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid()
        )
    );

-- Empresas podem atualizar suas próprias campanhas
CREATE POLICY "Empresas podem atualizar suas próprias campanhas" 
    ON campanhas FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid()
        )
    );

-- Empresas podem deletar suas próprias campanhas (apenas se em análise)
CREATE POLICY "Empresas podem deletar suas próprias campanhas" 
    ON campanhas FOR DELETE 
    USING (
        EXISTS (
            SELECT 1
            FROM empresas
            WHERE empresas.id = campanhas.empresa_id
            AND empresas.id = auth.uid()
            AND campanhas.status = 'em_analise'
        )
    );

-- ============================================
-- POLÍTICAS RLS PARA MÍDIAS
-- ============================================

-- Empresas podem ver mídias de suas campanhas
CREATE POLICY "Empresas podem ver mídias de suas campanhas" 
    ON midias FOR SELECT 
    USING (
        EXISTS (
            SELECT 1
            FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid()
        )
    );

-- Empresas podem criar mídias para suas campanhas
CREATE POLICY "Empresas podem criar mídias para suas campanhas" 
    ON midias FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid()
        )
    );

-- Empresas podem atualizar mídias de suas campanhas (apenas se em análise)
CREATE POLICY "Empresas podem atualizar mídias de suas campanhas" 
    ON midias FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1
            FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid()
            AND midias.status = 'em_analise'
        )
    );

-- Empresas podem deletar mídias de suas campanhas (apenas se em análise)
CREATE POLICY "Empresas podem deletar mídias de suas campanhas" 
    ON midias FOR DELETE 
    USING (
        EXISTS (
            SELECT 1
            FROM campanhas
            JOIN empresas ON empresas.id = campanhas.empresa_id
            WHERE campanhas.id = midias.campanha_id
            AND empresas.id = auth.uid()
            AND midias.status = 'em_analise'
        )
    );

-- ============================================
-- POLÍTICAS RLS PARA ADMINS (ACESSO TOTAL)
-- ============================================

-- Admins têm acesso total a empresas
CREATE POLICY "Admins têm acesso total a empresas" 
    ON empresas FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- Admins têm acesso total a motoristas
CREATE POLICY "Admins têm acesso total a motoristas" 
    ON motoristas FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- Admins têm acesso total a tablets
CREATE POLICY "Admins têm acesso total a tablets" 
    ON tablets FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- Admins têm acesso total a campanhas
CREATE POLICY "Admins têm acesso total a campanhas" 
    ON campanhas FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- Admins têm acesso total a mídias
CREATE POLICY "Admins têm acesso total a mídias" 
    ON midias FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- Admins podem ver e gerenciar outros admins
CREATE POLICY "Admins podem gerenciar outros admins" 
    ON admins FOR ALL 
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    );

-- ============================================
-- POLÍTICAS RLS PARA TABLETS
-- ============================================

-- Motoristas podem ver seu próprio tablet
CREATE POLICY "Motoristas podem ver seu próprio tablet" 
    ON tablets FOR SELECT 
    USING (
        EXISTS (
            SELECT 1
            FROM motoristas
            WHERE motoristas.user_id = auth.uid()
            AND motoristas.tablet_id = tablets.id
        )
    );

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE empresas IS 'Tabela de empresas anunciantes';
COMMENT ON TABLE motoristas IS 'Tabela de motoristas parceiros';
COMMENT ON TABLE admins IS 'Tabela de administradores do sistema';
COMMENT ON TABLE tablets IS 'Tabela de tablets instalados nos veículos';
COMMENT ON TABLE campanhas IS 'Tabela de campanhas publicitárias';
COMMENT ON TABLE midias IS 'Tabela de mídias (imagens/vídeos) das campanhas';

-- ============================================
-- FIM DO SCHEMA
-- ============================================

