# 운영진 목록 화면은 클라이언트 TanStack Query로 조회한다

- 상태: proposed
- 기록일: 2026-11-05

## 맥락

백엔드가 GraphQL을 쓰기로 해 graphql-request + TanStack Query와 MSW 도입을 검토하고 있습니다. 서류 평가 목록은 Server Component에서 조회하는데, MSW 브라우저 worker는 서버 요청을 가로채지 못하고 httpOnly 쿠키도 서버에서 직접 넘겨야 합니다. 서류 평가 취합은 최종 결과를 고르면 탭 숫자와 하단 바를 응답 전에 다시 계산해야 합니다.

## 결정

모집 관리 목록 화면은 URL 조건을 `useSearchParams`로 읽고, 도메인 API 함수를 감싼 TanStack Query hook으로 클라이언트에서 조회합니다.

- 탭·필터·검색·페이지 조건은 URL에 두고 `window.history.replaceState`·`pushState`로 바꿉니다.
- 조건 변경 중에는 `keepPreviousData`로 이전 목록을 유지하고 300ms 뒤 스켈레톤을 보여 줍니다.
- 값을 바꾸는 동작은 `useMutation`의 optimistic update로 현재 목록에 먼저 반영하고, 끝나면 같은 모집의 목록을 다시 조회합니다.

## 근거

- MSW 브라우저 worker만으로 mock할 수 있고, 쿠키는 `credentials: 'include'`로 브라우저가 보냅니다.
- optimistic update와 캐시 무효화를 TanStack Query가 제공해 화면별 상태 관리를 따로 만들지 않습니다.
- 운영진 화면이라 첫 화면 SEO가 필요 없습니다.

## 고려한 대안

- 서버 prefetch 후 HydrationBoundary: 첫 화면은 빠르지만 `msw/node` 설정과 서버 쿠키 전달이 추가로 필요합니다.
- Server Component 조회 + Server Action: 프로젝트에 없던 패턴이고 MSW로 mock할 수 없습니다.

## 영향 범위

- `src/features/recruitment/hooks/`, `src/features/recruitment/components/documentResult/`
- `src/features/posting/hooks/useManagedPostings.ts`, `src/features/posting/components/postingManage/`: 공고 관리 목록은 클라이언트 조회와 삭제 낙관적 반영만 적용. 탭은 URL 대신 화면 상태, UP은 순위·잔여 횟수가 서버 값이라 응답 후 재조회
- 서류 평가 목록(`documentReview/`)은 아직 Server Component 조회이며, MSW 도입 시 이 기준으로 옮길지 팀 합의 필요
- 팀 합의 후 `docs/ARCHITECTURE.md`의 "서버 상태" 사용 기준 갱신

## 변경 기록

- 2026-11-05: 서류 평가 취합 화면을 구현하며 제안
- 2026-11-10: 대안에서 추가 비용으로 본 `msw/node` 설정은 [014](./014-msw-mocking.md)로 마침
- 2026-11-12: 공고 관리 목록을 클라이언트 조회로 전환하고 삭제만 낙관적 반영, 탭 URL 이전은 보류
- 2026-11-12: 맥락의 graphql-request 도입은 [015](./015-graphql-request.md)로 확정
