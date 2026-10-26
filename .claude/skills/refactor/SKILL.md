---
name: refactor
description: 이 프로젝트에서 동작을 바꾸지 않는 좁은 리팩터링을 분석하고 적용합니다.
user-invocable: true
argument-hint: '[file-or-scope]'
---

# refactor

대상 코드에 따라 필요한 규칙만 읽습니다. 기본으로 `.claude/rules/code-quality.md`, `.claude/rules/verification.md`를 읽고, App Router 경계를 건드릴 때만 `next-architecture.md`, UI 구조를 바꿀 때만 `component-guide.md`를 추가로 읽습니다.

1. 대상 코드와 위 지침을 읽고, 현재 동작과 유지할 화면·상호작용을 짧게 적습니다.
2. 중복, 책임 혼합, 과도한 추상화, 불필요한 단언, dead code를 분류하고 이번 작업에서 다룰 냄새를 하나의 좁은 범위로 정합니다.
3. 동작·디자인·콘텐츠 의미를 바꾸지 않는 명확한 개선만 적용합니다. 결과가 달라질 가능성이 있으면 후보만 보고합니다.
4. 삭제와 기존 구조 재사용을 새 추상화보다 우선합니다. 한 번만 쓰는 helper·wrapper·Provider를 만들지 않습니다.
5. 변경 후 관련 lint·typecheck를 실행하고, 유지한 동작, 실행하지 못한 회귀 확인, 남은 위험을 보고합니다.
