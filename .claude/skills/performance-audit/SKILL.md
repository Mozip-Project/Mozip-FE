---
name: performance-audit
description: 이미지, 폰트, Client Component, 스크롤 성능 위험을 읽기 전용으로 점검합니다.
user-invocable: true
argument-hint: [file-or-directory]
---

# performance-audit

코드를 수정하지 않고, 실제 사용자 체감이나 초기 로딩에 영향을 줄 근거가 있는 항목만 보고합니다.

1. `.claude/rules/next-performance.md`와 대상 파일을 읽습니다.
2. 변경 범위와 직접 연결된 항목을 아래 순서로 확인합니다.
   - 상위 화면을 불필요하게 Client Component로 만들었거나, client bundle에 큰 모듈을 끌어온 경우
   - LCP 후보 이미지의 `priority`, `sizes`, 크기·비율 또는 화면 밖 자산의 지연 로딩이 잘못된 경우
   - 외부 폰트·초기 화면과 무관한 스크립트가 렌더링을 막는 경우
   - 스크롤·pointer listener 중복, cleanup 누락, 매 프레임 layout 측정 또는 큰 DOM 갱신이 있는 경우
3. 각 항목은 `파일:줄`, 문제, 사용자 영향, 최소 수정 방향으로 작성합니다. 확실한 위험이 아니면 제안으로 낮추거나 보고하지 않습니다.
4. 실제 측정값이 없으면 수치나 개선 폭을 추정하지 않습니다. `useMemo`, dynamic import, memoization은 문제의 원인이 확인된 경우에만 권장합니다.

이미지·폰트·스크립트의 실제 전송량이나 Core Web Vitals는 코드만으로 확정하지 않습니다. 발견 사항이 없으면 확인 범위와 실제 브라우저·Lighthouse 측정처럼 수행하지 못한 검증만 보고합니다.
