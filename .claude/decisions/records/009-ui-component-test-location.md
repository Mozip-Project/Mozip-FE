# 공용 UI 컴포넌트 테스트는 ui/__tests__에 둔다

- 상태: accepted
- 기록일: 2026-10-28

## 맥락

`docs/ARCHITECTURE.md`는 `src/components/ui/`의 컴포넌트 폴더에 컴포넌트와 스토리만 두도록 정했고, `.claude/rules/testing.md`는 테스트를 대상 파일 가까이 두도록 정해 공용 컴포넌트 테스트 위치가 서로 충돌했습니다.

## 결정

공용 UI 컴포넌트 테스트는 `src/components/ui/__tests__/<컴포넌트 파일명>.test.tsx`에 둡니다. 컴포넌트는 `@/components/ui/<Folder>/<file>`로 import합니다.

## 근거

- 컴포넌트 폴더에는 컴포넌트와 스토리만 둔다는 구조 기준을 유지합니다.
- 테스트를 `ui/` 바로 아래에 모아 대상 컴포넌트와 가까운 위치를 유지합니다.

## 고려한 대안

- 컴포넌트 폴더에 테스트도 허용: 테스트 규칙과 가장 잘 맞지만 기존 구조 기준을 바꿔야 합니다.

## 영향 범위

- `src/components/ui/` 공용 컴포넌트 테스트
- `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `.claude/rules/next-architecture.md`, `.claude/rules/testing.md`, `.claude/rules/component-guide.md`

## 변경 기록

- 2026-10-28: CodeRabbit 리뷰로 드러난 문서 간 충돌을 정리하며 최초 기록
