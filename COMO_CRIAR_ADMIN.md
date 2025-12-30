# 👤 Como Criar um Admin no Movello

## ⚠️ Problema Identificado

Os erros **406 (Not Acceptable)** e **Auth session missing** ocorrem porque:
1. O usuário não está autenticado quando o sistema tenta fazer queries
2. As políticas RLS estão bloqueando as requisições sem sessão

## ✅ Solução: Criar Admin Corretamente

### Método 1: Via Dashboard do Supabase (Recomendado)

#### Passo 1: Criar Usuário no Auth

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Clique em **"Add user"** > **"Create new user"**
4. Preencha:
   - **Email**: `admin@movello.com` (ou o email que você quiser)
   - **Password**: (crie uma senha forte)
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
5. Clique em **"Create user"**
6. **Copie o "User UID"** que aparece (será algo como `577735a8-aa45-4a28-9d22-1472c18c27a5`)

#### Passo 2: Criar Registro na Tabela Admins

1. Acesse o **SQL Editor** no Supabase
2. Execute o seguinte SQL, substituindo os valores:

```sql
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
  'admin@movello.com',  -- Use o mesmo email do Passo 1
  'admin',
  true,
  '577735a8-aa45-4a28-9d22-1472c18c27a5'::uuid,  -- Cole o User UID aqui
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  ativo = true,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();
```

#### Passo 3: Verificar

Execute esta query para verificar:

```sql
SELECT 
  a.id,
  a.email,
  a.nivel_acesso,
  a.ativo,
  a.user_id,
  u.email as auth_email,
  u.email_confirmed_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ Usuário não encontrado no auth.users'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email não confirmado'
    ELSE '✅ Tudo OK'
  END as status
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
WHERE a.email = 'admin@movello.com';
```

#### Passo 4: Testar Login

1. Acesse `/login-admin` na aplicação
2. Use o email e senha criados no Passo 1
3. Deve fazer login e redirecionar para `/admin/dashboard`

---

## 🔧 Scripts SQL Disponíveis

### 1. `SQL_CREATE_ADMIN_COMPLETO.sql`
Script completo com exemplos práticos para criar admin.

### 2. `SQL_FIX_RLS_ADMINS.sql`
Corrige políticas RLS para admins (resolve erro 406).

### 3. `SQL_VERIFICAR_RLS.sql`
Verifica todas as políticas RLS e status de autenticação.

---

## 🐛 Troubleshooting

### Erro 406 (Not Acceptable)
**Causa**: Usuário não está autenticado ou RLS está bloqueando.

**Solução**:
1. Execute `SQL_FIX_RLS_ADMINS.sql`
2. Certifique-se de que "Auto Confirm User" foi marcado ao criar o usuário
3. Faça logout e login novamente

### Erro: "Auth session missing"
**Causa**: Não há sessão ativa no navegador.

**Solução**:
1. Limpe os cookies do navegador
2. Faça login novamente
3. Verifique se o email foi confirmado

### Admin criado mas não consegue fazer login
**Causa**: Email não confirmado ou user_id incorreto.

**Solução**:
1. Verifique se "Auto Confirm User" foi marcado
2. Verifique se o user_id na tabela admins corresponde ao auth.users
3. Execute a query de verificação do Passo 3

### Admin criado mas não aparece no dashboard
**Causa**: Política RLS não permite acesso.

**Solução**:
1. Execute `SQL_FIX_RLS_ADMINS.sql`
2. Verifique se `ativo = true` na tabela admins
3. Verifique se o user_id corresponde ao auth.uid() do usuário logado

---

## 📝 Exemplo Prático Completo

Se você já tem o User UID `577735a8-aa45-4a28-9d22-1472c18c27a5`:

```sql
-- Criar admin
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

-- Verificar
SELECT 
  a.*,
  u.email as auth_email,
  u.email_confirmed_at
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
WHERE a.email = 'admin@movello.com';
```

---

## ✅ Checklist Final

- [ ] Usuário criado no Authentication > Users
- [ ] "Auto Confirm User" marcado ✅
- [ ] User UID copiado
- [ ] Registro criado na tabela admins
- [ ] user_id corresponde ao User UID
- [ ] ativo = true
- [ ] Políticas RLS verificadas
- [ ] Login testado com sucesso

---

## 📚 Arquivos Relacionados

- `SQL_CREATE_ADMIN_COMPLETO.sql` - Script completo
- `SQL_FIX_RLS_ADMINS.sql` - Corrige políticas RLS
- `SQL_VERIFICAR_RLS.sql` - Verifica políticas
- `create-admin.sql` - Script básico original




