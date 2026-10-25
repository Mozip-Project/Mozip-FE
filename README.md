# MOZIP. Frontend

지원부터 선발까지, 흩어진 모집 과정을 하나로.
동아리·학회·학생회의 공고 탐색부터 지원, 서류·면접 평가, 최종 선발까지 연결하는 통합 모집 플랫폼의 프론트엔드 저장소입니다.

## 시작하기

필요한 환경은 Node.js 24(`.nvmrc`)와 pnpm입니다. pnpm 버전은 `package.json`의 `packageManager`를 따릅니다.

```bash
nvm use
corepack enable
pnpm install
pnpm dev
```

`pnpm install` 시 husky가 설치되어 커밋할 때 lint-staged와 commitlint가 자동으로 실행됩니다.

## 명령어

| 명령                                | 설명                            |
| ----------------------------------- | ------------------------------- |
| `pnpm dev`                          | 개발 서버 실행                  |
| `pnpm build`                        | 프로덕션 빌드                   |
| `pnpm lint` / `pnpm lint:fix`       | ESLint 검사 / 자동 수정         |
| `pnpm format` / `pnpm format:check` | Prettier 정리 / 검사            |
| `pnpm type-check`                   | Next typegen 후 TypeScript 검사 |
| `pnpm test` / `pnpm test:run`       | Vitest 감시 모드 / 단발 실행    |

## 기술 스택

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Vitest + React Testing Library

## 문서

| 문서                                         | 내용                                       |
| -------------------------------------------- | ------------------------------------------ |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 폴더 구조, 라이브러리, 인증 등 구조 기준   |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | 이슈 → 브랜치 → 커밋 → PR 흐름과 자동 검사 |
| [docs/TESTING.md](docs/TESTING.md)           | 테스트 작성 방법                           |
| [.claude/README.md](.claude/README.md)       | AI 작업 지침과 규칙 문서 진입점            |
