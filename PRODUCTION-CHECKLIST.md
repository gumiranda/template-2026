# Checklist Completo de Lançamento - SaaS para Restaurantes

Tudo que precisa ser feito para lançar, vender e escalar o produto.

---

# PARTE 1: PRODUTO E TECNOLOGIA

## 1.1 Testes (Crítico)
- [ ] Configurar Vitest/Jest no monorepo
- [ ] Testes unitários para funções de auth (`lib/auth.ts`)
- [ ] Testes unitários para validações (`lib/validation.ts`)
- [ ] Testes de mutations críticas (orders, payments, sessions)
- [ ] Testes E2E para fluxos críticos:
  - [ ] Signup/login
  - [ ] Criar pedido (delivery)
  - [ ] Criar pedido (dine-in via QR)
  - [ ] Checkout com Stripe
  - [ ] Assinatura de plano

## 1.2 CI/CD (Crítico)
- [ ] GitHub Actions workflow:
  - [ ] Lint (`pnpm lint`)
  - [ ] Type check (`pnpm typecheck`)
  - [ ] Testes (`pnpm test`)
  - [ ] Build (`pnpm build`)
- [ ] Deploy automático para staging (branch `develop`)
- [ ] Deploy automático para produção (branch `main`)
- [ ] Pre-commit hooks (Husky + lint-staged)

## 1.3 Monitoramento e Logging (Crítico)
- [ ] Configurar Sentry (DSN já existe no `.env-example`)
- [ ] Error boundary reportar para Sentry
- [ ] Logging estruturado em webhooks (Clerk, Stripe)
- [ ] Alertas para erros críticos (pagamento falhou, webhook failed)
- [ ] Dashboard de métricas (Grafana, Datadog ou similar)

## 1.4 Validação de Inputs (Backend)
- [ ] Adicionar `v.string({ maxLength: N })` em campos de texto
- [ ] Validar `price > 0` em todas mutations de preço
- [ ] Validar `quantity > 0 && Number.isInteger(quantity)`
- [ ] Limitar arrays em batch operations (`items.length <= 100`)
- [ ] Sanitizar strings (trim whitespace)

## 1.5 Rate Limiting
- [ ] Rate limit em rotas de API públicas
- [ ] Rate limit em mutations sensíveis (createOrder, checkout)
- [ ] Proteção contra brute force em auth flows

## 1.6 Documentação Técnica
- [ ] Guia de deploy para Vercel
- [ ] Configuração de variáveis de ambiente em produção
- [ ] Runbook de operações comuns
- [ ] Procedimento de rollback
- [ ] Documentação de API (se tiver integrações)

## 1.7 Health Checks e Uptime
- [ ] Endpoint `/api/health` retornando status do app
- [ ] Check de conectividade com Convex
- [ ] Check de conectividade com Clerk
- [ ] Monitoramento de uptime (UptimeRobot, Pingdom, BetterStack)
- [ ] Status page pública (opcional)

## 1.8 Backups
- [ ] Estratégia de backup do Convex documentada
- [ ] Procedimento de restore testado
- [ ] Política de retenção definida (30, 60, 90 dias)

## 1.9 Segurança
- [ ] Audit de dependências (`pnpm audit`)
- [ ] Configurar Dependabot ou Renovate
- [ ] Revisar permissões de todas mutations (ownership check)
- [ ] Testar cenários de session hijacking
- [ ] Validar expiração de sessions em todos os fluxos
- [ ] Stripe webhooks verificam signature
- [ ] Clerk webhooks verificam signature
- [ ] CORS configurado corretamente
- [ ] CSP headers adequados

## 1.10 Performance
- [ ] Configurar CDN para assets estáticos
- [ ] Otimizar bundle size (analyze com `@next/bundle-analyzer`)
- [ ] Lazy loading de componentes pesados
- [ ] Prefetch de rotas críticas
- [ ] Core Web Vitals no verde (LCP < 2.5s, FID < 100ms, CLS < 0.1)

## 1.11 Analytics de Produto
- [ ] Integrar Plausible, Fathom, PostHog ou Mixpanel
- [ ] Tracking de eventos de conversão (signup, trial, paid)
- [ ] Funnel de onboarding
- [ ] Métricas de engagement (DAU, WAU, MAU)
- [ ] Feature usage tracking

---

# PARTE 2: LEGAL E COMPLIANCE

## 2.1 Documentos Legais
- [ ] Termos de Uso
- [ ] Política de Privacidade (LGPD compliant)
- [ ] Política de Cookies
- [ ] Contrato de prestação de serviço (SLA)
- [ ] Política de reembolso/cancelamento

## 2.2 LGPD/GDPR
- [ ] Banner de cookies com opt-in
- [ ] Formulário de solicitação de dados do usuário
- [ ] Processo de exclusão de dados (direito ao esquecimento)
- [ ] DPO definido (pode ser o próprio founder no início)
- [ ] Registro de processamento de dados

## 2.3 Financeiro
- [ ] CNPJ ativo
- [ ] Conta bancária PJ
- [ ] Emissão de nota fiscal configurada (NFSe)
- [ ] Contador/contabilidade definido
- [ ] Gateway de pagamento em modo live (Stripe)
- [ ] Split de pagamento configurado (se aplicável)

## 2.4 Propriedade Intelectual
- [ ] Registro de marca no INPI
- [ ] Domínio principal registrado
- [ ] Domínios similares protegidos (typos, extensões)

---

# PARTE 3: MARKETING E AQUISIÇÃO

## 3.1 Branding e Identidade
- [ ] Logo em alta resolução (PNG, SVG)
- [ ] Guia de identidade visual (cores, tipografia)
- [ ] Favicon e app icons
- [ ] Open Graph images para compartilhamento
- [ ] Fotos/mockups do produto
- [ ] Vídeo demo do produto (1-2 min)

## 3.2 Website e Landing Pages
- [ ] Landing page principal otimizada para conversão
- [ ] Página de preços clara
- [ ] Página "Sobre Nós" / história
- [ ] Página de features detalhada
- [ ] FAQ completo
- [ ] Casos de uso por segmento (pizzaria, hamburgueria, etc)
- [ ] Social proof (logos de clientes, depoimentos)
- [ ] CTA claro em todas as páginas
- [ ] Chat de suporte (Intercom, Crisp, Tawk.to)

## 3.3 SEO On-Page
- [ ] Title tags otimizadas (60 caracteres)
- [ ] Meta descriptions otimizadas (155 caracteres)
- [ ] URLs amigáveis
- [ ] Heading hierarchy correta (H1 > H2 > H3)
- [ ] Alt text em todas as imagens
- [ ] Schema.org / JSON-LD (Organization, Product, FAQ)
- [ ] Sitemap.xml dinâmico
- [ ] Robots.txt configurado
- [ ] Canonical URLs definidas

## 3.4 SEO Técnico
- [ ] Core Web Vitals otimizados
- [ ] Mobile-first indexing
- [ ] HTTPS em todo o site
- [ ] Sem erros de crawl (Google Search Console)
- [ ] Links internos estratégicos
- [ ] Breadcrumbs estruturados

## 3.5 Blog / Marketing de Conteúdo
- [ ] Blog implementado no site
- [ ] Pesquisa de palavras-chave feita
- [ ] Calendário editorial definido (mínimo 2 posts/semana no início)
- [ ] Categorias de conteúdo:
  - [ ] Guias práticos para donos de restaurante
  - [ ] Tendências do setor de food service
  - [ ] Cases de sucesso
  - [ ] Comparativos (vs iFood, vs Goomer, etc)
  - [ ] Dicas de gestão de restaurante
- [ ] Posts SEO para palavras-chave principais:
  - [ ] "cardápio digital para restaurante"
  - [ ] "sistema de pedidos para restaurante"
  - [ ] "QR code cardápio"
  - [ ] "como montar cardápio digital"
  - [ ] "sistema para pizzaria"
  - [ ] "sistema para hamburgueria"
  - [ ] "alternativa ao iFood"
- [ ] Link building strategy
- [ ] Guest posts em sites do setor

## 3.6 Google Meu Negócio
- [ ] Perfil criado e verificado
- [ ] Fotos do produto
- [ ] Posts regulares
- [ ] Responder reviews

---

# PARTE 4: REDES SOCIAIS

## 4.1 Setup de Canais
- [ ] Instagram Business
- [ ] LinkedIn Company Page
- [ ] YouTube (para tutoriais e demos)
- [ ] TikTok (opcional, para conteúdo viral)
- [ ] Facebook Page (para tráfego pago)

## 4.2 Instagram
- [ ] Bio otimizada com CTA
- [ ] Link na bio (Linktree ou similar)
- [ ] Highlights organizados (Features, Preços, Depoimentos, FAQ)
- [ ] Calendário de conteúdo:
  - [ ] 3-5 posts por semana
  - [ ] Stories diários
  - [ ] Reels 2-3x por semana
- [ ] Tipos de conteúdo:
  - [ ] Demos do produto
  - [ ] Before/after de restaurantes
  - [ ] Dicas para donos de restaurante
  - [ ] Bastidores da empresa
  - [ ] Depoimentos de clientes
  - [ ] Tendências do setor
  - [ ] Memes/conteúdo leve do nicho
- [ ] Hashtags research feito
- [ ] Responder DMs em até 2h

## 4.3 LinkedIn
- [ ] Posts 3x por semana
- [ ] Artigos sobre gestão de restaurantes
- [ ] Cases de sucesso
- [ ] Interação em grupos do setor
- [ ] Conectar com donos de restaurante

## 4.4 YouTube
- [ ] Canal configurado
- [ ] Vídeo de apresentação do produto
- [ ] Playlist de tutoriais
- [ ] Vídeos de cases
- [ ] SEO nos títulos e descrições

---

# PARTE 5: TRÁFEGO PAGO

## 5.1 Google Ads
- [ ] Conta criada e verificada
- [ ] Pixel/tag de conversão instalado
- [ ] Campanhas de Search:
  - [ ] Keywords de intenção alta ("sistema para restaurante", "cardápio digital")
  - [ ] Keywords de comparação ("alternativa iFood", "melhor que Goomer")
  - [ ] Keywords de problema ("como reduzir custos restaurante")
- [ ] Campanhas de Display (remarketing)
- [ ] Extensões de anúncio configuradas
- [ ] Landing pages específicas por campanha
- [ ] Negative keywords definidas
- [ ] Budget inicial definido (ex: R$ 50-100/dia)

## 5.2 Meta Ads (Facebook/Instagram)
- [ ] Business Manager configurado
- [ ] Pixel instalado
- [ ] Conversões API configurada (server-side)
- [ ] Públicos:
  - [ ] Lookalike de clientes
  - [ ] Interesses (donos de restaurante, gestão de negócios, food service)
  - [ ] Remarketing de visitantes
  - [ ] Remarketing de leads
- [ ] Criativos:
  - [ ] Imagens do produto
  - [ ] Vídeos de demo
  - [ ] Carrossel de features
  - [ ] Depoimentos em vídeo
- [ ] Campanhas:
  - [ ] Topo de funil (awareness, tráfego)
  - [ ] Meio de funil (consideração, vídeo views)
  - [ ] Fundo de funil (conversão, leads)
- [ ] A/B tests de criativos e copy
- [ ] Budget inicial definido (ex: R$ 50-100/dia)

## 5.3 Tracking e Attribution
- [ ] UTMs em todos os links
- [ ] Google Analytics 4 configurado
- [ ] Conversões configuradas:
  - [ ] Lead (cadastro)
  - [ ] Trial iniciado
  - [ ] Pagamento realizado
- [ ] Dashboard de ROI por canal
- [ ] Custo por aquisição (CAC) calculado

---

# PARTE 6: PROSPECÇÃO ATIVA (OUTBOUND)

## 6.1 Definição de ICP (Ideal Customer Profile)
- [ ] Segmento: pizzarias, hamburguerias, restaurantes à la carte, etc
- [ ] Tamanho: quantas mesas? faturamento?
- [ ] Localização: quais cidades/regiões?
- [ ] Dor principal: custo do iFood? gestão manual? falta de controle?
- [ ] Decisor: dono, gerente, sócio?

## 6.2 Geração de Leads
- [ ] Scraping do Google Maps (restaurantes por região)
  - [ ] Nome do estabelecimento
  - [ ] Telefone
  - [ ] Endereço
  - [ ] Website (se tiver)
  - [ ] Instagram
- [ ] Ferramentas: PhantomBuster, Apify, ou script próprio
- [ ] Enriquecimento de dados (email do decisor)
- [ ] CRM configurado (HubSpot, Pipedrive, ou planilha)
- [ ] Lista inicial de 500-1000 leads

## 6.3 Abordagem por WhatsApp
- [ ] Número comercial (WhatsApp Business)
- [ ] Script de primeiro contato (curto, direto)
- [ ] Follow-up sequence (3-5 mensagens)
- [ ] Horários de envio definidos (não enviar fora de horário comercial)
- [ ] Templates aprovados
- [ ] Processo de qualificação (BANT: Budget, Authority, Need, Timeline)

**Script exemplo:**
```
Oi [Nome], tudo bem?
Vi que o [Restaurante] está no iFood. Você sabia que dá pra economizar até 27% do valor dos pedidos usando um cardápio digital próprio?

Criamos um sistema que coloca QR Code nas mesas e você recebe os pedidos direto no seu celular, sem pagar comissão.

Posso te mostrar como funciona? Leva 5 minutos.
```

## 6.4 Abordagem por Instagram DM
- [ ] Seguir perfis de restaurantes locais
- [ ] Interagir com stories/posts antes de abordar
- [ ] Script de DM (menos comercial, mais conversa)
- [ ] Processo de nurturing (curtir, comentar, depois abordar)

## 6.5 Cold Email
- [ ] Domínio separado para cold email (evitar blacklist do principal)
- [ ] Aquecimento do domínio (2-4 semanas)
- [ ] Ferramenta de envio (Instantly, Lemlist, Apollo)
- [ ] Sequência de emails (3-5 emails)
- [ ] Personalização por segmento
- [ ] Subject lines testadas

## 6.6 Ligação (Cold Call)
- [ ] Script de ligação
- [ ] Objeções mapeadas e respostas prontas
- [ ] Pitch de 30 segundos (elevator pitch)
- [ ] Horários ideais para ligar (10-12h, 14-17h)
- [ ] CRM atualizado após cada ligação

---

# PARTE 7: FUNIL DE VENDAS

## 7.1 Etapas do Funil
```
[Visitante] → [Lead] → [MQL] → [SQL] → [Oportunidade] → [Cliente]
```

- [ ] Definir critérios de cada etapa
- [ ] Automações de passagem de etapa
- [ ] SLAs entre marketing e vendas

## 7.2 Captura de Leads
- [ ] Formulário de trial/demo no site
- [ ] Pop-up de saída (exit intent)
- [ ] Lead magnet (ebook, checklist, template)
  - [ ] "Checklist: Como montar um cardápio que vende"
  - [ ] "Planilha de controle de pedidos"
  - [ ] "Guia: Como sair do iFood sem perder clientes"
- [ ] Chatbot para qualificação inicial
- [ ] WhatsApp como canal de captura

## 7.3 Lead Scoring
- [ ] Pontuação por perfil (tamanho do restaurante, região)
- [ ] Pontuação por comportamento (páginas visitadas, emails abertos)
- [ ] Threshold para MQL (Marketing Qualified Lead)
- [ ] Threshold para SQL (Sales Qualified Lead)

## 7.4 Nutrição de Leads (Lead Nurturing)
- [ ] Sequência de emails pós-cadastro
- [ ] Conteúdo educativo por estágio do funil
- [ ] Retargeting para leads que não converteram
- [ ] WhatsApp para leads quentes

---

# PARTE 8: EMAIL MARKETING

## 8.1 Setup
- [ ] Ferramenta de email (Resend, SendGrid, Mailchimp, ConvertKit)
- [ ] Domínio autenticado (SPF, DKIM, DMARC)
- [ ] Templates de email responsivos
- [ ] Unsubscribe funcionando
- [ ] Double opt-in configurado

## 8.2 Emails Transacionais
- [ ] Confirmação de cadastro
- [ ] Reset de senha
- [ ] Confirmação de pagamento
- [ ] Fatura/recibo
- [ ] Fim do trial (aviso)
- [ ] Pagamento falhou

## 8.3 Sequência de Onboarding (Trial)
- [ ] Dia 0: Boas-vindas + primeiro passo
- [ ] Dia 1: Como configurar o cardápio
- [ ] Dia 3: Como gerar QR codes
- [ ] Dia 5: Dicas de uso
- [ ] Dia 7: Case de sucesso
- [ ] Dia 10: Lembrete de fim do trial
- [ ] Dia 13: Última chance + desconto

## 8.4 Newsletter
- [ ] Frequência definida (semanal ou quinzenal)
- [ ] Conteúdo de valor (não só promoção)
- [ ] Segmentação por interesse/estágio

## 8.5 Emails de Retenção
- [ ] Usuário inativo há 7 dias
- [ ] Usuário inativo há 30 dias
- [ ] Lançamento de nova feature
- [ ] Pesquisa de satisfação (NPS)

## 8.6 Emails de Vendas (Outbound)
- [ ] Sequência de cold email (prospecção)
- [ ] Follow-up pós-demo
- [ ] Proposta comercial
- [ ] Follow-up pós-proposta

---

# PARTE 9: VENDAS E FECHAMENTO

## 9.1 Processo de Vendas
- [ ] Discovery call script (entender dor do cliente)
- [ ] Demo personalizada por segmento
- [ ] Proposta comercial template
- [ ] Contrato de assinatura
- [ ] Processo de assinatura digital (DocuSign, ClickSign)

## 9.2 Objeções Comuns e Respostas
- [ ] "Tá caro" → mostrar ROI, economia vs iFood
- [ ] "Já uso o iFood" → complemento, não substituição
- [ ] "Meus clientes não vão usar" → dados de adoção de QR code
- [ ] "Não tenho tempo de configurar" → onboarding feito pela equipe
- [ ] "Preciso pensar" → criar urgência, desconto por tempo limitado

## 9.3 Pricing Strategy
- [ ] Planos definidos (Starter, Pro, Enterprise)
- [ ] Preço âncora (mostrar plano mais caro primeiro)
- [ ] Desconto anual (ex: 2 meses grátis)
- [ ] Trial gratuito (7 ou 14 dias)
- [ ] Desconto de lançamento (primeiros 100 clientes)

## 9.4 Ferramentas de Vendas
- [ ] CRM configurado (HubSpot, Pipedrive)
- [ ] Proposta comercial (PandaDoc, Proposify ou Google Docs)
- [ ] Agendamento de calls (Calendly, Cal.com)
- [ ] Gravação de calls (Zoom, Google Meet)
- [ ] Assinatura digital (ClickSign, DocuSign)

## 9.5 Métricas de Vendas
- [ ] Taxa de conversão por etapa
- [ ] Ciclo de vendas médio
- [ ] Ticket médio
- [ ] Win rate
- [ ] Motivos de perda

---

# PARTE 10: ONBOARDING DE CLIENTES

## 10.1 Onboarding Self-Service
- [ ] Wizard de primeiro acesso
- [ ] Checklist de setup no dashboard
- [ ] Tooltips explicativos
- [ ] Vídeos tutoriais curtos
- [ ] Centro de ajuda (Help Center)

## 10.2 Onboarding High-Touch (para planos maiores)
- [ ] Call de kickoff
- [ ] Configuração assistida do cardápio
- [ ] Treinamento da equipe
- [ ] Check-in após 7 dias
- [ ] Check-in após 30 dias

## 10.3 Materiais de Onboarding
- [ ] Guia de início rápido (PDF)
- [ ] Vídeo de boas-vindas
- [ ] FAQ em vídeo
- [ ] Templates de cardápio por segmento
- [ ] Artes prontas para divulgação (QR code, stories)

---

# PARTE 11: SUPORTE AO CLIENTE

## 11.1 Canais de Suporte
- [ ] Chat no app (Intercom, Crisp, Tawk.to)
- [ ] WhatsApp Business
- [ ] Email de suporte
- [ ] Central de ajuda (FAQ, artigos)

## 11.2 Processos
- [ ] SLA de resposta definido (ex: 2h em horário comercial)
- [ ] Categorização de tickets
- [ ] Escalation path
- [ ] Templates de resposta
- [ ] Base de conhecimento interna

## 11.3 Métricas de Suporte
- [ ] Tempo de primeira resposta
- [ ] Tempo de resolução
- [ ] CSAT (Customer Satisfaction)
- [ ] Volume de tickets por categoria

---

# PARTE 12: RETENÇÃO E GROWTH

## 12.1 Métricas de Retenção
- [ ] Churn rate mensal
- [ ] Net Revenue Retention (NRR)
- [ ] Customer Lifetime Value (LTV)
- [ ] LTV:CAC ratio (ideal > 3:1)

## 12.2 Redução de Churn
- [ ] Health score do cliente
- [ ] Alertas de risco de churn (uso baixo, pagamento atrasado)
- [ ] Playbook de recuperação
- [ ] Pesquisa de cancelamento (entender motivos)
- [ ] Win-back campaign para ex-clientes

## 12.3 Expansão
- [ ] Upsell para planos maiores
- [ ] Cross-sell de features adicionais
- [ ] Programa de indicação (referral)
- [ ] Case studies para social proof

## 12.4 Programa de Indicação
- [ ] Recompensa para quem indica (desconto, mês grátis)
- [ ] Recompensa para indicado (desconto no primeiro mês)
- [ ] Link de indicação único
- [ ] Dashboard de indicações
- [ ] Comunicação automática

## 12.5 NPS e Feedback
- [ ] Pesquisa NPS trimestral
- [ ] Entrevistas com clientes (5 por mês)
- [ ] Feature requests organizados
- [ ] Changelog público
- [ ] Roadmap público (opcional)

---

# PARTE 13: OPERAÇÕES E EQUIPE

## 13.1 Equipe Mínima para Lançamento
- [ ] Fundador(es) - produto, vendas, estratégia
- [ ] Desenvolvedor (pode ser o fundador)
- [ ] Vendas/SDR (pode ser o fundador inicialmente)
- [ ] Suporte (pode ser o fundador inicialmente)

## 13.2 Contratações Pós-Validação
- [ ] SDR (Sales Development Rep) para prospecção
- [ ] Customer Success para onboarding/retenção
- [ ] Designer para conteúdo/marketing
- [ ] Dev adicional para acelerar produto

## 13.3 Ferramentas Operacionais
- [ ] Comunicação: Slack ou Discord
- [ ] Tarefas: Linear, Notion, ou Trello
- [ ] Documentação: Notion
- [ ] Financeiro: Conta Azul, Omie
- [ ] Contratos: ClickSign
- [ ] CRM: HubSpot ou Pipedrive

---

# PARTE 14: CRONOGRAMA SUGERIDO

## Semana -4 a -2 (Pré-Lançamento)
- [ ] Finalizar testes e CI/CD
- [ ] Configurar monitoramento (Sentry)
- [ ] Preparar landing page final
- [ ] Criar conteúdo inicial (blog posts, vídeos)
- [ ] Configurar ads accounts
- [ ] Gerar lista inicial de leads

## Semana -1 (Pré-Lançamento)
- [ ] Soft launch para beta users
- [ ] Coletar feedback e ajustar
- [ ] Preparar sequências de email
- [ ] Agendar posts de lançamento
- [ ] Testar fluxo de pagamento em produção

## Semana 0 (Lançamento)
- [ ] Go live!
- [ ] Postar em redes sociais
- [ ] Enviar para lista de espera
- [ ] Ativar campanhas de ads
- [ ] Começar prospecção ativa
- [ ] Monitorar tudo de perto

## Semanas 1-4 (Pós-Lançamento)
- [ ] Ajustar com base em feedback
- [ ] Otimizar campanhas de ads
- [ ] Escalar prospecção
- [ ] Primeiros cases de sucesso
- [ ] Ajustar pricing se necessário

## Mês 2-3
- [ ] Contratar primeiro SDR
- [ ] Escalar tráfego pago
- [ ] Começar marketing de conteúdo consistente
- [ ] Programa de indicação
- [ ] Otimizar onboarding

---

# STATUS GERAL

| Área | Status |
|------|--------|
| **Produto** | |
| Arquitetura | ✅ Sólida |
| Security | ✅ Headers implementados |
| Auth | ✅ Clerk configurado |
| Testes | ❌ Zero cobertura |
| CI/CD | ❌ Não configurado |
| Monitoramento | ❌ Sentry não configurado |
| **Legal** | |
| CNPJ | ❓ Verificar |
| Termos/Privacidade | ❓ Verificar |
| **Marketing** | |
| SEO On-Page | ✅ Implementado |
| Blog | ❓ Verificar |
| Redes Sociais | ❓ Configurar |
| Ads | ❌ Não configurado |
| **Vendas** | |
| CRM | ❌ Não configurado |
| Prospecção | ❌ Não iniciada |
| Scripts | ❌ Não criados |
| **Operações** | |
| Suporte | ❓ Verificar |
| Onboarding | ❓ Verificar |

---

# MÉTRICAS PARA ACOMPANHAR

## Aquisição
- Visitantes únicos/mês
- Taxa de conversão visitante → lead
- Custo por lead (CPL)
- Custo por aquisição (CAC)
- Leads por canal

## Ativação
- Taxa de conversão lead → trial
- Taxa de conversão trial → paid
- Tempo médio de ativação
- Passos do onboarding completados

## Receita
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Ticket médio

## Retenção
- Churn rate mensal
- Net Revenue Retention
- Customer Lifetime Value (LTV)
- LTV:CAC ratio

## Referral
- NPS score
- Taxa de indicação
- Clientes vindos de indicação

---

# RECURSOS ÚTEIS

## Ferramentas Gratuitas/Baratas para Começar
- **CRM:** HubSpot Free, Pipedrive (trial)
- **Email:** Resend, SendGrid (free tier)
- **Analytics:** Plausible, Google Analytics
- **Chat:** Tawk.to (free), Crisp (free tier)
- **Automação:** n8n (self-hosted), Make (free tier)
- **Agendamento:** Cal.com (free)
- **Design:** Canva, Figma
- **Scraping:** PhantomBuster, Apify

## Comunidades para Aprender
- Grupo SaaS Brasil (Facebook/WhatsApp)
- IndieHackers
- MicroConf
- SaaStr

## Benchmarks do Setor SaaS
- CAC:LTV ideal: 1:3 ou maior
- Churn mensal aceitável: < 5%
- Net Revenue Retention ideal: > 100%
- Payback period ideal: < 12 meses
