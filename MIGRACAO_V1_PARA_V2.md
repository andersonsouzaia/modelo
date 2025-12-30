# 🔄 Guia de Migração: Schema V1 → V2

## ⚠️ IMPORTANTE

Este guia descreve como migrar os dados do schema antigo (V1) para o novo schema (V2).

**RECOMENDAÇÃO**: Execute primeiro em ambiente de desenvolvimento/teste!

## 📋 Checklist Pré-Migração

- [ ] Backup completo do banco de dados
- [ ] Teste em ambiente de desenvolvimento
- [ ] Verificar se todas as tabelas V1 existem
- [ ] Listar todos os dados existentes
- [ ] Preparar script de rollback

## 🔍 Verificar Dados Existentes

Antes de migrar, execute estas queries para verificar os dados:

```sql
-- Contar registros em cada tabela
SELECT 'empresas' as tabela, COUNT(*) as total FROM empresas
UNION ALL
SELECT 'motoristas', COUNT(*) FROM motoristas
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'tablets', COUNT(*) FROM tablets
UNION ALL
SELECT 'campanhas', COUNT(*) FROM campanhas
UNION ALL
SELECT 'midias', COUNT(*) FROM midias;
```

## 📝 Script de Migração

### Passo 1: Criar Tabela Users e Migrar Dados

```sql
-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('empresa', 'motorista', 'admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'ativo',
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrar empresas para users
INSERT INTO users (id, tipo, email, nome, telefone, status, created_at, updated_at)
SELECT 
    e.id,
    'empresa',
    e.email,
    e.nome,
    NULL,
    CASE 
        WHEN e.status = 'bloqueada' THEN 'bloqueado'
        WHEN e.status = 'ativa' THEN 'ativo'
        ELSE 'inativo'
    END,
    e.created_at,
    e.updated_at
FROM empresas e
ON CONFLICT (id) DO UPDATE
SET 
    tipo = EXCLUDED.tipo,
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    status = EXCLUDED.status;

-- Migrar motoristas para users
INSERT INTO users (id, tipo, email, nome, telefone, status, created_at, updated_at)
SELECT 
    m.user_id,
    'motorista',
    u.email,
    NULL,
    m.telefone,
    CASE 
        WHEN m.status = 'bloqueado' THEN 'bloqueado'
        WHEN m.status = 'aprovado' THEN 'ativo'
        ELSE 'inativo'
    END,
    m.created_at,
    m.updated_at
FROM motoristas m
JOIN auth.users u ON u.id = m.user_id
ON CONFLICT (id) DO UPDATE
SET 
    tipo = EXCLUDED.tipo,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    status = EXCLUDED.status;

-- Migrar admins para users
INSERT INTO users (id, tipo, email, nome, status, created_at, updated_at)
SELECT 
    a.user_id,
    'admin',
    a.email,
    NULL,
    CASE WHEN a.ativo THEN 'ativo' ELSE 'inativo' END,
    a.created_at,
    a.updated_at
FROM admins a
WHERE a.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET 
    tipo = EXCLUDED.tipo,
    email = EXCLUDED.email,
    status = EXCLUDED.status;
```

### Passo 2: Atualizar Tabela Empresas

```sql
-- Adicionar novas colunas se não existirem
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255),
ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefone_comercial VARCHAR(20),
ADD COLUMN IF NOT EXISTS endereco JSONB,
ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE;

-- Copiar nome para razao_social se não existir
UPDATE empresas 
SET razao_social = nome 
WHERE razao_social IS NULL;

-- Atualizar constraint de foreign key para users
ALTER TABLE empresas
DROP CONSTRAINT IF EXISTS empresas_id_fkey,
ADD CONSTRAINT empresas_id_fkey 
FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
```

### Passo 3: Atualizar Tabela Motoristas

```sql
-- Adicionar novas colunas se não existirem
ALTER TABLE motoristas
ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS modelo_veiculo VARCHAR(100),
ADD COLUMN IF NOT EXISTS cor_veiculo VARCHAR(50),
ADD COLUMN IF NOT EXISTS ano_veiculo INTEGER,
ADD COLUMN IF NOT EXISTS endereco JSONB,
ADD COLUMN IF NOT EXISTS banco VARCHAR(100),
ADD COLUMN IF NOT EXISTS agencia VARCHAR(20),
ADD COLUMN IF NOT EXISTS conta VARCHAR(20),
ADD COLUMN IF NOT EXISTS pix VARCHAR(255),
ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE;

-- Atualizar constraint de foreign key para users
ALTER TABLE motoristas
DROP CONSTRAINT IF EXISTS motoristas_user_id_fkey,
ADD CONSTRAINT motoristas_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Passo 4: Atualizar Tabela Admins

```sql
-- Adicionar novas colunas se não existirem
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);

-- Atualizar constraint de foreign key para users
ALTER TABLE admins
DROP CONSTRAINT IF EXISTS admins_user_id_fkey,
ADD CONSTRAINT admins_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Passo 5: Atualizar Tabela Campanhas

```sql
-- Adicionar novas colunas se não existirem
ALTER TABLE campanhas
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS bairros TEXT[],
ADD COLUMN IF NOT EXISTS dias_semana INTEGER[],
ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_por_visualizacao DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS motivo_reprovacao TEXT,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reprovado_por UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reprovado_em TIMESTAMP WITH TIME ZONE;
```

### Passo 6: Atualizar Tabela Mídias

```sql
-- Adicionar novas colunas se não existirem
ALTER TABLE midias
ADD COLUMN IF NOT EXISTS nome_arquivo VARCHAR(255),
ADD COLUMN IF NOT EXISTS tamanho_bytes BIGINT,
ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER,
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE;
```

### Passo 7: Criar Novas Tabelas

Execute o script `schema_completo_v2.sql` para criar todas as novas tabelas.

## ✅ Verificação Pós-Migração

Execute estas queries para verificar se a migração foi bem-sucedida:

```sql
-- Verificar se users foi populada corretamente
SELECT tipo, COUNT(*) as total
FROM users
GROUP BY tipo;

-- Verificar integridade dos dados
SELECT 
    'Empresas sem user' as erro,
    COUNT(*) as total
FROM empresas e
LEFT JOIN users u ON u.id = e.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Motoristas sem user',
    COUNT(*)
FROM motoristas m
LEFT JOIN users u ON u.id = m.user_id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Admins sem user',
    COUNT(*)
FROM admins a
LEFT JOIN users u ON u.id = a.user_id
WHERE a.user_id IS NOT NULL AND u.id IS NULL;
```

## 🔙 Rollback (Se Necessário)

Se algo der errado, você pode reverter:

```sql
-- Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- Remover tabela users (cuidado!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Restaurar constraints antigas
-- (Execute os comandos ALTER TABLE reversos)
```

## 📚 Próximos Passos

Após a migração bem-sucedida:

1. Atualizar código da aplicação para usar nova estrutura
2. Testar todas as funcionalidades
3. Migrar dados históricos se necessário
4. Configurar novos recursos (notificações, tickets, etc.)




