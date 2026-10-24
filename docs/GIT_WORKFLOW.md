# Git과 PR 흐름

> develop 브랜치 없이 `main` 하나로 운영합니다(2026-10-15 FE 회의). 남은 리뷰·배포 규칙은 아래 "회의 안건"을 확인하세요.

## 한눈에 보기

```text
작업 이슈 생성 → 브랜치 자동 생성 → 구현·커밋 → main으로 PR → CI 통과·리뷰 → 병합
```

## 1. 이슈 만들기

GitHub의 **Issues → New issue → 📝 작업 이슈**에서 작업 타입과 영문 브랜치 이름을 입력합니다. 이슈가 생성되면 `issue-branch.yml`이 자동으로 다음 작업을 합니다.

- `main`을 기준으로 `타입/이슈번호-브랜치이름` 브랜치 생성 (예: `feat/12-recruit-list`)
- 이슈 제목을 `[Feat] ...` 형식으로 정리하고 라벨과 담당자 지정
- 이슈 댓글로 `git switch` 명령 안내

| 타입       | 제목         | 라벨          |
| ---------- | ------------ | ------------- |
| `feat`     | `[Feat]`     | `✨ Feature`  |
| `fix`      | `[Fix]`      | `🐛 BugFix`   |
| `hotfix`   | `[Hotfix]`   | `🚨 Hotfix`   |
| `refactor` | `[Refactor]` | `♻️ Refactor` |
| `test`     | `[Test]`     | `✅ Test`     |
| `docs`     | `[Docs]`     | `📝 Docs`     |
| `chore`    | `[Chore]`    | `🔧 Chore`    |

브랜치 타입은 커밋 타입(`commitlint.config.mjs`)과 별개입니다. `feat/` 브랜치 안에서 `docs:` 커밋을 해도 됩니다.

## 2. 커밋

`<type>: <한국어 명사형 제목>` 형식입니다. 커밋할 때 husky가 lint-staged(ESLint·Prettier)와 commitlint를 자동 실행합니다. 자세한 규칙은 `.claude/rules/commit-convention.md`를 참고합니다.

## 3. PR

- 대상 브랜치는 `main`입니다. `main`은 항상 배포 가능한 상태로 유지합니다.
- 이슈 브랜치에서 PR을 만들면 `pr-metadata.yml`이 제목, 라벨, 담당자를 이슈에 맞춰 정리합니다.
- 본문에 `close #이슈번호`를 적으면 병합할 때 이슈가 자동으로 닫힙니다.

## 4. 자동 검사

| workflow       | 언제          | 하는 일                                                              |
| -------------- | ------------- | -------------------------------------------------------------------- |
| `ci.yml`       | main push, PR | 타입 검사 → ESLint → 테스트 → Prettier → 빌드. 결과를 PR 댓글로 남김 |
| `security.yml` | main push, PR | Git 기록 전체에서 API 키 같은 비밀값 유출 검사 (gitleaks)            |

### CodeRabbit 리뷰

CodeRabbit GitHub App이 설치되어 있으면 `.coderabbit.yaml` 설정에 따라 `main` 대상 PR을 자동 리뷰합니다. draft PR은 제외되며, Ready for review로 바꾸면 리뷰가 시작됩니다. 리뷰는 한국어로 남고 `.claude/rules`, `.claude/references`, `docs`의 문서를 프로젝트 규칙으로 참고합니다. 비밀값 검사는 `security.yml`이 맡으므로 CodeRabbit의 gitleaks는 꺼 두었습니다.

workflow가 실패해도 GitHub는 기본적으로 병합을 막지 않습니다. 실제로 막으려면 저장소 **Settings → Rules(또는 Branches)**에서 위 검사를 required status check로 지정해야 합니다.

## 저장소 만들 때 할 일

- [ ] GitHub 저장소 생성 후 push
- [ ] Settings → Actions → General → Workflow permissions를 **Read and write**로 변경. 브랜치 생성과 라벨 추가에 필요합니다.
- [ ] Settings → Rules에서 `main`에 PR 필수, CI 통과, 리뷰 승인 조건 설정. develop 출발 검사가 없으므로 `main` 보호는 이 설정이 유일한 강제 수단입니다.
- [ ] CodeRabbit GitHub App 설치. 저장소가 private이면 요금제 확인

## 회의 안건

- **리뷰 규칙**: 승인 몇 명이 필요한지, 기본 리뷰어 지정(`CODEOWNERS`, `pr-metadata.yml`의 `defaultReviewers`)
- **배포**: Vercel 등 어디에 배포할지, `main` 병합 시 자동 배포할지
