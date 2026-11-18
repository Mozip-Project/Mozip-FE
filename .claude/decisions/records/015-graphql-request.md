# 백엔드 요청은 graphql-request 공용 클라이언트 하나로 보낸다

- 상태: accepted
- 기록일: 2026-11-12

## 맥락

2026-10-15 FE 회의에서 HTTP 클라이언트로 ky를 정했지만 설치 전이었습니다. 이후 백엔드가 GraphQL을 쓰기로 해, 팀이 ky 대신 graphql-request와 TanStack Query를 함께 쓰기로 결정했습니다. 백엔드 스키마와 문서는 아직 받지 않았습니다.

## 결정

- HTTP 클라이언트는 ky 대신 graphql-request를 사용합니다. 설치는 처음 실제 요청을 붙이는 작업에서 합니다.
- 공용 클라이언트는 `src/lib/`의 `GraphQLClient` 인스턴스 하나입니다. 엔드포인트 주소, 쿠키 전송(`credentials: 'include'`), GraphQL `errors` 응답의 공통 처리는 이 클라이언트에만 둡니다.
- query·mutation 문서는 도메인 API 함수(`src/features/<도메인>/api/`)에 둡니다. 공개 조회는 Server Component에서 도메인 API 함수를 직접 호출하고, Client Component는 API 함수를 감싼 TanStack Query hook을 사용합니다.
- 서버 데이터 캐시는 TanStack Query 하나로 관리합니다.
- 결과·변수 타입은 GraphQL Code Generator(`client` preset, `documentMode: 'string'`)로 만듭니다. 운영 서버는 introspection이 꺼져 있어, 서버 스키마가 완성되면 개발 서버에서 introspection으로 받아 저장소의 `schema.graphql`에 저장하고 codegen은 이 파일을 읽습니다. 생성 결과(`src/gql/`)는 커밋합니다.
- 엔드포인트 환경 변수는 `NEXT_PUBLIC_GRAPHQL_ENDPOINT`(절대 주소)입니다.
- 토큰 만료(`AUTH_002`) 시 재발급(`POST /auth/reissue`)과 재요청은 공용 클라이언트가 브라우저에서만 처리하고, 동시에 만료된 요청은 재발급 한 번을 함께 기다립니다.

## 근거

- GraphQL 요청은 한 엔드포인트에 문서와 변수를 보내는 형태라, 이를 감싸고 `errors` 응답을 예외로 바꿔 주는 얇은 클라이언트면 충분합니다.
- 캐시를 TanStack Query에 두면 기존 화면의 조회·낙관적 업데이트·무효화 방식을 그대로 씁니다.

## 고려한 대안

- ky로 직접 POST: 문서·변수 전송과 `errors` 처리를 직접 구현해야 합니다.
- Apollo Client·urql: 자체 정규화 캐시가 TanStack Query와 겹치고 번들이 커집니다.

## 영향 범위

- `docs/ARCHITECTURE.md`의 "라이브러리", `.claude/rules/data-fetching.md`, `CLAUDE.md`의 기술 스택
- `schema.graphql`은 2026-11-16 명세에서 옮긴 임시본입니다. 서버에 아직 구현되지 않은 필드도 화면에 필요하면 넣고, 그 응답은 MSW handler로 대신합니다. 명세 초안 SDL은 정의 없이 참조만 하는 타입이 많아 통째로 합치지 않고, 쓰는 쿼리에 필요한 타입만 정의를 확인해 옮깁니다. 서버 스키마가 완성되면 백엔드 요청대로 introspection으로 받아 교체합니다.
- 재발급이 `AUTH_004`·`AUTH_005`로 실패하면 로그인 화면으로 보내야 하지만, 로그인 페이지가 없어 지금은 `ApiError`만 던집니다.
- 지금의 도메인 API 함수는 샘플 데이터를 돌려주는 임시 구현이며, 스키마를 받은 뒤 함수 안쪽만 교체합니다.

## 변경 기록

- 2026-11-12: ky를 대체하는 결정으로 기록, 설치 전
- 2026-11-16: graphql-request 설치, codegen 도입, 환경 변수 이름과 토큰 재발급 처리 위치 결정
- 2026-11-17: query·mutation 문서를 `graphql()` 대신 `api/query.graphql`에 작성하고, codegen이 만든 `<operation 이름>Document` 상수로 요청. GraphQL 문법 강조·자동완성을 쓰고 API 함수 파일을 함수만으로 유지하기 위해 변경([011](./011-features-domain-folder.md))
