-- ============================================
-- SCRIPT PARA CRIAR ADMIN NO MOVELLO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Substitua os valores entre < > antes de executar

-- ============================================
-- PASSO 1: Criar usuário no Supabase Auth
-- ============================================
-- Você precisa criar o usuário primeiro através da interface do Supabase:
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Preencha:
--    - Email: <seu-email-admin@exemplo.com>
--    - Password: <sua-senha-forte>
--    - Auto Confirm User: ✅ (marcar)
-- 4. Copie o User ID gerado
-- 5. Use esse User ID no PASSO 2 abaixo

-- ============================================
-- PASSO 2: Criar registro na tabela admins
-- ============================================
-- Substitua <USER_ID_AQUI> pelo User ID copiado no PASSO 1
-- Substitua <EMAIL_AQUI> pelo email do admin

INSERT INTO admins (
  id,
  email,
  nivel_acesso,
  ativo,
  user_id,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '<EMAIL_AQUI>',  -- Exemplo: 'admin@movello.com'
  'admin',
  true,
  '<USER_ID_AQUI>'::uuid,  -- Cole o User ID aqui
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  ativo = true,
  updated_at = NOW();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute esta query para verificar se o admin foi criado:
SELECT 
  id,
  email,
  nivel_acesso,
  ativo,
  user_id,
  created_at
FROM admins
WHERE email = '<EMAIL_AQUI>';

-- ============================================
-- SCRIPT COMPLETO (TUDO EM UM)
-- ============================================
-- Se você já tem o User ID, execute apenas esta parte:

-- Exemplo prático (substitua pelos seus valores):
/*
INSERT INTO admins (
  id,
  email,
  nivel_acesso,
  ativo,
  user_id,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin@movello.com',
  'admin',
  true,
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Cole o User ID real aqui
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  ativo = true,
  updated_at = NOW();
*/
