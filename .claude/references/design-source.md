# 디자인 기준

## Figma

<!-- TODO: 디자이너에게 받은 Figma 파일 URL, 화면별 노드, 데스크톱·모바일 frame 크기를 적는다. -->

- 파일: 미정
- 지원자 화면: 미정
- 운영진 화면: 미정

## 자료 해석 우선순위

1. Figma: 레이아웃, 간격, 색, 문구, 상태(hover, disabled, 에러 등)
2. `.claude/references/product-brief.md`: 기능 범위와 사용자 흐름
3. 기존 코드: 위 두 자료에 없는 세부 구현

Figma에 없는 화면 상태(빈 목록, 로딩, 에러, 모바일)는 임의로 디자인하지 않고 디자이너에게 확인할 항목으로 보고합니다.

## 디자인 시스템

<!-- TODO: 타이포 토큰과 공통 컴포넌트 목록이 정해지면 적는다. -->

색상·간격·반경·layout 토큰은 `src/styles/tokens.css`에, `layout-grid` 같은 커스텀 유틸리티는 `src/styles/utilities.css`에 정의하고 `src/app/globals.css`에서 import합니다. Tailwind 기본 색상·반경·브레이크포인트는 초기화했으므로 아래 이름만 사용할 수 있습니다.

| 분류           | 유틸리티 예시                                                                       | 비고                                        |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Semantic 색    | `text-fg-neutral`, `bg-bg-brand-solid`, `border-stroke-focus-ring`                  | 화면 코드는 semantic 색을 우선 사용         |
| Palette 색     | `bg-gray-50`, `text-green-500`                                                      | gray·green·teal·yellow·red·blue, `static-*` |
| Padding·Gap    | `p-padding-m`, `gap-gap-l`                                                          | 숫자 유틸리티(`p-4`)도 같은 4px 그리드      |
| Radius         | `rounded-xs` ~ `rounded-xxl`, `rounded-full`                                        | xs 4 · s 6 · m 8 · l 12 · xl 16 · xxl 24px  |
| 브레이크포인트 | `tablet:`(768px 이상), `desktop:`(1280px 이상)                                      | 접두사 없음이 모바일                        |
| Layout         | `px-page-padding`, `py-section-gap`, `gap-content-gap`, `max-w-page`, `layout-grid` | 브레이크포인트별 값은 CSS 변수가 자동 전환  |

- `static-black-alpha-*`는 Figma 변수 기준으로 `#080808`에 불투명도 100=0.04, 200=0.08, 500=0.4, 700=0.64를 적용했습니다.
- `layout/container-max`의 태블릿(704)·모바일(343) 값은 frame 폭에서 page-padding을 뺀 값이라 고정하지 않고, 데스크톱 최대 폭 1200px만 `max-w-page`로 둡니다.
- 다크 모드 토큰은 아직 없습니다.

## 인터랙션 방향

<!-- TODO: Figma 프로토타입에 명시된 전환·모션 의도를 적는다. -->
