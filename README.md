# Movello - Plataforma de Publicidade

Aplicação web completa para gestão de campanhas publicitárias em tablets instalados em veículos.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase configurada

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zbjugppnyeyxtrenflmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpianVncHBueWV5eHRyZW5mbG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjA0MDgsImV4cCI6MjA4MTczNjQwOH0.7MIQtUpFP_kLZTl53b-aJmmvsRN_hZJrDjYIsF0N65w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpianVncHBueWV5eHRyZW5mbG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2MDQwOCwiZXhwIjoyMDgxNzM2NDA4fQ.OQa-NYgKGQFs4Icaq5TyNz49vHLHd0HbNLRCW-m1Eag
```

3. Configure o Storage no Supabase:

- Acesse o painel do Supabase
- Vá em Storage
- Crie um bucket chamado `midias` com permissões públicas

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 📋 Estrutura do Projeto

```
movello-app/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Dashboards por perfil
│   ├── auth/              # Callbacks OAuth
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/
│   └── ui/                # Componentes reutilizáveis
├── contexts/              # Context API (Auth, Notifications)
├── hooks/                 # Hooks customizados
├── lib/
│   ├── supabase.ts        # Cliente Supabase
│   └── utils/             # Utilitários (validações, formatações)
└── types/                 # Tipos TypeScript
```

## 🔐 Perfis de Acesso

### 1. Empresa (Anunciante)
- **Login**: Email + Senha
- **Cadastro**: Disponível na tela de login
- **Limite**: 3 tentativas de login
- **Dashboard**: `/empresa/dashboard`
- **Funcionalidades**:
  - Criar e editar campanhas
  - Upload de mídias (imagens/vídeos)
  - Visualizar status das campanhas
  - Pausar/ativar campanhas
  - Visualizar campanhas recentes

### 2. Motorista
- **Login**: Email/Senha ou Google OAuth
- **Cadastro**: Disponível na tela de login (Email/Senha) ou automático após login Google
- **Limite**: 3 tentativas de login (apenas para Email/Senha)
- **Dashboard**: `/motorista/dashboard`
- **Funcionalidades**:
  - Visualizar status do tablet
  - Ver ganhos do dia/mês
  - Reportar problemas

### 3. Admin Movello
- **Login**: Email + Senha
- **Cadastro**: Apenas interno (sem opção pública)
- **Dashboard**: `/admin/dashboard`
- **Funcionalidades**:
  - Aprovar/reprovar empresas
  - Aprovar/reprovar motoristas
  - Aprovar/reprovar mídias
  - Vincular tablets a motoristas
  - Visualizar estatísticas gerais
  - Dashboard com alertas de pendências

## 🎨 Design

- **Fundo**: Branco
- **Cor primária**: Azul claro (#E3F2FD)
- **Cor secundária**: Azul (#2196F3)
- **Framework**: Tailwind CSS
- **Ícones**: Lucide React

## ✨ Funcionalidades Implementadas

### Componentes UI
- ✅ Button (com variantes e estados)
- ✅ Input (com validação e mensagens de erro)
- ✅ Textarea
- ✅ Select
- ✅ Modal
- ✅ Toast/Notificações
- ✅ Loading/Skeleton
- ✅ Badge
- ✅ FileUpload (com preview)

### Autenticação
- ✅ Login Empresa (Email/Senha)
- ✅ Login Motorista (Email/Senha ou Google OAuth)
- ✅ Login Admin (Email/Senha)
- ✅ Cadastro Empresa
- ✅ Cadastro Motorista (Email/Senha)
- ✅ Completar Cadastro Motorista (após Google OAuth ou cadastro incompleto)
- ✅ Context API para autenticação global
- ✅ Proteção de rotas

### Empresa
- ✅ Dashboard com campanhas recentes
- ✅ Criar campanha
- ✅ Editar campanha (apenas se em análise)
- ✅ Listar campanhas com filtros e busca
- ✅ Upload de mídias (imagem/vídeo)
- ✅ Visualizar mídias da campanha
- ✅ Pausar/ativar campanhas
- ✅ Deletar campanhas (apenas se em análise)

### Admin
- ✅ Dashboard com estatísticas
- ✅ Alertas de aprovações pendentes
- ✅ Aprovar/reprovar empresas
- ✅ Aprovar/reprovar motoristas
- ✅ Aprovar/reprovar mídias (com motivo)
- ✅ Vincular tablets a motoristas
- ✅ Busca e filtros em todas as listagens

### Motorista
- ✅ Dashboard com status
- ✅ Visualizar status do tablet
- ✅ Visualizar ganhos (estrutura pronta)

### Utilitários
- ✅ Validação de CPF/CNPJ
- ✅ Formatação de dados (CPF, CNPJ, telefone, moeda, data)
- ✅ Validação de senha
- ✅ Validação de email

## 📝 Próximos Passos

1. **Configurar OAuth do Google no Supabase**:
   - Acesse o painel do Supabase
   - Vá em Authentication > Providers
   - Configure o Google OAuth

2. **Criar primeiro admin**:
   - Use o SQL Editor do Supabase
   - Crie um usuário em `auth.users`
   - Crie registro correspondente em `admins`

3. **Configurar Storage**:
   - Crie bucket `midias` no Supabase Storage
   - Configure permissões públicas para leitura

4. **Funcionalidades Futuras**:
   - Dashboard financeiro com gráficos
   - Gestão de tablets com mapa
   - Sistema de notificações em tempo real
   - Relatórios exportáveis
   - Histórico de ganhos do motorista
   - Sistema de suporte/tickets

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend, autenticação e storage
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado global
- **Custom Hooks** - Lógica reutilizável

## 📄 Licença

Proprietário - Movello

## 🐛 Troubleshooting

### Erro ao fazer upload de mídia
- Verifique se o bucket `midias` foi criado no Supabase Storage
- Verifique as permissões do bucket (deve ser público para leitura)

### Erro de autenticação
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Verifique se o OAuth do Google está configurado no Supabase

### Erro ao criar empresa
- Verifique se o email já não está cadastrado
- Verifique se o CNPJ já não está cadastrado
