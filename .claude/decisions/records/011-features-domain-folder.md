# 도메인 코드는 src/features에 도메인별로 둔다

- 상태: accepted
- 기록일: 2026-10-31

## 맥락

공고, 지원서, 면접 같은 도메인 코드의 위치가 정해져 있지 않아 LNB처럼 도메인을 아는 컴포넌트가 `components/ui/`와 `app/` 아래에 놓여 있었습니다.

## 결정

도메인 코드는 `src/features/<도메인>/`에 둡니다. 안에는 `api/`, `components/`, `hooks/`, `types.ts`를 필요한 만큼 만들고, 지원자·운영진 구분은 `api/`와 `components/` 안에서만 합니다.

- `api/`: 공통 API는 `<도메인>.ts`, 전용 API는 `applicant.ts`·`organizer.ts`
- `components/`: 양쪽이 쓰는 컴포넌트는 바로 아래, 전용 컴포넌트는 `applicant/`·`organizer/`
- 한쪽 역할의 코드만 있는 동안은 역할 폴더 없이 `components/` 바로 아래에 두고, 다른 역할의 코드가 생길 때 나눕니다.
- 도메인을 아는 컴포넌트는 한 화면에서만 쓰더라도 `features/`에 두고, route 옆 `_components/`는 쓰지 않습니다.

## 근거

- 지원자와 운영진이 공고·지원서·면접 데이터를 함께 쓰므로 역할보다 도메인으로 묶는 편이 같이 바뀌는 코드를 가깝게 둘 수 있습니다.
- 타입과 hook은 대부분 양쪽이 같이 쓰고, 실제로 갈리는 부분은 API와 컴포넌트입니다.

## 고려한 대안

- 역할을 맨 위에 두는 구조(`features/<도메인>/{shared,applicant,organizer}`): `shared/`에 코드가 몰리고 폴더가 세 배로 늘어납니다.
- 화면 단위 폴더: 지원자와 운영진이 같은 코드를 쓸 때 둘 곳이 애매합니다.

## 영향 범위

- `src/features/` 아래 모든 도메인 코드
- `docs/ARCHITECTURE.md`, `.claude/rules/next-architecture.md`, `.claude/rules/project-constraints.md`, `CLAUDE.md`

## 변경 기록

- 2026-10-31: 모집 관리 LNB를 옮기며 최초 기록
