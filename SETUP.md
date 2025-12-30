# 🚀 Guia de Configuração - Movello

## Configuração Inicial do Supabase

### 1. Configurar Storage para Mídias

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure:
   - **Name**: `midias`
   - **Public bucket**: ✅ Marque como público
   - **File size limit**: 100 MB (ou conforme necessário)
   - **Allowed MIME types**: `image/*,video/*`
6. Clique em **Create bucket**

### 2. Configurar Políticas de Storage (RLS)

No bucket `midias`, configure as políticas:

**Política de Leitura (SELECT)**:
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'midias');
```

**Política de Inserção (INSERT)**:
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'midias');
```

**Política de Atualização (UPDATE)**:
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'midias');
```

**Política de Exclusão (DELETE)**:
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'midias');
```

### 3. Configurar Google OAuth

1. No painel do Supabase, vá em **Authentication** > **Providers**
2. Ative o provider **Google**
3. Configure:
   - **Client ID**: Obtenha no Google Cloud Console
   - **Client Secret**: Obtenha no Google Cloud Console
4. Configure o **Redirect URL** no Google Cloud Console:
   - `https://zbjugppnyeyxtrenflmx.supabase.co/auth/v1/callback`
   - Para desenvolvimento local: `http://localhost:3000/auth/callback`

### 4. Criar Primeiro Admin

Execute no SQL Editor do Supabase:

```sql
-- 1. Criar usuário admin (substitua email e senha)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@movello.com', -- Seu email
  crypt('sua_senha_segura', gen_salt('bf')), -- Sua senha
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  ''
) RETURNING id;

-- 2. Criar registro na tabela admins (use o ID retornado acima)
INSERT INTO admins (user_id, email, nivel_acesso, ativo)
VALUES (
  'ID_DO_USUARIO_CRIADO_ACIMA', -- Substitua pelo ID retornado
  'admin@movello.com',
  'admin',
  true
);
```

### 5. Verificar RLS (Row Level Security)

Certifique-se de que as políticas RLS estão ativas:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('empresas', 'motoristas', 'admins', 'campanhas', 'midias', 'tablets');
```

Todas devem retornar `true` para `rowsecurity`.

## Estrutura de Dados

### Tabelas Principais

- **empresas**: Dados das empresas anunciantes
- **motoristas**: Dados dos motoristas
- **admins**: Administradores do sistema
- **tablets**: Tablets disponíveis
- **campanhas**: Campanhas publicitárias
- **midias**: Mídias (imagens/vídeos) das campanhas

### Status Possíveis

**Empresas**:
- `aguardando_aprovacao`
- `ativa`
- `bloqueada`

**Motoristas**:
- `aguardando_aprovacao`
- `aprovado`
- `bloqueado`

**Campanhas**:
- `em_analise`
- `aprovada`
- `reprovada`
- `ativa`
- `pausada`

**Mídias**:
- `em_analise`
- `aprovada`
- `reprovada`

## Testando a Aplicação

### 1. Teste de Cadastro de Empresa

1. Acesse `/login-empresa`
2. Clique em "Criar conta"
3. Preencha os dados:
   - CNPJ válido
   - Email único
   - Senha com mínimo 8 caracteres
4. Após criar, faça login
5. A empresa ficará com status "aguardando_aprovacao"

### 2. Teste de Login Motorista

1. Acesse `/login-motorista`
2. Clique em "Entrar com Google"
3. Complete o cadastro com:
   - CPF válido
   - Telefone
   - Veículo e placa
4. O motorista ficará com status "aguardando_aprovacao"

### 3. Teste de Admin

1. Acesse `/login-admin`
2. Use as credenciais criadas no passo 4 acima
3. Você terá acesso ao dashboard administrativo

## Troubleshooting

### Erro: "Bucket não encontrado"
- Verifique se o bucket `midias` foi criado
- Verifique se o nome está correto (case-sensitive)

### Erro: "Permissão negada" no upload
- Verifique as políticas RLS do Storage
- Certifique-se de que o usuário está autenticado

### Erro: "OAuth não configurado"
- Verifique se o Google OAuth está ativado no Supabase
- Verifique se as credenciais estão corretas
- Verifique o redirect URL

### Erro: "Usuário não encontrado" no login
- Verifique se o usuário foi criado corretamente
- Verifique se o email está correto
- Verifique se a senha está correta

## Próximos Passos

1. ✅ Configurar Storage
2. ✅ Configurar OAuth
3. ✅ Criar primeiro admin
4. ✅ Testar fluxos principais
5. ⏳ Implementar funcionalidades avançadas (mapa, financeiro, etc.)




