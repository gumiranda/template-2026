/**
 * Competitor data for comparison pages (/vs/[competitor])
 *
 * Each competitor entry generates a unique page targeting
 * "[Your Product] vs [Competitor]" search queries.
 */

export interface Competitor {
  slug: string;
  name: string;
  description: string;
  website: string;
  logo?: string;
  /** Price range or starting price */
  pricing: string;
  /** Main target market */
  targetMarket: string;
  /** Key features they offer */
  features: string[];
  /** Their limitations or cons */
  limitations: string[];
  /** Why users switch from them to us */
  switchReasons: string[];
  /** Our advantages over them */
  ourAdvantages: string[];
}

export const competitors: Competitor[] = [
  {
    slug: "toast",
    name: "Toast",
    description: "Sistema POS completo para restaurantes com hardware proprietário.",
    website: "https://pos.toasttab.com",
    pricing: "A partir de $0/mês + taxas por transação + hardware obrigatório",
    targetMarket: "Restaurantes de médio a grande porte nos EUA",
    features: [
      "POS com hardware dedicado",
      "Gestão de inventário",
      "Programa de fidelidade",
      "Pedidos online",
      "Relatórios avançados",
    ],
    limitations: [
      "Hardware proprietário obrigatório",
      "Contratos longos com multa de cancelamento",
      "Taxas de processamento não negociáveis",
      "Foco no mercado americano",
      "Curva de aprendizado complexa",
    ],
    switchReasons: [
      "Custo total muito alto com hardware",
      "Dificuldade de cancelar contrato",
      "Suporte técnico demorado",
      "Sistema muito complexo para operações simples",
    ],
    ourAdvantages: [
      "Sem necessidade de hardware especial",
      "Sem contratos ou multas",
      "Setup em minutos, não semanas",
      "Interface intuitiva",
      "Suporte em português",
    ],
  },
  {
    slug: "square",
    name: "Square for Restaurants",
    description: "Solução POS da Square focada em restaurantes.",
    website: "https://squareup.com/restaurants",
    pricing: "A partir de $60/mês + 2.6% + $0.10 por transação",
    targetMarket: "Pequenos restaurantes e food trucks",
    features: [
      "POS móvel",
      "Pedidos online básicos",
      "Gestão de equipe",
      "Relatórios",
      "Integrações com delivery",
    ],
    limitations: [
      "Funcionalidades limitadas no plano básico",
      "Pedidos online básicos",
      "Sem QR code para mesa integrado",
      "Taxas de transação altas",
      "Suporte limitado em português",
    ],
    switchReasons: [
      "Taxas de transação acumulam",
      "Funcionalidades de pedido limitadas",
      "Falta de recursos para dine-in",
    ],
    ourAdvantages: [
      "QR code para mesa incluído",
      "Pedidos dine-in e delivery unificados",
      "Taxas transparentes",
      "Foco em experiência do cliente",
    ],
  },
  {
    slug: "ifood",
    name: "iFood para Restaurantes",
    description: "Principal marketplace de delivery do Brasil.",
    website: "https://restaurante.ifood.com.br",
    pricing: "Comissão de 12% a 27% por pedido",
    targetMarket: "Restaurantes brasileiros focados em delivery",
    features: [
      "Acesso a milhões de clientes",
      "App de entregadores",
      "Marketing na plataforma",
      "Gestão de pedidos",
      "Relatórios de vendas",
    ],
    limitations: [
      "Comissões muito altas",
      "Você não é dono do cliente",
      "Sem dados de contato dos clientes",
      "Concorrência direta na plataforma",
      "Dependência da plataforma",
    ],
    switchReasons: [
      "Comissões corroem a margem",
      "Não consegue fidelizar clientes",
      "Sem acesso aos dados dos clientes",
      "Competindo com restaurantes similares",
    ],
    ourAdvantages: [
      "Sem comissões por pedido",
      "Você é dono dos seus clientes",
      "Dados completos para fidelização",
      "Sua marca, seu canal direto",
      "Pedidos dine-in incluídos",
    ],
  },
  {
    slug: "rappi",
    name: "Rappi para Restaurantes",
    description: "App de delivery latino-americano.",
    website: "https://partners.rappi.com",
    pricing: "Comissão de 15% a 30% por pedido",
    targetMarket: "Restaurantes em grandes cidades da América Latina",
    features: [
      "Alcance de clientes",
      "Entregadores próprios",
      "Promoções na plataforma",
      "Gestão de pedidos",
    ],
    limitations: [
      "Comissões altas",
      "Sem controle sobre entrega",
      "Cliente é da Rappi, não seu",
      "Dependência de promoções para visibilidade",
    ],
    switchReasons: [
      "Margens muito apertadas",
      "Dificuldade de se destacar",
      "Sem relacionamento direto com cliente",
    ],
    ourAdvantages: [
      "Canal de venda direto",
      "Margem integral para você",
      "Relacionamento direto com cliente",
      "Flexibilidade de promoções próprias",
    ],
  },
  {
    slug: "goomer",
    name: "Goomer",
    description: "Cardápio digital e sistema de pedidos brasileiro.",
    website: "https://goomer.com.br",
    pricing: "A partir de R$99/mês",
    targetMarket: "Restaurantes brasileiros de pequeno a médio porte",
    features: [
      "Cardápio digital",
      "QR code para mesa",
      "Pedidos online",
      "Integração com WhatsApp",
      "Gestão de mesas",
    ],
    limitations: [
      "Interface pode ser confusa",
      "Funcionalidades avançadas só em planos caros",
      "Integrações limitadas",
      "Suporte pode demorar",
    ],
    switchReasons: [
      "Busca por interface mais moderna",
      "Necessidade de mais integrações",
      "Custo-benefício",
    ],
    ourAdvantages: [
      "Interface moderna e intuitiva",
      "Setup mais rápido",
      "Todos os recursos incluídos",
      "Experiência do cliente superior",
    ],
  },
  {
    slug: "anota-ai",
    name: "Anota AI",
    description: "Assistente de pedidos com inteligência artificial para WhatsApp.",
    website: "https://anota.ai",
    pricing: "A partir de R$197/mês",
    targetMarket: "Restaurantes que usam WhatsApp para pedidos",
    features: [
      "Atendimento automatizado por WhatsApp",
      "Cardápio digital",
      "Integração com iFood",
      "Relatórios",
    ],
    limitations: [
      "Foco apenas em WhatsApp",
      "Sem solução para dine-in",
      "IA pode errar pedidos complexos",
      "Preço elevado para funcionalidades",
    ],
    switchReasons: [
      "Necessidade de solução completa",
      "Problemas com pedidos por IA",
      "Falta de recurso para mesa",
    ],
    ourAdvantages: [
      "Solução completa: dine-in + delivery",
      "Interface visual para pedidos",
      "Menos erros de interpretação",
      "Preço competitivo",
    ],
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return competitors.map((c) => c.slug);
}
