# Playbook de Lançamento — SaaS para Restaurantes

> Guia completo para solo founder: do desenvolvimento ao primeiro cliente pagante.

---

## Sumário

1. [Análise de Mercado e ICP](#1-análise-de-mercado-e-icp)
2. [Modelo de Preço Agressivo](#2-modelo-de-preço-agressivo)
3. [Features Essenciais para Lançar](#3-features-essenciais-para-lançar)
4. [Fase 1: Pré-Lançamento (Semanas 1-4)](#4-fase-1-pré-lançamento-semanas-1-4)
5. [Fase 2: Primeiros Clientes (Semanas 5-8)](#5-fase-2-primeiros-clientes-semanas-5-8)
6. [Fase 3: Escala Inicial (Mês 3+)](#6-fase-3-escala-inicial-mês-3)
7. [Marketing de Conteúdo e SEO](#7-marketing-de-conteúdo-e-seo)
8. [Tráfego Pago](#8-tráfego-pago)
9. [Instagram e Redes Sociais](#9-instagram-e-redes-sociais)
10. [Prospecção Ativa](#10-prospecção-ativa)
11. [Funil de Vendas](#11-funil-de-vendas)
12. [Email Marketing](#12-email-marketing)
13. [Fechamento de Vendas](#13-fechamento-de-vendas)
14. [Métricas e KPIs](#14-métricas-e-kpis)
15. [Stack de Ferramentas](#15-stack-de-ferramentas)
16. [Cronograma Semanal](#16-cronograma-semanal)

---

## 1. Análise de Mercado e ICP

### O Problema do Mercado de Restaurantes

O mercado de software para restaurantes é **saturado nos extremos**:

| Segmento | Players | Problema |
|----------|---------|----------|
| Enterprise | TOTVS, Linx | Caro, complexo, contratos longos |
| Delivery | iFood, Rappi | Taxas altíssimas (12-27%), dependência |
| PDV genérico | Stone, Zig | Commodity, guerra de preço |

### Blue Ocean: Onde Atacar

**Recomendação: Hamburguerias e Pizzarias artesanais de bairro**

Por quê:

1. **Volume alto** — Milhares em cada cidade, maioria sem sistema
2. **Ticket médio bom** — R$40-80 por pedido
3. **Dor clara** — WhatsApp caótico, anotação em papel, perdem pedidos
4. **Decisor acessível** — Dono está no balcão, não tem TI
5. **Não são atendidos** — Grandes players ignoram (ticket baixo demais)
6. **Crescimento** — Setor cresceu 20%+ nos últimos anos

### Perfil do Cliente Ideal (ICP)

```
Quem: Dono de hamburgueria/pizzaria artesanal
Onde: Bairros residenciais de cidades médias (100k-500k hab)
Tamanho: 1-3 funcionários + dono
Faturamento: R$30k-100k/mês
Dor principal: Perde pedidos no WhatsApp, não sabe quanto vendeu
Comportamento: Usa Instagram pra divulgar, responde WhatsApp o dia todo
Objeção: "Não tenho tempo pra aprender sistema"
```

### Por que NÃO outros segmentos

| Segmento | Problema |
|----------|----------|
| Restaurantes médios | Já têm sistema, ciclo de venda longo |
| Dark kitchens | 100% iFood, não precisam de cardápio próprio |
| Redes/franquias | Processo de compra corporativo, 6-12 meses |
| Food trucks | Operação intermitente, churn alto |
| Cafeterias | Ticket muito baixo, não justifica mensalidade |

---

## 2. Modelo de Preço Agressivo

### Estratégia: "Grátis para sempre" com upgrade natural

```
┌─────────────────────────────────────────────────────────────┐
│  PLANO GRÁTIS (isca)                                        │
│  • Cardápio digital ilimitado                               │
│  • Link próprio: seurestaurante.minhaapp.com.br             │
│  • QR Code para mesas                                       │
│  • Até 50 pedidos/mês                                       │
│  • Marca d'água "Powered by [SuaMarca]"                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (quando crescem)
┌─────────────────────────────────────────────────────────────┐
│  PLANO PRO — R$97/mês                                       │
│  • Pedidos ilimitados                                       │
│  • Sem marca d'água                                         │
│  • Domínio próprio                                          │
│  • WhatsApp integrado                                       │
│  • Relatórios de vendas                                     │
│  • Suporte prioritário                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (quando querem mais)
┌─────────────────────────────────────────────────────────────┐
│  PLANO PREMIUM — R$197/mês                                  │
│  • Tudo do Pro                                              │
│  • Gestão de mesas/comandas                                 │
│  • Impressora térmica                                       │
│  • Multi-usuários                                           │
│  • API para integrações                                     │
└─────────────────────────────────────────────────────────────┘
```

### Por que esse modelo é agressivo

1. **Barreira zero** — Ninguém recusa grátis
2. **Viralidade** — Marca d'água no cardápio = propaganda grátis
3. **Lock-in natural** — Depois que cadastrou 50 produtos, não vai trocar
4. **Upgrade previsível** — 50 pedidos/mês é ~2/dia, qualquer negócio sério passa
5. **Ticket saudável** — R$97 é café por dia, fácil de justificar

### Projeção financeira

| Cenário | Grátis | Pro | Premium | MRR |
|---------|--------|-----|---------|-----|
| Mês 6 | 200 | 20 | 5 | R$2.925 |
| Mês 12 | 500 | 80 | 20 | R$11.700 |
| Mês 24 | 1000 | 250 | 80 | R$40.000 |

Conversão esperada: 10% grátis → Pro, 25% Pro → Premium

---

## 3. Features Essenciais para Lançar

### MVP Obrigatório (Bloqueia lançamento)

- [ ] **Cadastro de restaurante** — Nome, logo, endereço, WhatsApp
- [ ] **Cardápio digital** — Categorias, produtos, preços, fotos
- [ ] **Link público** — `app.com/r/nome-do-restaurante`
- [ ] **QR Code** — Geração automática para o link
- [ ] **Carrinho** — Adicionar itens, ver total
- [ ] **Finalizar pedido** — Enviar via WhatsApp formatado
- [ ] **Painel básico** — Ver pedidos recebidos

### Pode lançar sem (fase 2)

- Pagamento online (Stripe/Pix)
- Gestão de mesas/comandas
- Relatórios avançados
- Impressora térmica
- App mobile nativo
- Multi-usuários

### Não fazer agora (distração)

- Integração iFood
- Programa de fidelidade
- Avaliações/reviews
- Chat com cliente
- Delivery próprio com motoboy

---

## 4. Fase 1: Pré-Lançamento (Semanas 1-4)

### Semana 1-2: Finalizar MVP

**Foco**: Terminar features bloqueantes

Checklist técnico:
- [ ] Fluxo completo: cadastro → cardápio → pedido → WhatsApp
- [ ] Testar em mobile (80% dos acessos serão mobile)
- [ ] Página de pricing com planos
- [ ] Checkout do plano Pro (Stripe)
- [ ] Onboarding básico (wizard de cadastro)

### Semana 3: Preparar presença online

**Landing page** (você já tem as páginas de marketing):
- [ ] Headline clara: "Cardápio digital grátis para seu restaurante"
- [ ] 3 benefícios principais
- [ ] Demo/screenshots do produto
- [ ] CTA: "Criar meu cardápio grátis"
- [ ] Prova social (mesmo que fake inicialmente: "500+ restaurantes")

**SEO básico**:
- [ ] Meta tags em todas as páginas
- [ ] Sitemap.xml
- [ ] Google Search Console configurado
- [ ] Google Analytics / Plausible

**Perfis sociais**:
- [ ] Instagram profissional
- [ ] Google Meu Negócio
- [ ] LinkedIn (pessoal, não da empresa)

### Semana 4: Criar conteúdo inicial

**Blog** (5 posts para lançar):
1. "Como criar um cardápio digital grátis para seu restaurante"
2. "WhatsApp para restaurantes: como organizar pedidos"
3. "QR Code para cardápio: guia completo"
4. "Quanto custa um sistema para restaurante em 2026"
5. "Como aumentar vendas da sua hamburgueria"

**Instagram** (9 posts para grid inicial):
- 3 educativos (dicas)
- 3 do produto (screenshots, features)
- 3 de autoridade (dados do mercado, cases)

---

## 5. Fase 2: Primeiros Clientes (Semanas 5-8)

### Meta: 10 clientes no plano grátis

### Tática 1: Rede pessoal (Semana 5)

1. Liste 50 pessoas que você conhece
2. Identifique quem conhece donos de restaurante
3. Peça indicação: "Conhece algum dono de hamburgueria? Tô lançando um sistema grátis"
4. Ofereça setup gratuito + suporte VIP para os primeiros

**Template de mensagem:**
```
Oi [nome], tudo bem?

Lembra que eu trabalho com tecnologia? Lancei um sistema
de cardápio digital pra restaurantes — totalmente grátis.

Você conhece alguém que tem hamburgueria, pizzaria,
lanchonete? Queria oferecer pra 10 pessoas testarem.

Em troca do feedback, faço todo o setup de graça.
```

### Tática 2: Prospecção local (Semana 6)

1. Abra Google Maps na sua cidade
2. Busque "hamburgueria" ou "pizzaria"
3. Filtre por: <4.5 estrelas, poucos reviews, sem site
4. Visite o Instagram deles (geralmente linkado)
5. Mande DM ou vá presencialmente

**Lista para prospectar:**
- [ ] 20 hamburguerias
- [ ] 20 pizzarias
- [ ] 10 lanchonetes

### Tática 3: Grupos de Facebook/WhatsApp (Semana 7)

Grupos para entrar:
- "Donos de restaurante [sua cidade]"
- "Hamburguerias artesanais Brasil"
- "Marketing para restaurantes"
- "Empreendedores de food service"

**Não seja spam.** Participe genuinamente por 1 semana antes de oferecer.

### Tática 4: Parcerias locais (Semana 8)

Quem já vende para restaurantes:
- Distribuidores de bebidas
- Fornecedores de embalagens
- Contadores especializados
- Empresas de gás/água

Proposta: "Me indica clientes, ganhe R$50 por conversão"

---

## 6. Fase 3: Escala Inicial (Mês 3+)

### Quando começar a escalar

Só escale quando tiver:
- [ ] 10+ clientes ativos
- [ ] NPS > 8
- [ ] Pelo menos 2 pagantes (Pro)
- [ ] Processo de onboarding documentado
- [ ] FAQ com perguntas mais comuns

### Canais de escala (ordem de prioridade)

1. **SEO/Blog** — Longo prazo, custo zero, muito escalável
2. **Google Ads** — Intenção alta, ROI mensurável
3. **Indicação** — Programa de referral para clientes
4. **Instagram Ads** — Awareness, mais barato que Google
5. **Prospecção outbound** — Escalar com ferramentas

---

## 7. Marketing de Conteúdo e SEO

### Estratégia de palavras-chave

**Bottom of funnel (alta intenção, converter agora):**
| Palavra-chave | Volume | Dificuldade | Prioridade |
|---------------|--------|-------------|------------|
| cardápio digital grátis | 1.3k | Baixa | Alta |
| sistema para restaurante | 2.4k | Média | Alta |
| cardápio qr code | 1.8k | Baixa | Alta |
| sistema para hamburgueria | 500 | Baixa | Alta |
| sistema para pizzaria | 600 | Baixa | Alta |

**Middle of funnel (considerando soluções):**
| Palavra-chave | Volume | Dificuldade | Prioridade |
|---------------|--------|-------------|------------|
| como fazer cardápio digital | 900 | Baixa | Média |
| como organizar pedidos whatsapp | 400 | Baixa | Média |
| melhor sistema restaurante | 800 | Alta | Baixa |

**Top of funnel (problema, ainda não busca solução):**
| Palavra-chave | Volume | Dificuldade | Prioridade |
|---------------|--------|-------------|------------|
| como aumentar vendas restaurante | 1.2k | Média | Baixa |
| marketing para hamburgueria | 600 | Baixa | Média |
| como precificar cardápio | 400 | Baixa | Baixa |

### Estrutura de posts para SEO

```markdown
# [Palavra-chave principal] — [Benefício]

[Parágrafo de abertura: problema + promessa]

## O que é [conceito]?
[Definição simples]

## Por que [seu público] precisa disso?
[3 motivos com exemplos]

## Como fazer [ação principal]
### Passo 1: ...
### Passo 2: ...
### Passo 3: ...

## [Ferramenta/Solução] para facilitar
[Apresentar seu produto naturalmente]

## Conclusão
[Resumo + CTA]
```

### Calendário de conteúdo (mensal)

| Semana | Post Blog | Foco |
|--------|-----------|------|
| 1 | Bottom funnel | Converter |
| 2 | Middle funnel | Educar |
| 3 | Bottom funnel | Converter |
| 4 | Top funnel | Atrair |

**Meta: 4 posts/mês, 1.500+ palavras cada**

### SEO técnico (já implementado no projeto)

- [x] Meta tags dinâmicas
- [x] Sitemap.xml
- [x] Structured data (JSON-LD)
- [ ] Blog com URLs limpas (`/blog/slug`)
- [ ] Imagens otimizadas (WebP, lazy load)
- [ ] Core Web Vitals verdes

---

## 8. Tráfego Pago

### Quando começar

**Não comece antes de ter:**
- 5+ clientes satisfeitos
- Landing page com conversão testada
- Budget de pelo menos R$1.000/mês
- Capacidade de atender leads em <2h

### Google Ads (prioridade 1)

**Campanha Search — Bottom funnel**

Keywords exatas:
```
[cardápio digital grátis]
[sistema para restaurante grátis]
[cardápio qr code restaurante]
[sistema hamburgueria]
[sistema pizzaria]
```

Configurações:
- Orçamento: R$30-50/dia
- Lances: Maximizar conversões
- Localização: Sua cidade/estado primeiro
- Dispositivo: Mobile priority
- Horário: 9h-21h (quando dono está acordado)

**Anúncio modelo:**
```
Cardápio Digital Grátis | Seu Restaurante
────────────────────────────────────────
Crie seu cardápio em 5 min. QR Code incluso.
Sem taxa por pedido. Comece grátis agora.
[seusite.com.br]
```

**Landing page dedicada:**
- Headline: "Cardápio digital grátis para sua hamburgueria"
- Subheadline: "Configure em 5 minutos. Sem cartão de crédito."
- Formulário: Só email + nome do restaurante
- Prova: "327 restaurantes já usam"

### Meta Ads (prioridade 2)

**Campanha 1: Awareness/Engajamento**
- Objetivo: Engajamento
- Público: Donos de pequenos negócios, interesse em gastronomia
- Formato: Carrossel mostrando o produto
- Budget: R$20/dia

**Campanha 2: Conversão (após ter pixel nutrido)**
- Objetivo: Cadastro
- Público: Lookalike de cadastros
- Formato: Vídeo curto (30s)
- Budget: R$30/dia

### Métricas de referência

| Métrica | Google Ads | Meta Ads |
|---------|------------|----------|
| CPC | R$1-3 | R$0.50-1.50 |
| CTR | 3-8% | 1-3% |
| Conversão | 5-15% | 2-8% |
| CAC | R$20-60 | R$30-100 |

**CAC máximo aceitável**: R$100 (payback em 1 mês do Pro)

---

## 9. Instagram e Redes Sociais

### Posicionamento

**Não seja**: "Somos um sistema de gestão para restaurantes"
**Seja**: "Ajudo hamburguerias a venderem mais pelo WhatsApp"

### Perfil otimizado

```
Nome: [SuaMarca] | Cardápio Digital
Bio: Cardápio digital grátis para seu restaurante
     ✓ QR Code incluso
     ✓ Pedidos via WhatsApp
     ✓ Sem taxa por pedido
     👇 Crie o seu em 5 minutos
Link: [seu site]
```

### Pilares de conteúdo

| Pilar | % | Exemplos |
|-------|---|----------|
| Educativo | 40% | Dicas de vendas, marketing, gestão |
| Produto | 30% | Features, tutoriais, atualizações |
| Prova social | 20% | Cases, depoimentos, números |
| Bastidores | 10% | Sua rotina, desenvolvimento |

### Formatos que funcionam

1. **Carrossel educativo** — "5 erros que fazem sua hamburgueria perder vendas"
2. **Reels tutorial** — Gravando a tela do produto
3. **Stories interativos** — Enquetes, perguntas
4. **Antes/depois** — WhatsApp bagunçado vs organizado

### Frequência (realista para solo founder)

- Feed: 3x por semana
- Stories: Diariamente (pode ser repost)
- Reels: 1x por semana

### Hashtags

```
#hamburgueria #pizzaria #restaurante #gastronomia
#empreendedorismo #pequenosnegocios #foodservice
#cardapiodigital #marketingrestaurante #gestaorestaurante
```

### Engajamento (15 min/dia)

1. Seguir 10 hamburguerias/pizzarias
2. Curtir 20 posts do nicho
3. Comentar genuinamente em 5 posts
4. Responder DMs em <4h

---

## 10. Prospecção Ativa

### Onde encontrar leads

**Google Maps (melhor fonte)**
1. Busque "hamburgueria [cidade]"
2. Exporte com ferramenta (Outscraper, PhantomBuster)
3. Filtre: Sem site, <4.5 estrelas, poucos reviews
4. Encontre Instagram/WhatsApp

**Instagram**
1. Busque hashtags: #hamburgueria[cidade]
2. Veja seguidores de concorrentes
3. Analise: Poucos seguidores = menos estruturado = mais precisam

**Listas públicas**
- Guia de bairro
- Listas do TripAdvisor
- Grupos de Facebook locais

### Cadência de prospecção

**Dia 1 — Primeiro contato (Instagram DM)**
```
Oi! Vi que vocês têm uma hamburgueria aqui no [bairro].

Trabalho com tecnologia pra restaurantes e lancei um
sistema de cardápio digital que é grátis.

Posso mandar mais detalhes? 🍔
```

**Dia 3 — Follow-up (se não respondeu)**
```
Oi! Só passando pra ver se conseguiu ver minha mensagem.

Sem compromisso — se não for o momento, sem problemas! 👍
```

**Dia 7 — Último follow-up**
```
Última mensagem, prometo! 😅

Se um dia precisar de um cardápio digital, me chama.
Fica o convite aberto!
```

### Abordagem presencial (opcional, mas efetivo)

Melhor horário: 14h-16h (após almoço, antes do jantar)

Script:
```
"Oi, tudo bem? Sou o [nome], trabalho com tecnologia.

Vocês já têm um cardápio digital com QR Code?

[Se não]: Legal, eu desenvolvi um sistema que é gratuito.
Posso deixar meu contato? Se tiver interesse,
a gente marca pra eu mostrar como funciona."
```

**Levar**: Cartão de visita com QR Code para demo

### Volume de prospecção

| Semana | Contatos | Respostas esperadas | Demos |
|--------|----------|---------------------|-------|
| 1 | 50 | 10-15 | 3-5 |
| 2 | 50 | 10-15 | 3-5 |
| 3 | 50 | 10-15 | 3-5 |
| 4 | 50 | 10-15 | 3-5 |

**Meta**: 20 demos/mês → 10 cadastros → 2-3 pagantes

---

## 11. Funil de Vendas

### Estrutura do funil

```
┌─────────────────────────────────────────────────────────────┐
│  TOPO — Awareness                                           │
│  • Blog/SEO                                                 │
│  • Instagram                                                │
│  • Google Ads                                               │
│  Métrica: Visitantes únicos                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (3-5% convertem)
┌─────────────────────────────────────────────────────────────┐
│  MEIO — Interesse                                           │
│  • Cadastro grátis                                          │
│  • Lead magnet (ebook, template)                            │
│  Métrica: Cadastros                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (30-50% ativam)
┌─────────────────────────────────────────────────────────────┐
│  FUNDO — Ativação                                           │
│  • Completou onboarding                                     │
│  • Criou cardápio                                           │
│  • Recebeu primeiro pedido                                  │
│  Métrica: Usuários ativos                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (10-20% convertem)
┌─────────────────────────────────────────────────────────────┐
│  CONVERSÃO — Pagante                                        │
│  • Upgrade para Pro                                         │
│  • Anual com desconto                                       │
│  Métrica: MRR                                               │
└─────────────────────────────────────────────────────────────┘
```

### Gatilhos de conversão

**De visitante → cadastro:**
- CTA claro em todas as páginas
- Exit intent popup: "Espera! Seu cardápio digital grátis te espera"
- Retargeting: "Você quase criou seu cardápio"

**De cadastro → ativo:**
- Onboarding guiado (wizard)
- Email Day 1: "Configure seu cardápio em 5 minutos"
- Email Day 3: "Você não terminou seu cardápio"
- WhatsApp pessoal: "Oi! Vi que você começou, precisa de ajuda?"

**De ativo → pagante:**
- Notificação in-app: "Você atingiu 80% do limite grátis"
- Email: "Seus clientes vão ver marca d'água. Remova por R$97/mês"
- Desconto urgência: "Upgrade hoje, ganhe 30% off no primeiro mês"

---

## 12. Email Marketing

### Ferramenta recomendada

**Resend + React Email** (já integra com o stack)
- Grátis até 3.000 emails/mês
- API simples
- Templates em React

### Sequência de onboarding (automática)

**Email 1 — Imediato após cadastro**
```
Assunto: Seu cardápio digital está pronto 🍔

Oi [nome]!

Seu cadastro foi confirmado. Agora falta só uma coisa:
criar seu cardápio.

[BOTÃO: Criar meu cardápio]

Leva menos de 5 minutos:
1. Adicione suas categorias (Hambúrgueres, Bebidas...)
2. Cadastre seus produtos com foto e preço
3. Compartilhe o link com seus clientes

Qualquer dúvida, responde esse email!

— [Seu nome]
```

**Email 2 — Day 1 (se não completou)**
```
Assunto: Precisa de ajuda com seu cardápio?

Oi [nome],

Vi que você começou seu cadastro mas ainda não
criou seu cardápio.

Tá tendo alguma dificuldade? Responde esse email
que eu te ajudo pessoalmente.

Se preferir, aqui tem um vídeo de 2 minutos mostrando
como fazer: [link]

— [Seu nome]
```

**Email 3 — Day 3**
```
Assunto: [Nome do restaurante], seu cardápio te espera

Oi [nome],

Última tentativa! 😅

Seu cardápio digital está lá, esperando pra ser criado.
Enquanto isso, seus clientes continuam pedindo pelo
WhatsApp bagunçado.

[BOTÃO: Terminar meu cardápio]

Ou me conta: o que te impediu de terminar?

— [Seu nome]
```

**Email 4 — Day 7 (se completou onboarding)**
```
Assunto: Como estão os pedidos, [nome]?

Oi [nome]!

Faz uma semana que seu cardápio está no ar.
Como está sendo a experiência?

- Os clientes estão achando fácil?
- Recebeu muitos pedidos?
- Alguma dúvida?

Responde esse email, adoro ouvir feedback!

— [Seu nome]
```

### Sequência de upgrade (quando atinge limite)

**Email 1 — 80% do limite**
```
Assunto: Parabéns! Seu restaurante está bombando 🎉

Oi [nome]!

Você já recebeu [X] pedidos esse mês — só faltam [Y]
pro limite do plano grátis.

Isso é ótimo! Significa que seus clientes estão adorando
o cardápio digital.

Pra não ter interrupção, que tal fazer upgrade pro
plano Pro? Por R$97/mês você tem:

✓ Pedidos ilimitados
✓ Sem marca d'água
✓ Relatórios de vendas
✓ Suporte prioritário

[BOTÃO: Ver plano Pro]

— [Seu nome]
```

**Email 2 — 100% do limite**
```
Assunto: ⚠️ Limite atingido — seus clientes vão ver isso

Oi [nome],

Você atingiu o limite de 50 pedidos do plano grátis.

A partir de agora, seus clientes vão ver uma mensagem
pedindo pra esperar até o mês que vem.

Pra liberar pedidos ilimitados agora:

[BOTÃO: Fazer upgrade — R$97/mês]

Se preferir, responde esse email e a gente conversa.

— [Seu nome]
```

### Newsletter mensal (para base toda)

```
Assunto: 📊 [Mês] no [SuaMarca]: novidades + dica do mês

Oi [nome]!

## O que lançamos esse mês
[1-2 features novas]

## Dica do mês
[Conteúdo educativo curto]

## Case de sucesso
[História de um cliente]

## Próximos passos
[CTA relevante pro estágio do usuário]

Até o mês que vem!
— [Seu nome]
```

---

## 13. Fechamento de Vendas

### Script de demo (30 min)

**Abertura (5 min)**
```
"Oi [nome], tudo bem? Obrigado por topar conversar.

Antes de mostrar o sistema, queria entender melhor
o seu negócio.

- Quantos pedidos você recebe por dia mais ou menos?
- Como você recebe esses pedidos hoje? WhatsApp?
- Qual a maior dificuldade que você tem com isso?"
```

**Diagnóstico (5 min)**

Perguntas para encontrar dor:
- "Você já perdeu pedido porque não viu a mensagem?"
- "Sabe quanto você vendeu no mês passado?"
- "Quanto tempo você gasta por dia respondendo WhatsApp?"

**Demo (15 min)**

Mostrar na ordem:
1. Cardápio público (visão do cliente)
2. Como é fazer pedido (simular)
3. Painel de pedidos (visão do dono)
4. Cadastro de produtos (simplicidade)
5. QR Code gerado automaticamente

**Fechamento (5 min)**
```
"E aí, o que você achou?

[Ouvir feedback]

Legal! Então funciona assim: você pode começar grátis
agora mesmo. Cria sua conta, cadastra seus produtos,
e já pode usar.

Se você gostar e quiser recursos extras, tem o plano
Pro por R$97/mês — mas não precisa decidir agora.

Quer que eu te ajude a fazer o cadastro inicial?"
```

### Objeções comuns

**"Preciso pensar"**
```
"Claro! Enquanto você pensa, quer criar a conta grátis?
Assim você já testa e depois decide. Sem compromisso."
```

**"Não tenho tempo pra aprender"**
```
"Entendo. Por isso o sistema é bem simples — a maioria
dos clientes cadastra tudo em uma tarde. E se travar
em algo, é só me chamar que eu ajudo pessoalmente."
```

**"Já tentei outros e não deu certo"**
```
"O que deu errado? [Ouvir] Entendi. O [SuaMarca] é
diferente porque [diferencial]. Mas não precisa
acreditar em mim — testa grátis e vê se faz sentido."
```

**"Tá caro"**
```
"Entendo. Só pra contextualizar: R$97/mês dá R$3/dia.
Se o cardápio digital trouxer 1 pedido a mais por dia
— e ele traz — já paga o sistema e sobra.

Mas você pode começar grátis e só fazer upgrade
quando tiver certeza do valor."
```

### Follow-up pós-demo

**Mesmo dia (WhatsApp)**
```
Oi [nome]! Obrigado pela conversa de hoje.

Criei sua conta: [link de acesso]
Senha temporária: [senha]

Qualquer dúvida, me chama aqui!
```

**Day 2 (se não acessou)**
```
Oi [nome]! Conseguiu dar uma olhada no sistema?

Se quiser, posso te ajudar a cadastrar os primeiros
produtos. Leva uns 15 minutos.
```

**Day 5 (último)**
```
Oi [nome]! Passando pra ver se ainda tem interesse.

Se não for o momento, sem problemas! Fica o convite
aberto pra quando fizer sentido.
```

---

## 14. Métricas e KPIs

### Dashboard semanal

| Métrica | Meta Mês 1 | Meta Mês 3 | Meta Mês 6 |
|---------|------------|------------|------------|
| Visitantes únicos | 500 | 2.000 | 5.000 |
| Cadastros (grátis) | 20 | 80 | 200 |
| Ativação (criou cardápio) | 10 | 50 | 120 |
| Pagantes (Pro) | 2 | 15 | 40 |
| MRR | R$194 | R$1.455 | R$3.880 |
| Churn | - | <10% | <8% |

### Funil de conversão

```
Visitante → Cadastro: 4-6%
Cadastro → Ativo: 40-60%
Ativo → Pagante: 10-20%
```

### Métricas de aquisição

| Canal | CAC esperado | Volume |
|-------|--------------|--------|
| Orgânico (SEO) | R$0 | Baixo inicialmente |
| Indicação | R$0-50 | Médio |
| Prospecção | R$0 (tempo) | Médio |
| Google Ads | R$30-60 | Alto |
| Meta Ads | R$50-100 | Alto |

### Métricas de produto

- **Activation rate**: % que completa onboarding
- **Pedidos por usuário**: média de pedidos/mês
- **Time to value**: dias até primeiro pedido
- **Feature adoption**: % usando cada feature

### Planilha de acompanhamento

```
| Semana | Visitas | Cadastros | Ativo | Pagante | MRR | Notas |
|--------|---------|-----------|-------|---------|-----|-------|
| S1 | | | | | | |
| S2 | | | | | | |
...
```

---

## 15. Stack de Ferramentas

### Essenciais (grátis ou barato)

| Função | Ferramenta | Custo |
|--------|------------|-------|
| Analytics | Plausible ou GA4 | Grátis |
| Email | Resend | Grátis até 3k/mês |
| CRM | Notion ou Planilha | Grátis |
| Automação email | Resend + código | Grátis |
| Agendamento | Cal.com | Grátis |
| Suporte | WhatsApp + Notion | Grátis |
| Social | Buffer (básico) | Grátis |

### Quando escalar (Mês 3+)

| Função | Ferramenta | Custo |
|--------|------------|-------|
| CRM | Pipedrive | ~R$60/mês |
| Automação | n8n self-hosted | Grátis |
| Suporte | Crisp | Grátis até 2 agentes |
| Analytics avançado | Mixpanel | Grátis até 20k eventos |

### Ads

| Plataforma | Budget mínimo |
|------------|---------------|
| Google Ads | R$900/mês |
| Meta Ads | R$600/mês |

---

## 16. Cronograma Semanal

### Rotina do solo founder

**Segunda (4h)**
- 1h: Revisão de métricas da semana anterior
- 2h: Desenvolvimento (features/bugs)
- 1h: Responder leads/clientes

**Terça (4h)**
- 2h: Prospecção ativa (20 contatos)
- 1h: Criar conteúdo Instagram
- 1h: Suporte/onboarding clientes

**Quarta (4h)**
- 3h: Desenvolvimento
- 1h: Escrever post de blog

**Quinta (4h)**
- 2h: Demos/calls com leads
- 1h: Prospecção (20 contatos)
- 1h: Follow-ups

**Sexta (4h)**
- 2h: Desenvolvimento
- 1h: Publicar conteúdo
- 1h: Planejamento próxima semana

**Total: 20h/semana**

### Distribuição de tempo

| Atividade | % tempo |
|-----------|---------|
| Desenvolvimento | 35% |
| Vendas/Prospecção | 30% |
| Marketing/Conteúdo | 20% |
| Suporte/CS | 15% |

---

## Checklist de Lançamento

### Pré-lançamento
- [ ] MVP funcional (cadastro → pedido → WhatsApp)
- [ ] Landing page com pricing
- [ ] Checkout funcionando (Stripe)
- [ ] 5 posts de blog publicados
- [ ] Instagram com 9 posts
- [ ] Google Search Console configurado
- [ ] Analytics instalado

### Semana 1
- [ ] 50 contatos de prospecção
- [ ] 5-10 cadastros grátis
- [ ] Primeiro feedback documentado

### Mês 1
- [ ] 20+ cadastros grátis
- [ ] 10+ usuários ativos
- [ ] 2+ pagantes
- [ ] R$200+ MRR

### Mês 3
- [ ] 80+ cadastros grátis
- [ ] 50+ usuários ativos
- [ ] 15+ pagantes
- [ ] R$1.500+ MRR
- [ ] Processo de vendas documentado

---

## Próximos Passos Imediatos

1. **Hoje**: Terminar features bloqueantes do MVP
2. **Esta semana**: Landing page + pricing + checkout
3. **Próxima semana**: 5 posts de blog + setup Instagram
4. **Semana 3**: Começar prospecção ativa
5. **Semana 4**: Primeiros 10 cadastros grátis

---

*Documento criado em 2026-02-13. Revisitar mensalmente.*
