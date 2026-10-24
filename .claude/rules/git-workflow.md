# Git 작업 흐름

사람이 읽는 전체 흐름은 `docs/GIT_WORKFLOW.md`를 따릅니다.

- 작업 이슈는 `.github/ISSUE_TEMPLATE/task.yml`을 사용합니다. 생성되는 브랜치 형식은 `<type>/<issue-number>-<english-slug>`이며 기준 브랜치는 `main`입니다.
- 허용 브랜치 type과 제목·라벨 매핑은 `.github/workflows/issue-branch.yml`과 `pr-metadata.yml`이 단일 기준입니다. 문서에 목록을 복제해 따로 관리하지 않습니다.
- develop 브랜치 없이 모든 작업 PR은 `main`을 대상으로 합니다. `main`은 항상 배포 가능한 상태로 유지하고, PR 필수·CI 통과·리뷰 승인은 GitHub Ruleset으로 강제합니다.
- workflow나 이슈 폼을 수정할 때는 이슈 폼 heading, 브랜치 정규식, type·라벨 매핑, 대상 브랜치, 권한을 한 묶음으로 검토합니다.
- PR 본문에는 무엇을 왜 바꿨는지, 실제 실행한 검증, UI 변경 시 스크린샷을 남깁니다.
- AI 코드 리뷰는 CodeRabbit을 사용합니다. 기본 리뷰어(`CODEOWNERS`, `defaultReviewers`)는 회의 안건이므로 결정 전에는 추가하지 않습니다.
- 커밋·푸시·PR 생성은 사용자가 명시적으로 요청한 경우에만 실행합니다.
- 커밋 메시지와 PR 본문에 AI 출처 문구를 넣지 않습니다.
