Avaliacao do Projeto - Convex Best Practices │
│ │
│ Resumo Geral │
│ │
│ Projeto: Sistema de gerenciamento de restaurantes (multi-tenant) usando Next.js 15 + Convex + Clerk. │
│ Stack: Monorepo com pnpm/Turbo, shadcn/ui, React 19, Tailwind CSS 4. │
│ │
│ --- │
│ PONTOS POSITIVOS (O que esta bem feito) │
│ │
│ 1. Schema Design │
│ │
│ - Uso correto de defineSchema e defineTable com validators adequados │
│ - Indexes bem definidos para os padroes de acesso mais comuns │
│ - Uso de v.id("tableName") para foreign keys (type-safe) │
│ - Nao inclui \_creationTime nos indexes (correto conforme guidelines) │
│ - Index compostos utilizados onde necessario (by_table_number, by_restaurant_order, by_status) │
│ │
│ 2. Queries │
│ │
│ - Uso consistente de withIndex() para queries (conforme recomendado) │
│ - Paginacao implementada em getAllUsers com cursor │
│ - Batch fetching otimizado com batchFetchMenuItems e batchFetchTables usando Map para O(1) lookups │
│ - Queries condicionais no frontend com "skip" para evitar chamadas desnecessarias │
│ │
│ 3. Mutations │
│ │
│ - Validators em todos os argumentos de mutations │
│ - Validacao server-side de precos em createOrder (previne manipulacao do cliente) │
│ - Soft delete implementado corretamente em restaurants │
│ - Race condition handling no bootstrap (verifica superadmins duplicados) │
│ │
│ 4. Autenticacao & Autorizacao │
│ │
│ - Sistema de auth bem estruturado com helpers reutilizaveis (requireAuth, requireRestaurantAccess, etc.) │
│ - RBAC com hierarquia clara (SUPERADMIN > CEO > WAITER > USER) │
│ - Backend valida TODAS as permissoes independentemente do frontend │
│ - AdminGuard no frontend explicitamente documentado como "UI-only" │
│ │
│ 5. Seguranca │
│ │
│ - Validacao de UUID v4 para session IDs (previne enumeracao) │
│ - Expiracao de sessoes (24h) │
│ - clerkId removido dos retornos de getAllUsers │
│ - Prevencao de auto-modificacao de role │
│ │
│ 6. Organizacao │
│ │
│ - Monorepo bem estruturado (backend, web, ui separados) │
│ - Tipos centralizados em lib/types.ts │
│ - Helpers utilitarios em lib/helpers.ts │
│ - internalMutation usado corretamente para migracoes │
│ │
│ --- │
│ PROBLEMAS ENCONTRADOS (O que precisa melhorar) │
│ │
│ CRITICO - Violacoes das Guidelines do Convex │
│ │
│ P1: Uso de .filter() em queries (VIOLA guideline principal) │
│ │
│ Guideline: "Do NOT use filter in queries. Instead, define an index in the schema and use withIndex instead." │
│ │
│ Ocorrencias: │
│ - restaurants.ts:18,22 - filter((r) => r.deletedAt === undefined) - Filtragem pos-query para soft delete │
│ - restaurants.ts:156 - Mesmo problema no listAllWithStats │
│ - restaurants.ts:199-202 - Filtra orders por status apos buscar todos │
│ - tables.ts:65 - .filter((q) => q.eq(q.field("isActive"), true)) em carts │
│ - carts.ts:33,100,161 - .filter() para buscar carts ativos │
│ - sessions.ts:90 - .filter((q) => q.eq(q.field("menuItemId"), ...)) em sessionCartItems │
│ - carts.ts:116 - .filter() para buscar cartItem por menuItemId │
│ - tables.ts:164 - tables.filter((t) => t.isActive) em JavaScript (nao no banco) │
│ - tables.ts:367 - .filter((q) => q.gt(q.field("expiresAt"), Date.now())) em sessions │
│ │
│ Solucao: Criar indexes adequados: │
│ - carts: index by_table_and_active em ["tableId", "isActive"] │
│ - restaurants: index by_deletedAt ou usar withIndex("by_status") ao inves de filtrar deletedAt │
│ - sessionCartItems: index by_session_and_menuItem em ["sessionId", "menuItemId"] │
│ - cartItems: index by_cart_and_menuItem em ["cartId", "menuItemId"] │
│ │
│ P2: Nomes de indexes nao seguem a convencao │
│ │
│ Guideline: "Always include all index fields in the index name." │
│ │
│ Ocorrencias: │
│ - tables: by_table_number deveria ser by_restaurantId_and_tableNumber │
│ - menuCategories: by_restaurant_order deveria ser by_restaurantId_and_order │
│ - orders: by_status tem campos ["restaurantId", "status"] - deveria ser by_restaurantId_and_status │
│ │
│ P3: Schema usa v.string() para enums ao inves de v.union(v.literal()) │
│ │
│ - users.role usa v.optional(v.string()) - deveria usar v.optional(v.union(v.literal("superadmin"), v.literal("ceo"), ...)) │
│ - users.status usa v.optional(v.string()) - mesma situacao │
│ - orders.status usa v.string() - mesma situacao │
│ - restaurants.status usa v.optional(v.string()) - mesma situacao │
│ │
│ Isso permite inserir qualquer string no banco, enfraquecendo a validacao. │
│ │
│ P4: Paginacao customizada ao inves do padrao Convex │
│ │
│ - users.ts:128-133 - O paginationOpts esta definido manualmente com v.optional(v.object({...})) ao inves de usar paginationOptsValidator do convex/server │
│ - O cursor e definido como v.optional(v.string()) ao inves de v.union(v.string(), v.null()) │
│ │
│ IMPORTANTE - Problemas de Performance e Escalabilidade │
│ │
│ P5: Queries que fazem full table scans │
│ │
│ - restaurants.ts:21 - ctx.db.query("restaurants").collect() sem index (busca TODOS os restaurantes) │
│ - restaurants.ts:155 - Mesmo problema no listAllWithStats │
│ - restaurants.ts:236 - getOverviewStats busca TODOS os restaurantes │
│ - restaurants.ts:248-250 - Busca TODOS os completed orders para calcular receita │
│ - orders.ts:34-41 - Promise.all com N queries para buscar orderItems (N+1 problem) │
│ - tables.ts:91-96 - Busca TODOS os orders de um restaurante no getTablesOverview │
│ │
│ Risco: Com crescimento dos dados, essas queries vao atingir o limite de 16384 documentos ou o timeout de 1 segundo. │
│ │
│ P6: N+1 Query Problem │
│ │
│ - orders.ts:34-41 - Para cada order, faz uma query separada de orderItems │
│ - tables.ts:71-78 - Para cada cart, faz uma query separada de cartItems │
│ │
│ P7: getOverviewStats le muitos dados │
│ │
│ - Busca TODOS restaurantes + TODAS sessoes ativas + TODOS completed orders em uma unica query │
│ - Facilmente vai estourar limites do Convex com crescimento │
│ │
│ MEDIO - Problemas de Design e Seguranca │
│ │
│ P8: Migrations como mutations publicas │
│ │
│ - users.ts:326 - migrateExistingUsers e uma mutation publica (deveria ser internalMutation) │
│ - Qualquer superadmin autenticado pode executar, mas deveria ser uma operacao interna │
│ │
│ P9: listByRestaurant em tables nao verifica permissao │
│ │
│ - tables.ts:12-38 - Qualquer pessoa pode listar mesas de qualquer restaurante (sem auth check) │
│ - Pode ser intencional (para QR code flow), mas deveria ser documentado │
│ │
│ P10: HTTP endpoints vazio │
│ │
│ - http.ts esta definido mas vazio - pode ser removido ou implementado para webhooks do Clerk │
│ │
│ P11: createSession publica sem rate limiting │
│ │
│ - Qualquer pessoa pode criar sessoes infinitas, potencial abuso │
│ │
│ P12: Falta cleanup de sessoes expiradas │
│ │
│ - Sessoes expiradas ficam no banco indefinidamente │
│ - Deveria ter um cron job para limpar sessoes antigas │
│ │
│ MENOR - Melhorias de Codigo │
│ │
│ P13: Campos createdAt/updatedAt redundantes │
│ │
│ - Convex ja fornece \_creationTime automaticamente │
│ - sessions.createdAt, carts.createdAt, orders.createdAt sao redundantes com \_creationTime │
│ - orders.updatedAt e o unico que faz sentido manter │
│ │
│ P14: Falta de uso de \_creationTime nativo │
│ │
│ - Poderia usar \_creationTime para ordenacao ao inves de campos customizados │
│ │
│ P15: Nao usa Convex File Storage │
│ │
│ - logoUrl e imageUrl armazenam URLs diretas ao inves de Id<"\_storage"> │
│ - Guideline: "Do NOT store file URLs in the database. Instead, store the file id." │
│ │
│ --- │
│ FEATURES AUSENTES (Recomendacoes) │
│ │
│ 1. Cron Jobs │
│ │
│ - Limpeza de sessoes expiradas │
│ - Atualizacao de estatisticas agregadas │
│ │
│ 2. Scheduled Functions │
│ │
│ - Notificacoes quando pedido muda de status │
│ - Limpeza automatica de carts abandonados │
│ │
│ 3. HTTP Endpoints │
│ │
│ - Webhook do Clerk para sincronizar usuarios │
│ - API publica para integracao com delivery │
│ │
│ 4. Search Indexes │
│ │
│ - Busca de itens do menu por nome │
│ - Busca de restaurantes │
│ │
│ 5. File Storage │
│ │
│ - Upload de logos de restaurantes via Convex Storage │
│ - Upload de imagens de itens do menu │
│ │
│ --- │
│ PLANO DE CORRECOES (Priorizado) │
│ │
│ Fase 1 - Criticos (Corrigir primeiro) │
│ │
│ 1. Adicionar indexes para eliminar .filter() em queries │
│ 2. Corrigir nomes de indexes para seguir convencao │
│ 3. Usar paginationOptsValidator do Convex │
│ 4. Converter migrateExistingUsers para internalMutation │
│ │
│ Fase 2 - Performance │
│ │
│ 5. Otimizar queries que fazem full table scan (adicionar indexes, limitar resultados) │
│ 6. Resolver N+1 queries com batch fetching ou indexes compostos │
│ 7. Quebrar getOverviewStats em queries menores │
│ │
│ Fase 3 - Seguranca e Robustez │
│ │
│ 8. Adicionar cron job para limpeza de sessoes │
│ 9. Implementar webhook do Clerk via HTTP endpoint │
│ 10. Adicionar validacao de enum no schema com v.union(v.literal(...)) │
│ │
│ Fase 4 - Melhorias │
│ │
│ 11. Migrar para Convex File Storage para imagens │
│ 12. Adicionar search indexes para busca de menu │
│ 13. Remover campos createdAt redundantes (usar \_creationTime) │
│ │
│ --- │
│ NOTA FINAL │
│ │
│ Score: 7/10 - O projeto tem uma base solida com boas praticas de autenticacao, autorizacao e organizacao de codigo. Os principais problemas sao o uso excessivo de .filter() (que │
│ vai contra a guideline principal do Convex), queries que escalam mal com crescimento de dados, e schema sem validacao estrita de enums. As correcoes da Fase 1 e 2 sao as mais │
│ importantes para garantir que o app funcione bem em producao.
