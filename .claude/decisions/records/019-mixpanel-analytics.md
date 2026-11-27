# 사용 분석은 Mixpanel로 한다

- 상태: accepted
- 기록일: 2026-11-28

## 맥락

기획이 시연(운영진 공고 작성 → 서류 평가 → 면접 타임테이블)에서 단계별 탐색 시간, 오클릭률, 첫 클릭 성공률, 시나리오 완료율과 이탈 지점을 보려고 합니다. 기획이 Mixpanel 프로젝트를 만들어 토큰을 받았습니다. 로그인 연결 전이고, 한 노트북을 여러 사람이 씁니다.

## 결정

- `mixpanel-browser`를 쓰고, 호출은 `src/lib/analytics.ts`(초기화·`track`·`resetVisitor`)로만 합니다. 토큰(`NEXT_PUBLIC_MIXPANEL_TOKEN`)이 없으면 아무것도 보내지 않습니다.
- 시연 측정은 root layout의 `ScenarioTracker` 하나가 맡습니다. 단계 진입(`scenario_step_viewed`), 정답 클릭(`scenario_action`, 직전 정답 이후 시간·오클릭 수·첫 클릭 성공), 오클릭(`scenario_misclick`)을 보냅니다.
- 정답 영역은 화면 코드에 `data-track-target="행동이름"` 속성만 붙입니다. 오클릭은 정답이 아닌 버튼·링크·메뉴 같은 조작 요소를 누른 것만 세고, 입력칸·라벨과 글자·빈 공간 클릭은 세지 않습니다.
- 운영진 홈 [새 공고 만들기]를 누르면 새 익명 방문자로 바꿉니다.
- 이름·이메일·지원 내용 등 개인정보와 화면 글자는 보내지 않고, 위치 정보(IP) 수집도 끕니다.

## 근거

- 퍼널·소요 시간 분석을 대시보드에서 바로 볼 수 있고, 기획이 이미 프로젝트를 만들었습니다.
- 클릭 리스너 하나와 속성 표시로 측정해, 화면 컴포넌트마다 추적 코드를 넣지 않습니다.

## 고려한 대안

- Mixpanel 자동 수집(autocapture): 버튼 클릭 위주라 빈 공간 오클릭과 단계별 첫 클릭을 정확히 계산하기 어렵습니다.
- Google Analytics 4: 이벤트 단위 퍼널·소요 시간 분석을 위해 설정이 더 필요하고, 기획 요청 도구가 아닙니다.

## 영향 범위

- `src/lib/analytics.ts`, `src/features/analytics/`, `src/app/layout.tsx`
- 시연 화면의 정답 버튼·영역에 붙인 `data-track-target`
- 로그인이 붙으면 `identify`로 회원과 익명 기록을 연결합니다.
