# Setup do Projeto CrazyTemplate

Guia completo para configurar o projeto do zero.

## Prerequisitos

- Node.js >= 20
- pnpm >= 10
- Conta no [Clerk](https://clerk.com)
- Conta no [Convex](https://convex.dev)

## Estrutura de Ambientes

O projeto possui dois ambientes configurados:

| Ambiente | Convex Deployment | Clerk Instance | Uso |
|----------|-------------------|----------------|-----|
| **DEV** | `admired-wolf-413` | `magnetic-perch-51` | Desenvolvimento local |
| **PROD** | `neighborly-woodpecker-482` | `sought-feline-62` | Producao |

## Quick Start (Ambiente DEV)

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Clerk (se ainda nao configurado)

1. Acesse https://dashboard.clerk.com
2. Selecione a aplicacao `magnetic-perch-51` (ou crie uma nova)
3. Va em **Configure > JWT Templates**
4. Clique em **New template** > **Convex**
5. Mantenha o nome `convex` e salve

### 3. Configurar Convex Dashboard

1. Acesse https://dashboard.convex.dev
2. Selecione o projeto `admired-wolf-413`
3. Va em **Settings > Environment Variables**
4. Adicione as variaveis:

| Variavel | Valor |
|----------|-------|
| `CLERK_JWT_ISSUER_DOMAIN` | `https://magnetic-perch-51.clerk.accounts.dev` |
| `CLERK_SECRET_KEY` | Copie do Clerk Dashboard (API Keys) |

### 4. Configurar Arquivos de Ambiente

Copie os arquivos `.env.dev` para `.env.local`:

```bash
# Frontend
cp apps/web/.env.dev apps/web/.env.local

# Backend
cp packages/backend/.env.dev packages/backend/.env.local
```

### 5. Iniciar o Projeto

```bash
pnpm dev
```

Isso inicia:
- Frontend Next.js em http://localhost:3002
- Backend Convex em modo watch

### 6. Primeiro Acesso

1. Acesse http://localhost:3002/sign-up
2. Crie uma conta
3. Voce sera redirecionado para `/bootstrap`
4. Clique para se tornar o Superadmin

---

## Scripts de Ambiente

Para facilitar a alternancia entre ambientes:

```bash
# Usar ambiente DEV
pnpm dev:local

# Usar ambiente PROD
pnpm dev:prod
```

---

## Configuracao Detalhada

### Variaveis de Ambiente do Frontend

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | URL do deployment Convex | Sim |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | URL da instancia Clerk | Sim |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Chave publica do Clerk | Sim |
| `CLERK_SECRET_KEY` | Chave secreta do Clerk | Sim |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Rota de login | Sim |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Rota de cadastro | Sim | 

### Variaveis de Ambiente do Backend

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `CONVEX_DEPLOYMENT` | ID do deployment | Sim |
| `CONVEX_URL` | URL do deployment | Sim |
| `CLERK_JWT_ISSUER_DOMAIN` | Dominio do issuer JWT | Sim |
| `CLERK_SECRET_KEY` | Chave secreta do Clerk | Sim |

### Variaveis no Convex Dashboard

Estas variaveis devem ser configuradas no Dashboard do Convex (Settings > Environment Variables):

| Variavel | Descricao |
|----------|-----------|
| `CLERK_JWT_ISSUER_DOMAIN` | URL da instancia Clerk (ex: `https://magnetic-perch-51.clerk.accounts.dev`) |
| `CLERK_SECRET_KEY` | Chave secreta do Clerk |

---

## Troubleshooting

### Erro: "No auth provider found matching the given token"

**Causa:** O Convex nao consegue validar o token JWT do Clerk.

**Solucoes:**
1. Verifique se `CLERK_JWT_ISSUER_DOMAIN` esta configurado no Convex Dashboard
2. Verifique se o JWT Template "convex" existe no Clerk
3. Verifique se as URLs do Clerk sao consistentes entre frontend e backend

### Erro: "Failed to connect to Convex"

**Causa:** URL do Convex incorreta ou deployment nao existe.

**Solucoes:**
1. Verifique se `NEXT_PUBLIC_CONVEX_URL` aponta para o deployment correto
2. Execute `npx convex dev --once` no backend para criar/atualizar o deployment

### Tela em branco apos login

**Causa:** Usuario autenticado no Clerk mas sem registro no Convex.

**Solucoes:**
1. Se for o primeiro usuario, acesse `/bootstrap`
2. Se nao for o primeiro, acesse `/select-sector`

### Backend nao sincroniza

**Causa:** Funcoes do Convex nao foram deployadas.

**Solucao:**
```bash
cd packages/backend
npx convex dev --once
```

### Convex sobrescreve .env.local com deployment errado

**Causa:** O comando `convex dev` sobrescreve automaticamente o `.env.local` baseado no deployment configurado. Este e um [comportamento conhecido](https://github.com/get-convex/convex-backend/issues/191).

**Solucao:** Use a flag `--env-file` para especificar qual arquivo de ambiente usar:

```bash
# Usar ambiente DEV
cd packages/backend
npx convex dev --env-file .env.dev

# Usar ambiente PROD
cd packages/backend
npx convex dev --env-file .env.prod
```

Ou use os scripts ja configurados:
```bash
# Da raiz do projeto
pnpm backend:dev   # Inicia backend com ambiente DEV
pnpm backend:prod  # Inicia backend com ambiente PROD
```

**Importante:** O backend agora usa `--env-file .env.local` por padrao, entao voce precisa garantir que `.env.local` tenha o conteudo correto antes de rodar `pnpm dev`.

---

## Criando Novo Ambiente

Para criar um ambiente completamente novo:

### 1. Criar Aplicacao no Clerk

1. Acesse https://dashboard.clerk.com
2. Crie uma nova aplicacao
3. Anote a **Publishable Key** e **Secret Key**
4. Crie o JWT Template "convex"
5. Anote o **Issuer URL**

### 2. Criar Projeto no Convex

```bash
cd packages/backend
npx convex dev
```

Isso criara um novo projeto e atualizara `.env.local`.

### 3. Configurar Variaveis no Convex

No Dashboard do Convex:
- Adicione `CLERK_JWT_ISSUER_DOMAIN` com o Issuer URL do passo 1
- Adicione `CLERK_SECRET_KEY`

### 4. Configurar Frontend

Crie/atualize `apps/web/.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://seu-deployment.convex.cloud
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://sua-instancia.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/ 
```

---

## Checklist de Validacao

Antes de rodar o projeto, verifique:

- [ ] `NEXT_PUBLIC_CONVEX_URL` (frontend) aponta para o mesmo deployment que `CONVEX_URL` (backend)
- [ ] `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` (frontend) == `CLERK_JWT_ISSUER_DOMAIN` (backend)
- [ ] JWT Template "convex" existe no Clerk Dashboard
- [ ] `CLERK_JWT_ISSUER_DOMAIN` esta configurado no Convex Dashboard
- [ ] `CLERK_SECRET_KEY` esta configurado no Convex Dashboard

---

## Arquivos de Referencia

| Arquivo | Proposito |
|---------|-----------|
| `packages/backend/convex/auth.config.ts` | Configuracao do provider Clerk no Convex |
| `packages/backend/.env.local` | Variaveis do backend (local) |
| `packages/backend/.env.dev` | Variaveis do backend (DEV) |
| `packages/backend/.env.prod` | Variaveis do backend (PROD) |
| `apps/web/.env.local` | Variaveis do frontend (local) |
| `apps/web/.env.dev` | Variaveis do frontend (DEV) |
| `apps/web/.env.prod` | Variaveis do frontend (PROD) |
| `apps/web/components/providers.tsx` | Providers Clerk + Convex |

## DEPLOYAR EM PROD
SETAR NO ENV CHAVE DE DEPLOY PROD GERADA NO SITE DO CONVEX

CONVEX_DEPLOY_KEY="prod:your-key" 
 
RODAR npx convex deploy --env-file .env.prod
