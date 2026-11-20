# 운영진 모집 화면은 공고 ID 하나로 구분한다

- 상태: accepted
- 기록일: 2026-11-20

## 맥락

운영진 화면은 `/manage/recruitments/[recruitmentId]/...` 아래에 공고 관리(`postings/[postingId]`)와 서류·면접 평가를 두었습니다. 백엔드 명세는 별도의 모집 단위 없이 공고(`Posting`)에 지원자 수·평가 진행률을 두고, 평가 API도 공고 ID로 조회합니다. 공고 관리 목록은 `organizationPostings(organizationId)`로 단체 전체 공고를 받아 URL의 모집 ID를 쓰지 않았습니다.

## 결정

- 운영진 모집 화면은 `/manage/postings` 아래에 두고, 공고 하나를 다루는 화면은 `/manage/postings/[postingId]/...`로 구분합니다. `recruitmentId`는 쓰지 않습니다.
- 공고 목록(운영진 홈 `/manage`)과 공고 작성(`/manage/postings/new`)은 공고 ID 없이 헤더에서 고른 단체 기준으로 동작합니다. 단체 ID는 URL에 넣지 않고 쿠키에 저장합니다.
- LNB의 공고 관리는 공고 상세(`/manage/postings/[postingId]`)입니다. 공고 ID 없는 `/manage/postings`는 서버 정렬 순서의 첫 진행 중 공고 상세로, 진행 중 공고가 없으면 운영진 홈으로 이동합니다. 마지막으로 본 공고는 기억하지 않습니다.
- 목록·작성·공고별 화면은 `postings/layout.tsx`의 같은 LNB를 씁니다. 공고 ID가 없는 화면에서는 공고 선택 전 상태로 표시하고 공고별 메뉴를 비활성화합니다.
- `features/recruitment/`는 지원 이후 과정(평가·면접·선발)의 도메인 폴더로 유지하고, 식별자만 `postingId`를 받습니다.

## 근거

- 서버가 공고 하나를 모집 하나로 다뤄, ID를 둘 두면 같은 대상을 두 이름으로 부르게 됩니다.
- 단체 전체 목록이 특정 모집 ID 아래에 있으면 URL과 조회 기준이 어긋납니다.

## 고려한 대안

- 모집 ID 유지: 백엔드에 대응하는 식별자가 없습니다.
- 단체 ID를 URL에 포함(`/manage/[organizationId]/...`): 팀 논의에서 헤더 선택과 쿠키 저장으로 정했습니다.
- 마지막으로 본 공고를 LNB 기준으로 사용: 단체 전환과 함께 맞춰야 할 상태가 늘어납니다.

## 영향 범위

- `src/app/manage/postings/`, `src/features/recruitment/utils/recruitmentRoutes.ts`, LNB(`recruitmentNav/`)
- 공고 선택 전 LNB의 문구·비활성 표시는 디자인 확정 후 교체합니다.
- 단체 쿠키 저장과 `organizationPostings` 연결은 별도 작업입니다. 쿠키를 누가 만들고 무엇을 담는지는 [018](./018-organization-cookie.md)을 따릅니다.
