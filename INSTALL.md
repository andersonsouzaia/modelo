# 📦 Guia de Instalação Completo - Movello

## Passo a Passo para Configurar o Banco de Dados

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: Movello (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Executar Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `schema.sql` deste projeto
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)
7. Aguarde a execução (deve mostrar "Success")

### 3. Configurar Storage

#### 3.1 Criar Bucket

1. No painel do Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `midias`
   - **Public bucket**: ✅ Marque como público
   - **File size limit**: 100 MB (ou conforme necessário)
   - **Allowed MIME types**: `image/*,video/*`
4. Clique em **Create bucket**

#### 3.2 Configurar Políticas de Storage

1. Vá em **SQL Editor** novamente
2. Abra o arquivo `storage-setup.sql` deste projeto
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**

### 4. Criar Primeiro Admin

#### Opção A: Via SQL (Recomendado)

1. Vá em **SQL Editor**
2. Abra o arquivo `create-admin.sql`
3. **IMPORTANTE**: Substitua os valores:
   - `admin@movello.com` → Seu email
   - `sua_senha_segura_aqui` → Sua senha
4. Execute o PASSO 1 primeiro
5. Copie o ID retornado
6. Execute o PASSO 2 com o ID copiado

#### Opção B: Via Dashboard

1. Vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - **Email**: seu@email.com
   - **Password**: sua senha
4. Copie o **User ID** gerado
5. Vá em **SQL Editor** e execute apenas o PASSO 2 do `create-admin.sql`:
```sql
INSERT INTO admins (user_id, email, nivel_acesso, ativo)
VALUES (
    'COLE_O_USER_ID_AQUI',
    'seu@email.com',
    'admin',
    true
);
```

### 5. Configurar Google OAuth (Opcional)

1. No painel do Supabase, vá em **Authentication** > **Providers**
2. Encontre **Google** na lista
3. Clique para ativar
4. Configure:
   - **Client ID**: Obtenha no Google Cloud Console
   - **Client Secret**: Obtenha no Google Cloud Console
5. No Google Cloud Console, adicione como Redirect URI:
   - `https://SEU_PROJETO.supabase.co/auth/v1/callback`
   - Para desenvolvimento local: `http://localhost:3000/auth/callback`

### 6. Obter Credenciais do Supabase

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`
   - **service_role key**: `eyJhbGci...` (mantenha secreto!)

### 7. Configurar Variáveis de Ambiente

1. No projeto local, edite o arquivo `.env.local`
2. Substitua pelos valores do seu projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### 8. Verificar Instalação

Execute no SQL Editor para verificar:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar políticas RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar admin criado
SELECT * FROM admins;

-- Verificar bucket criado
SELECT * FROM storage.buckets WHERE name = 'midias';
```

### 9. Testar Aplicação

1. No terminal, execute:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:3000

3. Teste os fluxos:
   - Criar conta empresa
   - Criar conta motorista
   - Login admin

## ✅ Checklist de Instalação

- [ ] Projeto Supabase criado
- [ ] Schema SQL executado (`schema.sql`)
- [ ] Bucket `midias` criado
- [ ] Políticas de Storage configuradas (`storage-setup.sql`)
- [ ] Primeiro admin criado (`create-admin.sql`)
- [ ] Google OAuth configurado (opcional)
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Aplicação testada localmente

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Verifique se executou o `schema.sql` completamente
- Verifique se está no projeto correto do Supabase

### Erro: "permission denied"
- Verifique se as políticas RLS foram criadas
- Verifique se o usuário está autenticado

### Erro: "bucket not found"
- Verifique se o bucket `midias` foi criado
- Verifique se o nome está correto (case-sensitive)

### Erro ao criar admin
- Verifique se o email já não existe em `auth.users`
- Verifique se o User ID está correto

## 📝 Arquivos SQL Incluídos

1. **schema.sql** - Schema completo do banco (tabelas, índices, triggers, RLS)
2. **storage-setup.sql** - Configuração de políticas do Storage
3. **create-admin.sql** - Script para criar primeiro admin

## 🔒 Segurança

- ⚠️ **NUNCA** compartilhe a `service_role key` publicamente
- ⚠️ Mantenha o arquivo `.env.local` no `.gitignore`
- ⚠️ Use senhas fortes para o admin
- ⚠️ Revise as políticas RLS antes de produção

