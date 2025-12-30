-- ============================================
-- SCRIPT COMPLETO PARA CRIAR ADMIN
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Substitua os valores entre < > antes de executar

-- ============================================
-- PASSO 1: Criar usuário no auth.users
-- ============================================
-- NOTA: Este passo deve ser feito manualmente no Dashboard do Supabase:
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Preencha email e senha
-- 4. MARQUE "Auto Confirm User" ✅
-- 5. Copie o User UID gerado

-- ============================================
-- PASSO 2: Criar registro na tabela admins
-- ============================================
-- Substitua <USER_ID> pelo User UID copiado acima
-- Substitua <EMAIL> pelo email usado no Passo 1

INSERT INTO admins (
  id,
  email,
  nivel_acesso,
  ativo,
  user_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '<EMAIL>',  -- Exemplo: 'admin@movello.com'
  'admin',
  true,
  '<USER_ID>'::uuid,  -- Cole o User UID aqui (ex: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  ativo = true,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- ============================================
-- PASSO 3: Verificar se foi criado corretamente
-- ============================================

SELECT 
  a.id,
  a.email,
  a.nivel_acesso,
  a.ativo,
  a.user_id,
  u.email as auth_email,
  u.email_confirmed_at,
  u.created_at as user_created_at
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
WHERE a.email = '<EMAIL>';  -- Use o mesmo email do Passo 2

-- ============================================
-- EXEMPLO PRÁTICO
-- ============================================
-- Se o email for admin@movello.com e o User UID for 577735a8-aa45-4a28-9d22-1472c18c27a5:

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
  gen_random_uuid(),
  'admin@movello.com',
  'admin',
  true,
  '577735a8-aa45-4a28-9d22-1472c18c27a5'::uuid,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  ativo = true,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();
*/

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute esta query para ver todos os admins:

SELECT 
  a.*,
  u.email as auth_email,
  CASE 
    WHEN u.id IS NULL THEN '❌ Usuário não encontrado no auth.users'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email não confirmado'
    ELSE '✅ Tudo OK'
  END as status
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
ORDER BY a.created_at DESC;
