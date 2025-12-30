-- ============================================
-- CORREÇÃO COMPLETA PARA INSERT EM USERS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script corrige o problema de erro 500 ao criar registro em users

-- ============================================
-- PROBLEMA IDENTIFICADO
-- ============================================
-- 1. O trigger sync_user_from_auth() tenta criar automaticamente em users
-- 2. Mas pode falhar por RLS ou conflito
-- 3. Quando tentamos criar manualmente, pode dar erro 500

-- ============================================
-- SOLUÇÃO 1: Corrigir Trigger para usar SECURITY DEFINER
-- ============================================

-- Remover trigger antigo
DROP TRIGGER IF EXISTS sync_user_on_auth_insert ON auth.users;

-- Remover função antiga
DROP FUNCTION IF EXISTS sync_user_from_auth();

-- Criar função corrigida com SECURITY DEFINER (bypass RLS)
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir em users com SECURITY DEFINER (bypass RLS)
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO UPDATE
    SET email = NEW.email, updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se falhar, apenas logar e continuar (não bloquear criação do auth user)
        RAISE WARNING 'Erro ao sincronizar user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER sync_user_on_auth_insert
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();

-- ============================================
-- SOLUÇÃO 2: Garantir Política RLS para INSERT
-- ============================================

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users podem inserir seus próprios dados" ON users;

-- Criar política de INSERT para users
CREATE POLICY "Users podem inserir seus próprios dados" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Garantir políticas de SELECT e UPDATE
DROP POLICY IF EXISTS "Users podem ver seus próprios dados" ON users;
CREATE POLICY "Users podem ver seus próprios dados" 
ON users 
FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users podem atualizar seus próprios dados" ON users;
CREATE POLICY "Users podem atualizar seus próprios dados" 
ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- SOLUÇÃO 3: Permitir que trigger funcione mesmo sem RLS
-- ============================================
-- A função já usa SECURITY DEFINER, então deve funcionar

-- ============================================
-- SOLUÇÃO 4: Modificar código para lidar com trigger
-- ============================================
-- O código deve verificar se o registro já existe antes de tentar criar
-- OU usar ON CONFLICT DO NOTHING

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se a função foi criada
SELECT 
    proname, 
    prosecdef as is_security_definer,
    prosrc
FROM pg_proc 
WHERE proname = 'sync_user_from_auth';

-- Verificar políticas de users
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Verificar trigger
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'sync_user_on_auth_insert';

-- ============================================
-- TESTE MANUAL (opcional)
-- ============================================
-- Para testar se funciona, você pode tentar criar um usuário de teste:
-- 1. Criar no auth.users via Dashboard
-- 2. Verificar se foi criado em public.users automaticamente
-- 3. Se não foi, o trigger precisa ser corrigido




