# AI·자동화 PR 기준

AI 지침, agent, skill, hook, GitHub Actions, 생성 스크립트처럼 반복 작업의 실행 방식을 바꾸는 변경에만 적용합니다.

`📝 작업 내용`에는 다음 관점 중 실제로 바뀐 항목만 적습니다.

- 진입점: Claude가 처음 읽는 파일과 작업 라우팅 방식
- 로딩 기준: 항상 읽는 문서와 작업별 rule·reference의 선택 기준
- 실행 표면: skill, hook, script, workflow가 자동화하는 작업과 실행 조건
- 생성물 관리: 직접 수정하면 안 되는 파일과 생성 또는 검사 명령
- 리뷰 영향: reviewer가 실제로 확인할 자동화 결과, 권한, 트리거, 검증 범위

## 작성 예시

```markdown
### 주요 변경사항

- AI 작업 지침과 실행 표면 정비
- GitHub 협업 자동화와 CI 검증 흐름 구성
- 생성 파일 관리와 개발 검증 설정 추가

### 세부 작업

- AI 작업 흐름 정리: `CLAUDE.md`, `.claude/README.md`의 진입점과 rule·reference 로딩 기준 구성
- 실행 표면 구성: skill과 hook의 적용 범위 명시
- 자동화 검토 기준 정리: workflow 트리거·권한·PR 댓글 결과와 reviewer 확인 항목 명시
- 검증: `pnpm format:check`, `pnpm type-check`, `pnpm lint` 실행 결과 기록
```

예시는 실제 변경과 검증 결과에 맞게 줄이거나 바꿉니다. 실행하지 않은 명령이나 존재하지 않는 자동화는 작성하지 않습니다.
