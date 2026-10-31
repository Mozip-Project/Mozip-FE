---
name: figma-screen
description: Figma 디자인을 Next.js App Router의 화면으로 구현할 때 사용합니다.
user-invocable: true
argument-hint: <figma-url-or-node>
---

# figma-screen

1. `.claude/references/design-source.md`, `.claude/references/product-brief.md`, `.claude/rules/ui-accessibility.md`, `.claude/rules/next-architecture.md`를 읽습니다. 이미지·폰트·Client Component·스크롤 성능을 변경할 때만 `.claude/rules/next-performance.md`를, 모션을 구현할 때만 `.claude/rules/motion.md`를 추가로 읽습니다.
2. 대상 노드의 레이아웃, 텍스트, 에셋, 상태를 확인하고, 제공되지 않은 반응형·모션·로딩·빈·에러 상태는 가정하지 않습니다.
3. 파일 배치는 `docs/ARCHITECTURE.md`의 기준을 따릅니다. 문서에 정해지지 않은 구조(계정 구분 등)가 필요하면 임의로 만들지 않고 먼저 사용자에게 확인합니다.
4. 콘텐츠·시맨틱 구조·이미지 크기부터 구현합니다. 정적 콘텐츠는 Server Component로 두고 브라우저 상호작용만 최소 Client Component로 분리합니다.
5. 데스크톱과 좁은 화면에서 위계, 줄바꿈, overflow, 터치·키보드 조작을 확인합니다. 모션이 있으면 reduced motion도 확인합니다.
6. 외부 참고 사이트의 에셋·카피·코드를 복제하지 않고, 제공 근거 밖의 수치·정책·문구를 추가하지 않습니다.
7. Figma와 대조한 뒤 `pnpm lint`, `pnpm type-check` 및 변경 범위에 맞는 화면 검증을 실행합니다. Figma와 렌더 화면을 모두 확보할 수 있으면 `.claude/agents/visual-verifier.md`에 독립 비교를 요청합니다.

Figma 노드가 제공되지 않았거나 카피·에셋의 사실 근거가 불분명하면 추측으로 채우지 않습니다. 확인한 범위, 구현한 범위, 남은 디자인·사실 검증 공백을 구분해 보고합니다.
