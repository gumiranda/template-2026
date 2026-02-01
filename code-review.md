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
