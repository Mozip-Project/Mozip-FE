# 백엔드 요청은 graphql-request 공용 클라이언트 하나로 보낸다

- 상태: accepted
- 기록일: 2026-11-12

## 맥락

2026-10-15 FE 회의에서 HTTP 클라이언트로 ky를 정했지만 설치 전이었습니다. 이후 백엔드가 GraphQL을 쓰기로 해, 팀이 ky 대신 graphql-request와 TanStack Query를 함께 쓰기로 결정했습니다. 백엔드 스키마와 문서는 아직 받지 않았습니다.

## 결정

- HTTP 클라이언트는 ky 대신 graphql-request를 사용합니다. 설치는 처음 실제 요청을 붙이는 작업에서 합니다.
- 공용 클라이언트는 `src/lib/`의 `GraphQLClient` 인스턴스 하나입니다. 엔드포인트 주소, 쿠키 전송(`credentials: 'include'`), GraphQL `errors` 응답의 공통 처리는 이 클라이언트에만 둡니다.
- query·mutation 문서는 도메인 API 함수(`src/features/<도메인>/api/`)에 둡니다. 컴포넌트는 API 함수를 감싼 TanStack Query hook만 호출합니다.
- 서버 데이터 캐시는 TanStack Query 하나로 관리합니다.

## 근거

- GraphQL 요청은 한 엔드포인트에 문서와 변수를 보내는 형태라, 이를 감싸고 `errors` 응답을 예외로 바꿔 주는 얇은 클라이언트면 충분합니다.
- 캐시를 TanStack Query에 두면 기존 화면의 조회·낙관적 업데이트·무효화 방식을 그대로 씁니다.

## 고려한 대안

- ky로 직접 POST: 문서·변수 전송과 `errors` 처리를 직접 구현해야 합니다.
- Apollo Client·urql: 자체 정규화 캐시가 TanStack Query와 겹치고 번들이 커집니다.

## 영향 범위

- `docs/ARCHITECTURE.md`의 "라이브러리", `.claude/rules/data-fetching.md`, `CLAUDE.md`의 기술 스택
- 아직 정하지 않은 것: 엔드포인트 환경 변수 이름(인증 방식과 함께), 스키마 타입 생성(codegen) 여부, MSW GraphQL handler 작성 시점
- 지금의 도메인 API 함수는 샘플 데이터를 돌려주는 임시 구현이며, 스키마를 받은 뒤 함수 안쪽만 교체합니다.

## 변경 기록

- 2026-11-12: ky를 대체하는 결정으로 기록, 설치 전
