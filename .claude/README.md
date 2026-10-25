# Claude 작업 안내

작업 전에 AI 에이전트가 읽을 문서 구조와 로딩 기준입니다.

## 읽기 순서

1. `CLAUDE.md`에서 프로젝트 개요와 공통 지침을 읽습니다.
2. 이 안내 문서를 읽습니다.
3. 해당 작업의 기본 규칙을 읽습니다.
4. 작업 종류에 따라 추가 규칙과 reference를 필요한 만큼만 읽습니다.

단순 질문이나 작업 범위 밖의 설명은 `CLAUDE.md`와 이 문서만으로 답합니다. 관련 없는 규칙·reference를 한꺼번에 읽지 않습니다.

## 공통 최소 기준

| 파일                                   | 읽는 경우                            |
| -------------------------------------- | ------------------------------------ |
| `.claude/rules/project-constraints.md` | 구현·리뷰·설정 등 프로젝트 변경 전반 |

## 작업별 기본 규칙

| 작업                    | 기본으로 읽을 문서                                               |
| ----------------------- | ---------------------------------------------------------------- |
| 코드 구현·수정          | `.claude/rules/code-quality.md`, `.claude/rules/verification.md` |
| 동작 유지 리팩터링      | `.claude/rules/code-quality.md`, `.claude/rules/verification.md` |
| 코드 리뷰               | `.claude/rules/code-quality.md`, `.claude/rules/verification.md` |
| 설정·CI·자동화 변경     | `.claude/rules/workflow.md`, `.claude/rules/verification.md`     |
| 문서만 변경             | 변경 대상 문서와 연결된 규칙만 확인                              |
| 검증만 수행             | `.claude/rules/verification.md`                                  |
| Git 이슈·브랜치·PR·커밋 | 해당 Git 규칙 또는 호출한 skill이 지정한 문서만 확인             |

## 추가 로드: 작업 조건별

| 작업                                            | 추가로 로드할 문서                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| 파일 배치, Server/Client Component 판단, 라우팅 | `.claude/rules/next-architecture.md`, `docs/ARCHITECTURE.md`                  |
| 기능 범위, 사용자 흐름, 화면 문구               | `.claude/references/product-brief.md`                                         |
| Figma 기반 화면 구현, 반응형, 접근성            | `.claude/rules/ui-accessibility.md`, `.claude/references/design-source.md`    |
| Figma와 실제 화면의 시각 비교                   | `.claude/rules/visual-verification.md`, `.claude/references/design-source.md` |
| 애니메이션, 전환, 스크롤 모션                   | `.claude/rules/motion.md`                                                     |
| 이미지·폰트·Client Component 성능               | `.claude/rules/next-performance.md`, `.claude/rules/next-architecture.md`     |
| TypeScript, React, 네이밍, 스타일 판단          | `.claude/rules/code-style.md`                                                 |
| 재사용 UI 생성 또는 수정                        | `.claude/rules/component-guide.md`                                            |
| 백엔드 API 연동                                 | `.claude/rules/data-fetching.md`                                              |
| 이슈, 브랜치, PR, GitHub Actions                | `.claude/rules/git-workflow.md`, `docs/GIT_WORKFLOW.md`, 관련 `.github/`      |
| 커밋 문구 작성                                  | `.claude/rules/commit-convention.md`, `commitlint.config.mjs`                 |
| 테스트 추가·테스트 전략 판단                    | `.claude/rules/testing.md`, `docs/TESTING.md`                                 |
| 구조나 공통 규칙 변경                           | `.claude/decisions/README.md`, `.claude/known-issues/README.md`               |

Figma 디자인을 구현할 때는 `.mcp.json`의 Figma MCP로 디자인 정보를 가져오고 `/figma-screen` 절차를 따릅니다.

## Project Agents

일반 구현은 메인 세션이 담당하고, 아래 에이전트는 조사·검토·검증만 수행합니다. 선택, 입력, 종료 기준은 `.claude/agents/README.md`를 따릅니다.

| 역할          | 파일                                       | 용도                                    |
| ------------- | ------------------------------------------ | --------------------------------------- |
| 디버거        | `.claude/agents/debugger.md`               | 버그의 근본 원인 조사                   |
| 코드 리뷰어   | `.claude/agents/reviewer.md`               | Next.js·UI 변경 검토                    |
| 검증기        | `.claude/agents/verifier.md`               | 변경 범위에 맞는 검증 실행              |
| 라우트 리뷰어 | `.claude/agents/route-reviewer.md`         | App Router·route group·layout 경계 검토 |
| 접근성 리뷰어 | `.claude/agents/accessibility-reviewer.md` | 반응형·키보드·폼 접근성 검토            |
| 시각 검증기   | `.claude/agents/visual-verifier.md`        | Figma와 실제 렌더 결과의 독립 비교      |

## Skills

| Skill                | 용도                                     |
| -------------------- | ---------------------------------------- |
| `/commit`            | 한국어 Conventional Commit 제안          |
| `/pr`                | PR 템플릿에 맞춘 PR 제목·본문 초안       |
| `/review`            | 프로젝트 규칙 기준의 읽기 전용 코드 리뷰 |
| `/refactor`          | 동작 변경 없는 좁은 리팩터링             |
| `/performance-audit` | 이미지·Client bundle·렌더링 성능 점검    |
| `/figma-screen`      | Figma 디자인을 화면으로 구현             |

## Hooks

`.claude/settings.json`에 등록된 hook이 Claude Code 작업 중 자동으로 실행됩니다.

- `guard-rules.mjs`: 파일 편집·명령 실행 전에 `console.log`, 명시적 `any`, `npm`/`yarn`/`npx`, `tailwind.config` 생성, 문장형(`~한다`/`~된다`)으로 끝나는 주석을 차단합니다.
- `lint-check.mjs`: TS/TSX 파일 편집 후 그 파일 하나를 ESLint로 검사해 결과를 보여 줍니다. 편집을 차단하지 않으므로 완료 검증을 대신하지 않습니다.
- `skill-suggest.mjs`: 요청에 커밋, PR, 리뷰, 리팩터링, 성능, Figma 키워드가 있으면 맞는 skill을 안내합니다.

Git pre-commit hook(lint-staged)과 자동·수동 검증의 경계는 `.claude/rules/verification.md`를 따릅니다.

## 문서 유지 원칙

- `CLAUDE.md`는 공통 진입점, 이 문서는 로딩 경로, `rules/`는 반복 가능한 판단 기준, `references/`는 프로젝트 사실을 담당합니다.
- 코드나 설정이 바뀌어 문서의 경로·명령·자동화가 달라지면 같은 변경에서 문서도 갱신합니다.
- 결정 기록은 앞으로의 선택지를 제한하는 경우에만, 알려진 이슈는 코드만으로 닫을 수 없는 재현 가능한 문제에만 추가합니다.

## 금지 패턴

- 모든 reference 문서를 기본으로 읽지 않습니다.
- 기획에 없는 기능, 수치, 정책을 사실처럼 만들지 않습니다.
- App Router에 `pages/` 라우터 구조나 Vite 전용 설정을 추가하지 않습니다.
- 새 의존성은 명시 요청 또는 필요성과 대안을 기록한 결정 없이는 추가하지 않습니다.
