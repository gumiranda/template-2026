/**
 * Persona data for persona pages (/for/[persona])
 *
 * Each persona entry generates a unique page targeting
 * "online ordering for [restaurant type]" search queries.
 */

export interface Persona {
  slug: string;
  name: string;
  /** Singular form for display */
  singular: string;
  /** Description of this restaurant type */
  description: string;
  /** Hero headline */
  headline: string;
  /** Hero subheadline */
  subheadline: string;
  /** Emoji or icon identifier */
  icon: string;
  /** Common pain points for this type */
  painPoints: string[];
  /** How we solve their problems */
  solutions: string[];
  /** Key features most relevant to them */
  keyFeatures: string[];
  /** Social proof / example use case */
  useCase: {
    quote: string;
    author: string;
    role: string;
  };
  /** SEO keywords to target */
  keywords: string[];
}

export const personas: Persona[] = [
  {
    slug: "pizzarias",
    name: "Pizzarias",
    singular: "Pizzaria",
    description:
      "Sistema de pedidos online completo para pizzarias, com suporte a sabores, bordas e tamanhos personalizados.",
    headline: "O sistema de pedidos que sua pizzaria merece",
    subheadline:
      "Gerencie pedidos de delivery e mesa com facilidade. Sabores, bordas, tamanhos - tudo configurável.",
    icon: "🍕",
    painPoints: [
      "Pedidos por telefone com erros de anotação",
      "Dificuldade de gerenciar combinações de sabores",
      "Clientes esperando na linha",
      "Comissões altas de apps de delivery",
      "Falta de controle sobre dados dos clientes",
    ],
    solutions: [
      "Cardápio digital com todas as combinações possíveis",
      "Cliente monta a pizza do jeito que quer",
      "Zero erros de anotação",
      "Canal próprio sem comissões",
      "Base de clientes para fidelização",
    ],
    keyFeatures: [
      "Configuração de tamanhos (P, M, G, GG)",
      "Múltiplos sabores por pizza",
      "Bordas personalizadas",
      "Adicionais e observações",
      "Tempo de preparo por tamanho",
    ],
    useCase: {
      quote:
        "Reduzi 80% das ligações e os erros de pedido praticamente zeraram. Os clientes adoram montar a pizza pelo celular.",
      author: "Carlos",
      role: "Dono da Pizzaria Bella Napoli",
    },
    keywords: [
      "sistema para pizzaria",
      "cardápio digital pizzaria",
      "pedidos online pizzaria",
      "app para pizzaria",
      "delivery pizzaria",
    ],
  },
  {
    slug: "hamburguerias",
    name: "Hamburguerias",
    singular: "Hamburgueria",
    description:
      "Sistema de pedidos para hamburguerias com gestão de adicionais, combos e personalizações.",
    headline: "Pedidos online para sua hamburgueria",
    subheadline:
      "Adicionais, combos, ponto da carne - seu cliente escolhe tudo pelo celular.",
    icon: "🍔",
    painPoints: [
      "Pedidos complexos com muitos adicionais",
      "Fila de espera no balcão",
      "Dificuldade de comunicar promoções",
      "Gestão de combos",
      "Pedidos errados por falta de clareza",
    ],
    solutions: [
      "Interface visual para montar hambúrguer",
      "QR code na mesa elimina filas",
      "Promoções destacadas no cardápio",
      "Combos configuráveis facilmente",
      "Pedido claro com todas as especificações",
    ],
    keyFeatures: [
      "Adicionais ilimitados",
      "Ponto da carne selecionável",
      "Combos com economia",
      "Fotos de alta qualidade",
      "Observações por item",
    ],
    useCase: {
      quote:
        "O cliente vê a foto, escolhe os adicionais e pronto. Aumentamos o ticket médio em 25% com os combos bem apresentados.",
      author: "Fernanda",
      role: "Gerente da Burger House",
    },
    keywords: [
      "sistema hamburgueria",
      "pedidos online hamburgueria",
      "cardápio digital hamburgueria",
      "app hamburgueria",
      "delivery hamburgueria",
    ],
  },
  {
    slug: "cafeterias",
    name: "Cafeterias",
    singular: "Cafeteria",
    description:
      "Sistema de pedidos para cafeterias e coffee shops com gestão de bebidas personalizadas.",
    headline: "Sua cafeteria na era digital",
    subheadline:
      "Pedidos pelo celular, menos fila no balcão, mais tempo para criar experiências.",
    icon: "☕",
    painPoints: [
      "Filas longas nos horários de pico",
      "Pedidos complexos de bebidas",
      "Dificuldade de upsell",
      "Gestão de leites e alternativas",
      "Clientes apressados",
    ],
    solutions: [
      "Pedido antecipado pelo app",
      "Todas as personalizações disponíveis",
      "Sugestões automáticas de acompanhamentos",
      "Opções de leite claras",
      "Cliente pede sem esperar",
    ],
    keyFeatures: [
      "Tamanhos de bebida",
      "Tipos de leite (integral, desnatado, vegetal)",
      "Shots extras de café",
      "Temperatura (quente, gelado)",
      "Acompanhamentos sugeridos",
    ],
    useCase: {
      quote:
        "Na hora do rush, 60% dos pedidos já chegam pelo sistema. A fila diminuiu e conseguimos focar na qualidade.",
      author: "Marina",
      role: "Proprietária do Coffee Lab",
    },
    keywords: [
      "sistema cafeteria",
      "pedidos online cafeteria",
      "cardápio digital cafe",
      "app para cafeteria",
      "coffee shop sistema",
    ],
  },
  {
    slug: "restaurantes-japoneses",
    name: "Restaurantes Japoneses",
    singular: "Restaurante Japonês",
    description:
      "Sistema para sushi bars e restaurantes japoneses com gestão de combos e rodízio.",
    headline: "Tecnologia que honra a tradição",
    subheadline:
      "Pedidos de sushi, sashimi e combinados com a precisão que sua cozinha merece.",
    icon: "🍣",
    painPoints: [
      "Pedidos de rodízio difíceis de controlar",
      "Combinados com muitas peças",
      "Clientes indecisos com cardápio extenso",
      "Controle de tempo no rodízio",
      "Pedidos errados de peças específicas",
    ],
    solutions: [
      "Controle de rodízio por mesa",
      "Combinados com fotos de cada peça",
      "Navegação por categorias clara",
      "Timer de rodízio integrado",
      "Pedido detalhado por peça",
    ],
    keyFeatures: [
      "Modo rodízio com timer",
      "Combinados com detalhamento",
      "Categorias (sushi, sashimi, hot roll)",
      "Nível de picância/wasabi",
      "Pedidos parciais no rodízio",
    ],
    useCase: {
      quote:
        "O controle de rodízio mudou nosso jogo. Sabemos exatamente o que cada mesa pediu e quando.",
      author: "Takeshi",
      role: "Chef do Sushi Nakamura",
    },
    keywords: [
      "sistema restaurante japonês",
      "cardápio digital sushi",
      "pedidos online japonês",
      "app sushi bar",
      "sistema rodízio japonês",
    ],
  },
  {
    slug: "food-trucks",
    name: "Food Trucks",
    singular: "Food Truck",
    description:
      "Sistema leve e mobile-first para food trucks e operações itinerantes.",
    headline: "Seu food truck, em qualquer lugar",
    subheadline:
      "Sistema que funciona onde você estiver. Pedidos rápidos, operação simplificada.",
    icon: "🚚",
    painPoints: [
      "Fila grande em eventos",
      "Conexão instável em alguns locais",
      "Operação com equipe reduzida",
      "Cardápio que muda frequentemente",
      "Dificuldade de receber pagamentos",
    ],
    solutions: [
      "QR code elimina fila",
      "Funciona com conexão limitada",
      "Interface simples para 1-2 pessoas",
      "Cardápio editável em segundos",
      "Pagamento integrado",
    ],
    keyFeatures: [
      "Modo offline básico",
      "Cardápio editável em tempo real",
      "Interface simplificada",
      "QR code portátil",
      "Relatórios de evento",
    ],
    useCase: {
      quote:
        "Em eventos grandes, o QR code foi nossa salvação. Atendemos o triplo de pessoas com a mesma equipe.",
      author: "João",
      role: "Dono do Taco Truck",
    },
    keywords: [
      "sistema food truck",
      "pedidos online food truck",
      "cardápio digital food truck",
      "app food truck",
      "food truck pagamento",
    ],
  },
  {
    slug: "bares",
    name: "Bares",
    singular: "Bar",
    description:
      "Sistema de pedidos para bares com gestão de comandas e controle de mesa.",
    headline: "Comanda digital para seu bar",
    subheadline:
      "Cliente pede pelo celular, você entrega. Sem garçom anotando errado, sem comanda perdida.",
    icon: "🍺",
    painPoints: [
      "Comandas perdidas ou ilegíveis",
      "Garçom sobrecarregado",
      "Clientes esperando para pedir",
      "Fechamento de conta demorado",
      "Erros de cobrança",
    ],
    solutions: [
      "Comanda 100% digital",
      "Cliente pede quando quer",
      "Pedido vai direto para o bar",
      "Conta fecha em segundos",
      "Histórico completo da mesa",
    ],
    keyFeatures: [
      "Comanda por mesa/pessoa",
      "Divisão de conta",
      "Controle de consumo em tempo real",
      "Promoções de happy hour",
      "Idade mínima para bebidas",
    ],
    useCase: {
      quote:
        "Sexta à noite era caos. Agora os clientes pedem pelo celular e nossos garçons só entregam. Vendemos 40% mais.",
      author: "Ricardo",
      role: "Sócio do Bar do Zé",
    },
    keywords: [
      "sistema para bar",
      "comanda digital bar",
      "pedidos bar celular",
      "app para bar",
      "controle de mesa bar",
    ],
  },
  {
    slug: "sorveterias",
    name: "Sorveterias",
    singular: "Sorveteria",
    description:
      "Sistema para sorveterias e gelaterias com gestão de sabores, tamanhos e coberturas.",
    headline: "Sabor de inovação para sua sorveteria",
    subheadline:
      "Sabores, coberturas, tamanhos - tudo visual e fácil de escolher.",
    icon: "🍦",
    painPoints: [
      "Fila no balcão em dias quentes",
      "Clientes indecisos com muitos sabores",
      "Gestão de sabores disponíveis",
      "Combos e promoções",
      "Controle de estoque de sabores",
    ],
    solutions: [
      "Pedido antecipado pelo celular",
      "Fotos de todos os sabores",
      "Sabores esgotados ficam indisponíveis",
      "Combos visuais atrativos",
      "Baixa automática de estoque",
    ],
    keyFeatures: [
      "Gestão de sabores do dia",
      "Tamanhos e casquinhas",
      "Coberturas e adicionais",
      "Combos familiares",
      "Sabores favoritos salvos",
    ],
    useCase: {
      quote:
        "No verão, a fila dava volta no quarteirão. Com o pedido pelo celular, atendemos todo mundo sem estresse.",
      author: "Ana",
      role: "Dona da Gelato Art",
    },
    keywords: [
      "sistema sorveteria",
      "cardápio digital sorveteria",
      "pedidos online sorveteria",
      "app sorveteria",
      "gelateria sistema",
    ],
  },
  {
    slug: "padarias",
    name: "Padarias",
    singular: "Padaria",
    description:
      "Sistema para padarias e confeitarias com encomendas e pedidos do dia.",
    headline: "Sua padaria conectada",
    subheadline:
      "Encomendas de bolos, pães especiais e pedidos do dia - tudo organizado.",
    icon: "🥐",
    painPoints: [
      "Encomendas por telefone desorganizadas",
      "Clientes esquecem de buscar",
      "Gestão de produção difícil",
      "Horários de retirada conflitantes",
      "Falta de antecedência em encomendas",
    ],
    solutions: [
      "Encomendas online organizadas",
      "Lembretes automáticos de retirada",
      "Visão clara da demanda",
      "Slots de horário definidos",
      "Antecedência mínima configurável",
    ],
    keyFeatures: [
      "Encomendas com antecedência",
      "Horários de retirada",
      "Personalização de bolos",
      "Produtos do dia",
      "Assinatura de pães",
    ],
    useCase: {
      quote:
        "As encomendas de bolo de aniversário agora chegam organizadas. Sei exatamente o que produzir cada dia.",
      author: "Seu José",
      role: "Padeiro da Padaria Família",
    },
    keywords: [
      "sistema padaria",
      "encomendas padaria online",
      "cardápio digital padaria",
      "app padaria",
      "confeitaria pedidos online",
    ],
  },
];

export function getPersonaBySlug(slug: string): Persona | undefined {
  return personas.find((p) => p.slug === slug);
}

export function getAllPersonaSlugs(): string[] {
  return personas.map((p) => p.slug);
}
