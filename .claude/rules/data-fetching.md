# 데이터 패칭 규칙

실제 백엔드를 호출하는 화면에 적용합니다. 라이브러리와 인증 토큰 방식은 `docs/ARCHITECTURE.md`의 "라이브러리"·"인증 토큰" 기준을 따릅니다.

## 기준

- API 호출은 공용 API 클라이언트 한 곳을 거칩니다. 엔드포인트 주소, 쿠키 전송, GraphQL `errors` 응답의 공통 에러 처리는 이 클라이언트에만 둡니다.
- 컴포넌트는 query·mutation 문서를 직접 알지 않습니다. 문서는 도메인별 API 함수(예: 공고 목록 조회)에 둡니다. 공개 조회는 Server Component에서 이 함수를 직접 호출하고, Client Component는 이 함수를 감싼 TanStack Query hook을 사용합니다.
- query·mutation 이름과 필드를 추측해 만들지 않습니다. 백엔드 GraphQL 스키마·문서로 확인합니다.
- 요청하는 필드와 응답 타입은 화면이 실제로 쓰는 만큼만 명시합니다. 스키마에 없는 필드·enum을 UI 편의로 만들지 않습니다.
- 서버 필드명과 화면에서 쓰는 이름이 다르면 raw 타입으로 받은 뒤 명시적으로 매핑합니다. 다른 모양의 응답을 `as`로 단언하지 않습니다.
- 지원 상태처럼 서버가 정의하는 enum은 스키마의 값을 그대로 따르고, 상태별 처리는 `switch`로 빠짐없이 다룹니다.

## 환경 변수

- 백엔드 주소는 환경 변수로만 읽고 코드·문서에 실제 값을 적지 않습니다. `.env.example`에는 변수명만 남깁니다.
- 브라우저에서 직접 읽어야 하는 값만 `NEXT_PUBLIC_` 접두사를 붙입니다. 비밀 키(AI API 키 등)는 절대 `NEXT_PUBLIC_`으로 노출하지 않습니다.
- 변수 이름은 인증 방식 결정과 함께 정합니다.
- MSW 켜기는 `NEXT_PUBLIC_API_MOCKING` 하나로 서버·브라우저가 함께 읽습니다. 서버 전용 변수를 따로 만들지 않습니다.

## 사용 방식

- 공용 API 클라이언트는 graphql-request의 `GraphQLClient` 인스턴스 하나로 만듭니다(결정 기록 015). 도메인 API 함수는 클라이언트를 새로 만들지 않고 이 인스턴스로 요청합니다.
- 브라우저에서 서버 데이터를 읽고 쓰는 화면은 TanStack Query를 사용합니다. 컴포넌트는 도메인 API 함수를 감싼 query·mutation을 사용합니다.
- 인증 토큰은 백엔드가 httpOnly 쿠키로 발급합니다. 토큰을 JS에서 읽거나 `localStorage`·state에 저장하지 않습니다.
- 다른 사용자의 변경을 반영해야 하는 화면은 폴링(`refetchInterval`)으로 갱신하고, 화면이 보이지 않을 때는 멈춥니다. WebSocket·SSE 전환은 백엔드와 결정합니다.
- 서버 데이터를 전역 상태 라이브러리에 복제하지 않습니다. 전역 상태 라이브러리는 도입하지 않았습니다.

## MSW

구성과 이유는 `docs/ARCHITECTURE.md`의 "API 목킹"과 `.claude/decisions/records/014-msw-mocking.md`를 따릅니다.

- handler와 샘플 데이터는 `src/features/<도메인>/mocks/`에 두고 `src/mocks/handler.ts`의 배열에 추가합니다. 서버용·브라우저용 handler를 따로 만들지 않습니다.
- `msw/node`는 `src/mocks/server.ts`에서만, `msw/browser`는 `src/mocks/browser.ts`에서만 import합니다. `server.ts`는 `src/instrumentation.ts`와 테스트 setup에서만, `browser.ts`는 `MockProvider`의 `typeof window` 분기 안에서만 불러옵니다. 반대쪽 번들에 섞이면 빌드가 깨집니다.
- msw v3의 미처리 요청 옵션은 `onUnhandledFrame`입니다. v2 예제의 `onUnhandledRequest`를 쓰지 않습니다.
- GraphQL 요청은 `graphql.query`·`graphql.mutation` handler로 작성합니다. 응답 모양은 백엔드 스키마를 따르고, 스키마에 없는 필드를 만들지 않습니다.

## 로딩·에러·빈 상태

- 서버 데이터를 쓰는 화면은 로딩, 에러, 빈 결과 상태를 함께 다룹니다. Figma에 해당 상태가 없으면 확인할 항목으로 보고합니다.
- 실패한 요청을 조용히 무시하지 않습니다. 사용자에게 보이는 안내와 `console.error` 중 무엇이 필요한지 판단합니다.
