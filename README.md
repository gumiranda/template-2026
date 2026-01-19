# CrazyTemplate - Shadcn/UI Monorepo Template

![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Convex](https://img.shields.io/badge/Convex-1.25-FF6B6B?logo=convex)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwindcss)
![pnpm](https://img.shields.io/badge/pnpm-10.17-F69220?logo=pnpm)

Template SaaS full-stack moderno com autenticacao, backend real-time, sistema de aprovacao de usuarios e biblioteca de componentes UI.

---

## Funcionalidades Principais

- **Autenticacao via Clerk** - Login social e tradicional com gerenciamento de sessoes
- **Backend real-time com Convex** - Banco de dados serverless com atualizacoes em tempo real
- **Sistema de aprovacao de usuarios** - Fluxo de aprovacao/rejeicao para novos usuarios
- **Controle de acesso por roles** - SUPERADMIN, CEO e USER com permissoes granulares
- **51+ componentes shadcn/ui** - Biblioteca completa de componentes acessiveis
- **Sistema de assinaturas com Stripe** - Gestao de planos e billing

---

## Tech Stack Completo

### Frontend
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| Next.js | 15.4.10 | Framework React com App Router |
| React | 19.1.1 | Biblioteca UI |
| TypeScript | 5.9.2 | Tipagem estatica |
| Tailwind CSS | 4.1.11 | Framework CSS utility-first |
| Framer Motion | 12.23.24 | Animacoes |

### Backend
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| Convex | 1.25.4 | Backend serverless real-time |
| Clerk | 6.36.0 | Autenticacao e gerenciamento de usuarios |
| Zod | 3.25.76 | Validacao de schemas |

### UI Components
| Tecnologia | Descricao |
|------------|-----------|
| shadcn/ui | Componentes base |
| Radix UI | Primitivos acessiveis |
| Lucide React | Icones |
| Recharts | Graficos |
| Sonner | Notificacoes toast |

### Monorepo & Tooling
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| pnpm | 10.17.0 | Gerenciador de pacotes |
| Turborepo | 2.5.5 | Build system para monorepos |
| ESLint | - | Linting |
| Prettier | 3.6.2 | Formatacao de codigo |

---

## Pre-requisitos

Antes de comecar, certifique-se de ter instalado:

- **Node.js** >= 20 ([download](https://nodejs.org/))
- **pnpm** >= 10.17.0 (`npm install -g pnpm@10.17.0`)
- **Conta no Clerk** (gratuita) - [clerk.com](https://clerk.com)
- **Conta no Convex** (gratuita) - [convex.dev](https://convex.dev)

Opcional para producao:
- **Conta no Stripe** - [stripe.com](https://stripe.com)
- **Conta na Vercel** - [vercel.com](https://vercel.com)

---

## Estrutura do Projeto

```
template/
├── apps/
│   └── web/                    # Frontend Next.js
│       ├── app/                # App Router (pages e layouts)
│       ├── components/         # Componentes especificos do app
│       ├── hooks/              # Hooks customizados
│       └── lib/                # Utilitarios e helpers
│
├── packages/
│   ├── backend/                # Convex backend
│   │   ├── convex/             # Funcoes e schema do Convex
│   │   │   ├── schema.ts       # Definicao das tabelas
│   │   │   ├── users.ts        # Funcoes de usuarios
│   │   │   └── auth.config.ts  # Configuracao do Clerk
│   │   ├── .env.dev            # Variaveis ambiente DEV
│   │   └── .env.prod           # Variaveis ambiente PROD
│   │
│   ├── ui/                     # Componentes compartilhados (51+)
│   │   └── src/
│   │       ├── components/     # Componentes shadcn/ui
│   │       ├── hooks/          # Hooks compartilhados
│   │       └── lib/            # Utils (cn, etc)
│   │
│   ├── eslint-config/          # Configuracao ESLint compartilhada
│   └── typescript-config/      # Configuracao TypeScript compartilhada
│
├── package.json                # Scripts e dependencias raiz
├── pnpm-workspace.yaml         # Configuracao do workspace
├── turbo.json                  # Configuracao do Turborepo
└── tsconfig.json               # TypeScript base
```

---

## Configuracao Passo a Passo

### 1. Clonar e Instalar Dependencias

```bash
# Clonar o repositorio
git clone <url-do-repositorio>
cd template

# Instalar dependencias
pnpm install
```

### 2. Configurar o Clerk

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Crie uma nova aplicacao (ou use uma existente)
3. Anote as credenciais:
   - **Publishable Key** (pk_test_xxx ou pk_live_xxx)
   - **Secret Key** (sk_test_xxx ou sk_live_xxx)
   - **Frontend API URL** (https://sua-instancia.clerk.accounts.dev)

4. Configure o JWT Template para Convex:
   - Va em **Configure > JWT Templates**
   - Clique em **New template**
   - Selecione **Convex**
   - Mantenha o nome como `convex`
   - Clique em **Save**

### 3. Configurar o Convex

1. Na pasta do backend, execute o setup:
```bash
cd packages/backend
pnpm setup
```

2. Isso criara um novo projeto Convex e gerara o arquivo `.env.local`

3. Acesse [dashboard.convex.dev](https://dashboard.convex.dev)
4. Selecione seu projeto
5. Va em **Settings > Environment Variables**
6. Adicione as seguintes variaveis:

| Variavel | Valor |
|----------|-------|
| `CLERK_JWT_ISSUER_DOMAIN` | `https://sua-instancia.clerk.accounts.dev` |
| `CLERK_SECRET_KEY` | Sua Secret Key do Clerk |

### 4. Configurar Variaveis de Ambiente

#### Frontend (apps/web/.env.local)

Crie o arquivo `apps/web/.env.local`:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://seu-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://sua-instancia.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Rotas de autenticacao
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/select-sector
 
```

#### Backend (packages/backend/.env.local)

Crie o arquivo `packages/backend/.env.local`:

```env
# Convex (gerado automaticamente pelo setup)
CONVEX_DEPLOYMENT=seu-deployment-id
CONVEX_URL=https://seu-deployment.convex.cloud

# Clerk
CLERK_JWT_ISSUER_DOMAIN=https://sua-instancia.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_xxx
```

### 5. Iniciar o Projeto

```bash
# Da raiz do projeto
pnpm dev
```

Isso iniciara:
- **Frontend Next.js** em http://localhost:3002
- **Backend Convex** em modo watch

---

## Scripts Disponiveis

### Scripts Principais (raiz)

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm build` | Build de producao de todos os apps |
| `pnpm lint` | Executa linting em todos os packages |
| `pnpm format` | Formata codigo com Prettier |

### Scripts de Ambiente

| Comando | Descricao |
|---------|-----------|
| `pnpm env:dev` | Copia .env.dev para .env.local (DEV) |
| `pnpm env:prod` | Copia .env.prod para .env.local (PROD) |
| `pnpm dev:local` | Configura DEV e inicia o projeto |
| `pnpm dev:prod` | Configura PROD e inicia o projeto |

### Scripts de Backend

| Comando | Descricao |
|---------|-----------|
| `pnpm backend:dev` | Inicia backend com ambiente DEV |
| `pnpm backend:prod` | Inicia backend com ambiente PROD |

### Scripts do Frontend (apps/web)

| Comando | Descricao |
|---------|-----------|
| `pnpm -F web dev` | Inicia apenas o frontend |
| `pnpm -F web build` | Build do frontend |
| `pnpm -F web typecheck` | Verifica tipos TypeScript |

---

## Primeiro Acesso

### 1. Acessar a Aplicacao

Abra http://localhost:3002 no navegador.

### 2. Criar Conta

1. Clique em **Sign Up** ou acesse `/sign-up`
2. Crie uma conta com email/senha ou login social

### 3. Configurar Primeiro Usuario (SUPERADMIN)

O primeiro usuario deve se tornar SUPERADMIN:

1. Apos criar a conta, acesse `/bootstrap`
2. Clique no botao para se tornar Superadmin
3. Voce sera redirecionado para o dashboard

### 4. Usuarios Subsequentes

Os demais usuarios seguem este fluxo:

1. Criam conta em `/sign-up`
2. Sao redirecionados para `/select-sector`
3. Escolhem seu setor
4. Aguardam aprovacao de um admin
5. Apos aprovados, podem acessar o sistema

---

## Schema do Banco de Dados

### Tabela: users

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `name` | string | Nome do usuario |
| `clerkId` | string | ID do usuario no Clerk |
| `role` | string? | Role do usuario (SUPERADMIN, CEO, USER) |
| `sector` | string? | Setor do usuario |
| `status` | string? | Status (pending, approved, rejected) |
| `approvedBy` | Id<users>? | Referencia ao usuario que aprovou |
| `approvedAt` | number? | Timestamp da aprovacao |
| `rejectedBy` | Id<users>? | Referencia ao usuario que rejeitou |
| `rejectedAt` | number? | Timestamp da rejeicao |
| `rejectionReason` | string? | Motivo da rejeicao |

### Indices

- `by_clerk_id` - Busca por clerkId
- `by_role` - Busca por role
- `by_status` - Busca por status

---

## Sistema de Permissoes

### Roles Disponiveis

| Role | Permissoes |
|------|------------|
| **SUPERADMIN** | Acesso total ao sistema. Pode aprovar/rejeitar usuarios, gerenciar roles, acessar todas as funcionalidades |
| **CEO** | Gerencia sua organizacao. Pode aprovar usuarios do seu setor, visualizar relatorios |
| **USER** | Acesso basico. Pode usar funcionalidades padrao apos aprovacao |

### Fluxo de Aprovacao

```
Usuario cria conta
       │
       ▼
  Seleciona setor
       │
       ▼
Status: PENDING
       │
       ▼
Admin avalia ──────┬──────────────┐
       │           │              │
       ▼           ▼              ▼
   APPROVED    REJECTED     (aguardando)
       │           │
       ▼           ▼
 Acesso liberado  Motivo informado
```

---

## Componentes UI Disponiveis (51+)

O package `@workspace/ui` inclui todos os componentes shadcn/ui:

<details>
<summary>Ver lista completa de componentes</summary>

| Componente | Descricao |
|------------|-----------|
| Accordion | Paineis expansiveis |
| Alert | Mensagens de alerta |
| Alert Dialog | Dialogo de confirmacao |
| Aspect Ratio | Controle de proporcao |
| Avatar | Imagem de perfil |
| Badge | Etiquetas/tags |
| Breadcrumb | Navegacao hierarquica |
| Button | Botoes |
| Calendar | Seletor de data |
| Card | Container com sombra |
| Carousel | Slider de conteudo |
| Chart | Graficos (Recharts) |
| Checkbox | Caixa de selecao |
| Collapsible | Conteudo colapsavel |
| Command | Paleta de comandos |
| Context Menu | Menu de contexto |
| Dialog | Modal/dialog |
| Drawer | Painel lateral deslizante |
| Dropdown Menu | Menu suspenso |
| Dropzone | Upload drag-and-drop |
| Form | Formularios com validacao |
| Hint | Dicas/tooltips |
| Hover Card | Card ao passar mouse |
| Input | Campo de texto |
| Input OTP | Codigo de verificacao |
| Label | Rotulos de campo |
| Menubar | Barra de menu |
| Navigation Menu | Menu de navegacao |
| Pagination | Paginacao |
| Popover | Popup flutuante |
| Progress | Barra de progresso |
| Radio Group | Botoes de radio |
| Resizable | Paineis redimensionaveis |
| Scroll Area | Area de rolagem estilizada |
| Select | Seletor dropdown |
| Separator | Linha divisoria |
| Sheet | Painel lateral |
| Sidebar | Barra lateral de navegacao |
| Skeleton | Placeholder de carregamento |
| Slider | Controle deslizante |
| Sonner | Notificacoes toast |
| Switch | Toggle on/off |
| Table | Tabelas |
| Tabs | Abas |
| Textarea | Area de texto |
| Toggle | Botao toggle |
| Toggle Group | Grupo de toggles |
| Tooltip | Dicas ao passar mouse |

</details>

### Usando Componentes

```tsx
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Titulo</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite algo..." />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  );
}
```

### Adicionando Novos Componentes

```bash
cd apps/web
pnpm dlx shadcn@latest add <componente>
```

Os componentes serao adicionados em `packages/ui/src/components/`.

---
 
## Deploy

### Frontend (Vercel)

1. Conecte seu repositorio a Vercel
2. Configure as variaveis de ambiente:
   - Todas as variaveis de `apps/web/.env.local`
3. Deploy automatico a cada push

### Backend (Convex)

1. Gere uma chave de deploy no Convex Dashboard
2. Configure a variavel `CONVEX_DEPLOY_KEY` no CI/CD
3. Execute o deploy:

```bash
cd packages/backend
CONVEX_DEPLOY_KEY="prod:sua-chave" npx convex deploy --env-file .env.prod
```

### Variaveis de Producao

Certifique-se de atualizar:
- URLs do Clerk para producao (pk_live_xxx, sk_live_xxx)
- URL do Convex de producao 

---

## Troubleshooting

### Erro: "No auth provider found matching the given token"

**Causa:** O Convex nao consegue validar o token JWT do Clerk.

**Solucoes:**
1. Verifique se `CLERK_JWT_ISSUER_DOMAIN` esta configurado no **Convex Dashboard**
2. Verifique se o JWT Template "convex" existe no **Clerk Dashboard**
3. Confirme que a URL do Clerk e identica no frontend e backend
4. Aguarde alguns minutos - alteracoes podem demorar para propagar

### Erro: "Failed to connect to Convex"

**Causa:** URL do Convex incorreta ou deployment inexistente.

**Solucoes:**
1. Verifique se `NEXT_PUBLIC_CONVEX_URL` esta correto
2. Execute `npx convex dev --once` no backend para criar/atualizar o deployment
3. Confirme que o deployment existe no Convex Dashboard

### Tela em branco apos login

**Causa:** Usuario autenticado no Clerk mas sem registro no Convex.

**Solucoes:**
1. Se for o primeiro usuario, acesse `/bootstrap`
2. Se nao for o primeiro, acesse `/select-sector`
3. Verifique o console do navegador para erros

### Backend nao sincroniza / Funcoes nao encontradas

**Causa:** Funcoes do Convex nao foram deployadas.

**Solucao:**
```bash
cd packages/backend
npx convex dev --once
```

### Convex sobrescreve .env.local com deployment errado

**Causa:** O comando `convex dev` sobrescreve automaticamente o `.env.local`.

**Solucao:** Use a flag `--env-file`:
```bash
# Usar ambiente DEV
cd packages/backend
npx convex dev --env-file .env.dev

# Usar ambiente PROD
npx convex dev --env-file .env.prod
```

Ou use os scripts configurados:
```bash
pnpm backend:dev   # Ambiente DEV
pnpm backend:prod  # Ambiente PROD
```

### Porta 3002 ja em uso

**Solucao (Linux/Mac):**
```bash
lsof -i :3002
kill -9 <PID>
```

**Solucao (Windows):**
```bash
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Erro de tipos TypeScript

**Solucao:**
```bash
pnpm -F web typecheck
```

Corrija os erros indicados ou regenere os tipos do Convex:
```bash
cd packages/backend
npx convex dev --once
```

---

## Estrutura de Ambientes

O projeto suporta multiplos ambientes:

| Ambiente | Arquivo Frontend | Arquivo Backend | Uso |
|----------|-----------------|-----------------|-----|
| Local | `.env.local` | `.env.local` | Desenvolvimento |
| DEV | `.env.dev` | `.env.dev` | Ambiente de testes |
| PROD | `.env.prod` | `.env.prod` | Producao |

### Alternando Ambientes

```bash
# Copiar configs de DEV
pnpm env:dev

# Copiar configs de PROD
pnpm env:prod

# Iniciar com ambiente especifico
pnpm dev:local  # usa DEV
pnpm dev:prod   # usa PROD
```

---

## Contribuindo

### Padroes de Codigo

- Use TypeScript strict mode
- Siga as configuracoes ESLint do projeto
- Formate codigo com Prettier antes de commitar
- Escreva componentes funcionais com hooks

### Estrutura de Commits

```
tipo(escopo): descricao curta

[corpo opcional]

[footer opcional]
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Criando Pull Requests

1. Crie uma branch: `git checkout -b feat/minha-feature`
2. Faca suas alteracoes
3. Execute lint e testes: `pnpm lint`
4. Commit suas mudancas
5. Push para a branch: `git push origin feat/minha-feature`
6. Abra um Pull Request

---

## Arquivos de Referencia

| Arquivo | Proposito |
|---------|-----------|
| `packages/backend/convex/auth.config.ts` | Configuracao do Clerk no Convex |
| `packages/backend/convex/schema.ts` | Definicao das tabelas do banco |
| `apps/web/components/providers.tsx` | Providers Clerk + Convex |
| `packages/ui/src/lib/utils.ts` | Funcao `cn()` para classes |

---

## Licenca

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Links Uteis

- [Documentacao Next.js](https://nextjs.org/docs)
- [Documentacao Convex](https://docs.convex.dev)
- [Documentacao Clerk](https://clerk.com/docs)
- [Documentacao shadcn/ui](https://ui.shadcn.com)
- [Documentacao Tailwind CSS](https://tailwindcss.com/docs)
- [Documentacao Turborepo](https://turbo.build/repo/docs)
