---
name: review
description: 이 프로젝트의 변경을 프로젝트 규칙과 근거에 따라 읽기 전용으로 검토합니다.
user-invocable: true
argument-hint: '[file-or-ref]'
---

# review

코드를 수정하지 않고, 변경 diff에 의해 생긴 실제 위험만 보고합니다. 디자인 개선 아이디어나 요청 범위 밖의 리팩터링은 결함으로 보고하지 않습니다.

1. `git status --short`, `git diff`, `git diff --staged`로 범위와 기존 사용자 변경을 확인합니다.
2. `.claude/rules/code-quality.md`, `.claude/rules/verification.md`와 변경 파일에 해당하는 추가 규칙만 읽습니다. 코드가 아닌 문서·설정 변경에는 해당 작업의 기본 규칙만 읽습니다.
3. 사용자 흐름·런타임 오류, App Router 경계, 반응형·접근성, 요구사항 의도, 콘텐츠 근거, 성능, 검증 공백 순으로 검토합니다.
4. 각 발견 사항을 `Critical`, `Major`, `Minor`, `Suggestion` 순으로 `파일:줄`, 문제, 영향, 최소 수정 방향으로 작성합니다.

파일 밖의 정보나 실제 화면 검증이 필요해 확정할 수 없는 내용은 검증 공백으로 구분합니다. 발견 사항이 없으면 확인 범위와 남은 검증 공백만 보고합니다.
