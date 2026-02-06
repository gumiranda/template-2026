ultrathink: faça um code review detalhado desses arquivos seguindo as guidelines:

Readability: Is the logic clear? Anything that should be extracted or simplified?

Error handling & edge cases: Any parts that might break?

Performance: Suspense usage, lazy loading, bundle size, unnecessary computations\deps?

Styling: Consistent with the design system? Any duplicated or unused styles?

Code repetition: Any duplicated logic that should be refactored?

Function extraction: Any blocks that should be moved to helpers\hooks?

Console logs: Any leftover debug logs?

Project patterns: Is this aligned with existing patterns or introducing new ones unnecessarily?
Comments: Remove every single comment.

Overengineering: Is there a simpler way to do this? Any unnecessary complexity?

Prop drilling: Are props being passed too deeply? Could context, hooks, or restructuring help?

Maintainability: Is this creating something hard to maintain or extend?

Re-renders: Does this implementation cause unnecessary re-renders? Should memoization or stabilizing references be considered?

Abstractions: Are the abstractions and functions created truly necessary, or adding complexity without benefit?

Dead code: Any dead or unused code that should be removed after the new changes?

unnecessary casts: Are there any unnecessary casts that can be removed?

complexity: any code with complexity 0(n+1) or O(n)2 will be refactored.

Thoroughly investigate the current feature for security problems, permission gaps. Act like a red-team pen-tester. Suggest fixes.

Implemente lazy loading para componentes pesados.

Implemente o código split usando React.lazy e Suspense.

Use IntersectionObserver para carregar imagens e componentes somente quando estiverem visíveis.

Adicione descrições alternativas (alt) para todas as imagens.

Assegure que todos os elementos interativos possam ser acessados via teclado.

Utilize aria-label e aria-labelledby para descrever componentes complexos.

Use aria-live para atualizações dinâmicas do conteúdo.

Implemente navegação por tab de maneira lógica e intuitiva.

Forneça feedback visual em elementos focáveis.

Adicione feedback visual para ações do usuário, como cliques e carregamentos.

Implemente breadcrumbs para facilitar a navegação.

Utilize placeholders significativos em campos de entrada de dados.

Adicione tooltips para ícones ou ações que podem não ser imediatamente óbvias.

Forneça mensagens de erro claras e específicas para validação de formulário.

Use modais para ações que requerem confirmação.

Adicione animações sutis para melhorar a experiência do usuário

Divida componentes grandes em componentes menores e reutilizáveis.

Use hooks personalizados para lógica de componentes reutilizável.

Adicione alt text a todas as imagens para melhorar a acessibilidade e SEO.
