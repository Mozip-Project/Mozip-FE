# API 목킹은 MSW 하나의 handler 목록을 서버·브라우저·테스트가 함께 쓴다

- 상태: accepted
- 기록일: 2026-11-10

## 맥락

백엔드 API가 준비되기 전에 화면 조회·저장을 붙여야 하고, 팀이 2026-11-05에 MSW 도입을 결정했습니다. 요청은 브라우저(TanStack Query)와 Next 서버(Server Component 조회·서버 prefetch) 양쪽에서 나가고, Vitest도 Node에서 실행됩니다.

## 결정

handler 목록 하나를 실행 환경별 설정 세 곳이 함께 씁니다.

- handler와 샘플 데이터는 `src/features/<도메인>/mocks/`에 두고, `src/mocks/handler.ts`는 도메인 handler를 모아 배열로 합치기만 합니다.
- 브라우저: `src/mocks/browser.ts`(`setupWorker`)를 `src/providers/mockProvider.tsx`가 시작합니다. worker가 준비될 때까지 `Suspense` + `use()`로 자식 렌더링을 기다리고, 그동안 서버 HTML을 유지합니다.
- Next 서버: `src/mocks/server.ts`(`setupServer`)를 `src/instrumentation.ts`의 `register()`에서 Node 런타임일 때만 시작합니다.
- 테스트: API 연동 테스트가 생기면 같은 `server.ts`를 `src/test/setup.ts`에 연결합니다.
- 켜기 조건은 `NODE_ENV === 'development'`이면서 `NEXT_PUBLIC_API_MOCKING === 'enabled'`일 때입니다. 서버와 브라우저가 같은 변수 하나를 읽습니다.
- `public/mockServiceWorker.js`는 커밋하고 Prettier·ESLint 대상에서 제외합니다. msw 버전을 올리면 `pnpm exec msw init`으로 다시 생성합니다.

## 근거

- handler를 한 곳에서 관리해 서버·브라우저·테스트가 같은 응답을 받습니다.
- `instrumentation-client.ts`는 `worker.start()`를 기다리지 않고 hydration이 진행되어 첫 요청이 실제 네트워크로 나갈 수 있습니다.
- `useEffect`로 시작하는 방식은 서버 HTML이 비어 모킹 중에 SSR 결과를 확인할 수 없습니다.
- msw 3.0.4에는 postinstall이 없어 worker 파일을 gitignore하면 팀원마다 직접 생성해야 합니다.

## 고려한 대안

- 브라우저 worker만 사용: Next 서버에서 나가는 요청을 mock할 수 없습니다.
- 서버용·브라우저용 handler를 따로 관리: 같은 응답을 두 곳에서 맞춰야 합니다.
- mock 데이터를 `src/mocks/`에 모두 두기: 도메인 코드와 샘플 데이터가 멀어지고, `features/` 구조와 어긋납니다.

## 영향 범위

- `src/mocks/`, `src/features/*/mocks/`, `src/instrumentation.ts`, `src/providers/mockProvider.tsx`, `src/app/layout.tsx`
- `.env.example`, `.prettierignore`, `eslint.config.mjs`, `.lintstagedrc.json`
- `msw/browser`는 Node 조건에서 막혀 있어, Client Component에서도 `typeof window` 분기 안에서만 import합니다. msw v3의 미처리 요청 옵션 이름은 `onUnhandledFrame`입니다.

## 변경 기록

- 2026-11-10: MSW 서버·브라우저 설정을 마치며 기록
