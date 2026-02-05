/**
 * Solution data for feature pages (/solucoes/[feature])
 *
 * Each solution entry generates a unique landing page targeting
 * feature-specific search queries (e.g., "cardápio digital QR code").
 */

export interface Solution {
  slug: string;
  name: string;
  /** Hero headline */
  headline: string;
  /** Hero subheadline */
  subheadline: string;
  /** SEO meta description */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** SEO keywords to target */
  keywords: string[];
  /** Key benefits */
  benefits: Array<{
    title: string;
    description: string;
  }>;
  /** How it works — 3 steps */
  howItWorks: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  /** Impact stats */
  stats: Array<{
    value: string;
    label: string;
  }>;
  /** FAQ for schema */
  faq: Array<{
    question: string;
    answer: string;
  }>;
  /** Related persona slugs */
  relatedPersonas: string[];
}

export const solutions: Solution[] = [
  {
    slug: "cardapio-digital-qr-code",
    name: "Cardápio Digital com QR Code",
    headline: "Cardápio digital com QR Code para mesa",
    subheadline:
      "Seus clientes escaneiam o QR Code na mesa e acessam o cardápio completo pelo celular. Sem app, sem espera.",
    description:
      "Crie um cardápio digital com QR Code para mesa do seu restaurante. Clientes escaneiam e pedem pelo celular, sem baixar app. Reduza erros e agilize o atendimento.",
    icon: "QrCode",
    keywords: [
      "cardápio digital QR code",
      "cardápio digital para mesa",
      "QR code restaurante",
      "menu digital QR code",
      "cardápio pelo celular",
    ],
    benefits: [
      {
        title: "Sem app para baixar",
        description:
          "O cliente escaneia o QR Code e acessa o cardápio direto no navegador. Zero fricção.",
      },
      {
        title: "Atualização em tempo real",
        description:
          "Alterou um preço ou esgotou um prato? O cardápio atualiza instantaneamente para todas as mesas.",
      },
      {
        title: "Fotos e descrições completas",
        description:
          "Cada item com foto de alta qualidade, descrição e opções de personalização.",
      },
      {
        title: "Redução de custos com impressão",
        description:
          "Elimine cardápios físicos que ficam desatualizados e custam caro para reimprimir.",
      },
      {
        title: "Pedido direto pelo celular",
        description:
          "O cliente não apenas visualiza — ele faz o pedido diretamente, sem chamar o garçom.",
      },
      {
        title: "QR Code por mesa",
        description:
          "Cada mesa tem seu QR Code exclusivo. O pedido já chega identificado com o número da mesa.",
      },
    ],
    howItWorks: [
      {
        step: "1",
        title: "Configure suas mesas",
        description:
          "Cadastre as mesas do seu restaurante e gere QR Codes exclusivos para cada uma.",
      },
      {
        step: "2",
        title: "Imprima e posicione",
        description:
          "Imprima os QR Codes em adesivos ou displays e coloque em cada mesa.",
      },
      {
        step: "3",
        title: "Cliente escaneia e pede",
        description:
          "O cliente aponta a câmera, acessa o cardápio e faz o pedido. Você recebe na hora.",
      },
    ],
    stats: [
      { value: "-80%", label: "erros de pedido" },
      { value: "+25%", label: "ticket médio" },
      { value: "R$ 0", label: "custo de impressão" },
      { value: "30s", label: "para começar a pedir" },
    ],
    faq: [
      {
        question: "Precisa de internet para acessar o cardápio digital?",
        answer:
          "Sim, o cliente precisa de conexão à internet no celular para acessar o cardápio digital via QR Code. A maioria dos restaurantes oferece Wi-Fi, o que elimina essa barreira.",
      },
      {
        question: "O cliente precisa baixar algum aplicativo?",
        answer:
          "Não. O cardápio digital funciona diretamente no navegador do celular. Basta escanear o QR Code e o cardápio abre automaticamente.",
      },
      {
        question: "Como faço para atualizar o cardápio?",
        answer:
          "Você atualiza preços, adiciona ou remove itens diretamente no painel administrativo. As alterações aparecem instantaneamente para todos os clientes.",
      },
      {
        question: "E se o cliente não tiver câmera ou não souber escanear?",
        answer:
          "Você pode manter uma opção de atendimento tradicional. Mas na prática, a grande maioria dos smartphones modernos escaneia QR Codes nativamente pela câmera.",
      },
    ],
    relatedPersonas: ["bares", "pizzarias", "restaurantes-japoneses"],
  },
  {
    slug: "pedidos-na-mesa",
    name: "Pedidos na Mesa pelo Celular",
    headline: "Sistema de pedidos na mesa pelo celular",
    subheadline:
      "O cliente senta, escaneia e pede. Sem esperar garçom, sem fila, sem erros de anotação.",
    description:
      "Sistema de pedidos na mesa pelo celular para restaurantes. O cliente faz o pedido direto do celular, sem baixar app. Reduza filas, erros e aumente a rotatividade.",
    icon: "Smartphone",
    keywords: [
      "sistema de pedidos na mesa",
      "pedido pelo celular restaurante",
      "autoatendimento na mesa",
      "pedido na mesa pelo celular",
      "comanda digital celular",
    ],
    benefits: [
      {
        title: "Sem espera para pedir",
        description:
          "O cliente não precisa chamar o garçom. Abre o celular, escolhe e pronto.",
      },
      {
        title: "Zero erros de anotação",
        description:
          "O pedido vai direto para a cozinha, exatamente como o cliente escolheu. Sem intermediários.",
      },
      {
        title: "Mais rotatividade",
        description:
          "Mesas que pedem mais rápido liberam mais rápido. Mais clientes atendidos por turno.",
      },
      {
        title: "Upsell automático",
        description:
          "Sugestões de adicionais, combos e acompanhamentos aparecem naturalmente durante o pedido.",
      },
      {
        title: "Equipe focada na entrega",
        description:
          "Garçons deixam de anotar e focam em servir. Atendimento mais ágil e personalizado.",
      },
      {
        title: "Múltiplos pedidos por visita",
        description:
          "O cliente pede mais facilmente uma segunda rodada, sobremesa ou bebida extra.",
      },
    ],
    howItWorks: [
      {
        step: "1",
        title: "QR Code na mesa",
        description:
          "Cada mesa tem um QR Code. O cliente escaneia com a câmera do celular.",
      },
      {
        step: "2",
        title: "Escolhe e personaliza",
        description:
          "O cliente navega pelo cardápio, personaliza itens e adiciona ao carrinho.",
      },
      {
        step: "3",
        title: "Pedido confirmado",
        description:
          "O pedido vai direto para a cozinha/bar com identificação da mesa.",
      },
    ],
    stats: [
      { value: "+40%", label: "velocidade no atendimento" },
      { value: "+30%", label: "pedidos por mesa" },
      { value: "-90%", label: "erros de anotação" },
      { value: "+20%", label: "ticket médio" },
    ],
    faq: [
      {
        question:
          "O sistema de pedidos na mesa substitui o garçom?",
        answer:
          "Não substitui, transforma o papel do garçom. Em vez de anotar pedidos, o garçom foca em servir, tirar dúvidas e garantir uma boa experiência. O atendimento humano continua essencial.",
      },
      {
        question:
          "E se o cliente quiser pedir mais coisas depois?",
        answer:
          "O cliente pode fazer quantos pedidos quiser durante a visita. Basta escanear o QR Code novamente ou acessar a sessão ativa e adicionar mais itens.",
      },
      {
        question: "Funciona com qualquer celular?",
        answer:
          "Funciona com qualquer smartphone que tenha câmera e navegador. Não precisa de app. iPhones e Androids recentes já escaneiam QR Code nativamente pela câmera.",
      },
      {
        question: "Como o restaurante controla os pedidos?",
        answer:
          "Todos os pedidos aparecem em tempo real no painel administrativo, organizados por mesa. A cozinha recebe cada pedido automaticamente.",
      },
    ],
    relatedPersonas: ["bares", "hamburguerias", "restaurantes-japoneses"],
  },
  {
    slug: "comanda-digital",
    name: "Comanda Digital",
    headline: "Comanda digital para restaurante",
    subheadline:
      "Substitua as comandas de papel por uma solução digital. Controle total, zero papel perdido.",
    description:
      "Comanda digital para restaurante pequeno. Substitua papel por controle digital de pedidos por mesa. Sem comanda perdida, sem erro de cobrança.",
    icon: "ClipboardList",
    keywords: [
      "comanda digital restaurante",
      "comanda digital para restaurante pequeno",
      "comanda eletrônica",
      "sistema de comanda digital",
      "controle de comanda restaurante",
    ],
    benefits: [
      {
        title: "Fim das comandas perdidas",
        description:
          "Tudo fica registrado digitalmente. Sem papel rasgado, ilegível ou desaparecido.",
      },
      {
        title: "Fechamento instantâneo",
        description:
          "A conta fecha em segundos. O cliente vê exatamente o que consumiu.",
      },
      {
        title: "Histórico completo",
        description:
          "Cada mesa tem histórico de pedidos em tempo real. Sabe exatamente o que foi pedido e quando.",
      },
      {
        title: "Sem erro de cobrança",
        description:
          "O valor é calculado automaticamente. Sem conta errada, sem discussão.",
      },
      {
        title: "Ideal para restaurantes pequenos",
        description:
          "Não precisa de sistema caro ou hardware especial. Funciona com o celular que você já tem.",
      },
      {
        title: "Controle de consumo por mesa",
        description:
          "Acompanhe em tempo real o que cada mesa está consumindo e o valor total.",
      },
    ],
    howItWorks: [
      {
        step: "1",
        title: "Mesa abre a comanda",
        description:
          "O cliente escaneia o QR Code ou o garçom abre a comanda no sistema.",
      },
      {
        step: "2",
        title: "Pedidos acumulam",
        description:
          "Cada pedido é registrado na comanda digital. Múltiplas rodadas sem perder nada.",
      },
      {
        step: "3",
        title: "Fecha a conta",
        description:
          "Na hora de pagar, a conta está pronta. Valor exato, sem surpresas.",
      },
    ],
    stats: [
      { value: "100%", label: "das comandas rastreáveis" },
      { value: "-95%", label: "erros de cobrança" },
      { value: "10s", label: "para fechar a conta" },
      { value: "R$ 0", label: "custo com papel" },
    ],
    faq: [
      {
        question: "Preciso de um tablet ou equipamento especial?",
        answer:
          "Não. O sistema funciona em qualquer celular ou computador com navegador. Você pode usar o equipamento que já tem.",
      },
      {
        question: "E se a internet cair no meio do expediente?",
        answer:
          "O sistema mantém os dados sincronizados em tempo real. Em caso de queda breve, os dados são preservados e sincronizam quando a conexão volta.",
      },
      {
        question: "Funciona para restaurante com poucas mesas?",
        answer:
          "Sim, funciona perfeitamente para restaurantes de qualquer tamanho. Na verdade, restaurantes pequenos são os que mais se beneficiam, pois eliminam a necessidade de sistemas caros.",
      },
      {
        question: "Como funciona a divisão de conta?",
        answer:
          "O sistema mostra todos os itens da comanda. Você pode dividir igualmente ou por consumo individual, facilitando o fechamento.",
      },
    ],
    relatedPersonas: ["bares", "pizzarias", "hamburguerias"],
  },
  {
    slug: "delivery-proprio",
    name: "Delivery Próprio",
    headline: "Delivery próprio: pare de pagar comissões",
    subheadline:
      "Monte seu canal de delivery sem pagar 27% de comissão. Seus clientes, seus dados, seu lucro.",
    description:
      "Monte seu delivery próprio e pare de depender do iFood. Canal de vendas direto, sem comissão por pedido. Seus clientes, seus dados, seu lucro.",
    icon: "Bike",
    keywords: [
      "delivery próprio restaurante",
      "delivery próprio vs iFood",
      "como montar delivery próprio",
      "plataforma delivery próprio",
      "delivery sem comissão",
    ],
    benefits: [
      {
        title: "Zero comissão por pedido",
        description:
          "Pague um valor fixo mensal. Sem porcentagem sobre cada venda como nos marketplaces.",
      },
      {
        title: "Seus dados, seus clientes",
        description:
          "Acesse os dados dos clientes para campanhas de fidelização, promoções e remarketing.",
      },
      {
        title: "Sua marca em destaque",
        description:
          "O cliente acessa seu cardápio, com sua identidade visual. Sem concorrentes ao lado.",
      },
      {
        title: "Controle total de preços",
        description:
          "Defina seus preços sem inflar para cobrir comissões de marketplace.",
      },
      {
        title: "Link direto de pedido",
        description:
          "Compartilhe um link do seu cardápio no Instagram, WhatsApp e Google. O cliente pede direto.",
      },
      {
        title: "Complementa o marketplace",
        description:
          "Não precisa sair do iFood. Use o delivery próprio como canal adicional para clientes recorrentes.",
      },
    ],
    howItWorks: [
      {
        step: "1",
        title: "Cadastre seu cardápio",
        description:
          "Adicione seus itens com fotos, preços e opções de personalização.",
      },
      {
        step: "2",
        title: "Compartilhe o link",
        description:
          "Divulgue o link do seu cardápio nas redes sociais, WhatsApp e Google Meu Negócio.",
      },
      {
        step: "3",
        title: "Receba pedidos diretos",
        description:
          "Pedidos chegam no painel em tempo real. Sem intermediários, sem comissão.",
      },
    ],
    stats: [
      { value: "27%", label: "economia vs marketplace" },
      { value: "100%", label: "dos dados do cliente" },
      { value: "+35%", label: "margem de lucro" },
      { value: "5min", label: "para publicar o cardápio" },
    ],
    faq: [
      {
        question: "Preciso sair do iFood para usar?",
        answer:
          "Não. O delivery próprio funciona como canal complementar. Continue no iFood para atrair novos clientes e direcione os recorrentes para seu canal próprio, sem comissão.",
      },
      {
        question: "Como os clientes encontram meu delivery próprio?",
        answer:
          "Você compartilha o link do seu cardápio no Instagram, WhatsApp, Google Meu Negócio e dentro da embalagem de delivery. Com o tempo, clientes recorrentes passam a pedir direto.",
      },
      {
        question: "E a entrega, como funciona?",
        answer:
          "Você gerencia a entrega com sua própria equipe ou motoboys parceiros. O sistema foca no pedido e no cardápio — a logística continua com você.",
      },
      {
        question: "Quanto custa ter um delivery próprio?",
        answer:
          "Um valor fixo mensal, sem comissão por pedido. Diferente dos marketplaces que cobram até 27% de cada venda.",
      },
    ],
    relatedPersonas: ["pizzarias", "hamburguerias", "padarias"],
  },
  {
    slug: "autoatendimento",
    name: "Autoatendimento",
    headline: "Autoatendimento para restaurante",
    subheadline:
      "Deixe o cliente pedir no seu ritmo. Menos fila, mais pedidos, melhor experiência.",
    description:
      "Sistema de autoatendimento para restaurante. Cliente pede pelo celular sem fila e sem pressão. Aumente a rotatividade e reduza custos operacionais.",
    icon: "UserCheck",
    keywords: [
      "autoatendimento restaurante",
      "autoatendimento restaurante vantagens",
      "sistema autoatendimento restaurante",
      "totem autoatendimento restaurante",
      "self service digital restaurante",
    ],
    benefits: [
      {
        title: "Sem fila para pedir",
        description:
          "Cada cliente pede pelo próprio celular, no seu ritmo. Sem fila no caixa ou balcão.",
      },
      {
        title: "Cliente pede sem pressão",
        description:
          "Sem pressa de fila atrás. O cliente explora o cardápio com calma e descobre mais opções.",
      },
      {
        title: "Ticket médio maior",
        description:
          "Clientes que pedem pelo celular tendem a adicionar mais itens, combos e complementos.",
      },
      {
        title: "Operação mais enxuta",
        description:
          "Menos pessoas no caixa. Sua equipe foca na produção e entrega.",
      },
      {
        title: "Sem custo de totem",
        description:
          "Funciona no celular do cliente. Sem investimento em totens caros ou manutenção de hardware.",
      },
      {
        title: "Picos de horário sob controle",
        description:
          "No almoço lotado, todos pedem ao mesmo tempo pelo celular. Sem gargalo no atendimento.",
      },
    ],
    howItWorks: [
      {
        step: "1",
        title: "QR Code visível",
        description:
          "Posicione QR Codes nas mesas, balcão ou entrada do restaurante.",
      },
      {
        step: "2",
        title: "Cliente faz o pedido",
        description:
          "O cliente escaneia, navega pelo cardápio e finaliza o pedido pelo celular.",
      },
      {
        step: "3",
        title: "Cozinha recebe direto",
        description:
          "O pedido aparece na cozinha automaticamente. Sem intermediários.",
      },
    ],
    stats: [
      { value: "-70%", label: "tempo de espera" },
      { value: "+25%", label: "ticket médio" },
      { value: "+50%", label: "pedidos no horário de pico" },
      { value: "R$ 0", label: "investimento em totem" },
    ],
    faq: [
      {
        question:
          "Qual a diferença entre autoatendimento no celular e totem?",
        answer:
          "O totem é um equipamento físico que custa caro e precisa de manutenção. O autoatendimento pelo celular usa o dispositivo que o cliente já carrega no bolso — sem custo de hardware e sem fila no totem.",
      },
      {
        question: "Funciona para restaurante self-service/por quilo?",
        answer:
          "O sistema é ideal para restaurantes com cardápio fixo (à la carte, lanches, etc). Para self-service por quilo, o modelo é diferente, mas pode ser usado para bebidas e sobremesas.",
      },
      {
        question: "Clientes mais velhos conseguem usar?",
        answer:
          "A interface é simples e visual, com fotos grandes e poucos passos. Mas você pode manter a opção de atendimento tradicional para quem preferir.",
      },
      {
        question: "Preciso de Wi-Fi no restaurante?",
        answer:
          "Recomendamos oferecer Wi-Fi, mas o sistema funciona com dados móveis (4G/5G) do próprio cliente. Um Wi-Fi gratuito melhora a experiência.",
      },
    ],
    relatedPersonas: ["food-trucks", "hamburguerias", "cafeterias"],
  },
];

export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}

export function getAllSolutionSlugs(): string[] {
  return solutions.map((s) => s.slug);
}
