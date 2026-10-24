# develop 없이 main 단일 브랜치로 운영

- 상태: accepted
- 기록일: 2026-10-15

## 맥락

FE 2명이 약 7주(11월 말~12월 초 마감) 안에 MVP를 만듭니다. 초기 설정은 develop → main 2단계였습니다.

## 결정

모든 작업 브랜치는 `main`에서 만들고 `main`으로 PR을 보내 병합합니다.

## 근거

- 2인·단기 프로젝트에서 develop을 따로 유지하는 비용 대비 얻는 안정성이 작습니다.
- 병합 단계를 줄여 통합 문제를 빨리 발견합니다.

## 고려한 대안

- develop → main 2단계: 배포 시점 통제가 쉽지만 브랜치 동기화와 PR이 두 배가 됩니다.

## 영향 범위

- `.github/workflows/`의 `issue-branch.yml`, `ci.yml`, `security.yml`, `branch-protection.yml`(삭제)
- `docs/GIT_WORKFLOW.md`, `.claude/rules/git-workflow.md`, PR 템플릿, `/pr` 스킬

## 검증 또는 재검토 조건

- `main` 보호는 GitHub Ruleset(PR 필수, CI 통과, 리뷰 승인)으로만 강제됩니다. 저장소 생성 시 설정 여부를 확인합니다.
- 배포 안정 버전이 필요해지면 태그 또는 릴리스 브랜치를 검토합니다.

## 변경 기록

- 2026-10-15: FE 1차 회의 결정으로 최초 기록
