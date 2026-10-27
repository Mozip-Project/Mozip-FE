# Next.js 아키텍처

사람이 읽는 구조 설명은 `docs/ARCHITECTURE.md`가 단일 기준입니다. 이 문서는 그중 AI가 작업할 때 지켜야 할 규칙만 정리합니다.

## 구조

| 위치                     | 용도                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `src/app/layout.tsx`     | root layout. `html`·`body`, 전역 metadata·폰트·스타일·Provider |
| `src/app/(auth)/`        | 로그인·회원가입                                                |
| `src/app/(applicant)/`   | 지원자 영역과 지원자용 layout                                  |
| `src/app/<운영진 경로>/` | 운영진 영역과 운영진용 layout. 경로 이름은 미정                |
| `src/components/ui/`     | 기본 UI. 컴포넌트 폴더에는 컴포넌트와 스토리만                 |
| `src/lib/`               | 라이브러리 설정·래퍼                                           |
| `src/utils/`             | 도메인을 모르는 순수 함수와 테스트                             |

- `app/`은 라우팅만 담당합니다. `page.tsx`는 화면 구성 순서와 데이터 전달만 보여 주고, API 호출·비즈니스 로직·큰 UI 덩어리는 `app/` 밖에 둡니다.
- 한 화면에서만 쓰는 작은 UI는 해당 route 옆 `_components/`에 둘 수 있습니다.
- route group(`(name)`)과 `_`로 시작하는 폴더는 URL 세그먼트를 만들지 않습니다.
- API 호출은 공용 API 클라이언트 한 곳을 거칩니다. 컴포넌트에서 백엔드 주소로 직접 `fetch`하지 않습니다.
- 도메인을 모르는 공용 코드(기본 UI, 유틸)는 도메인 코드를 import하지 않습니다.
- 컴포넌트에서 쓰는 계산 함수는 컴포넌트 폴더가 아니라 `src/utils/`에 두고, 디자인 값은 컴포넌트에서 인자로 넘깁니다.

## 아직 정하지 않은 구조

- 도메인 코드(공고, 지원서, 면접 등)의 폴더 위치와 이름은 아직 정하지 않았습니다. 필요한 작업이 생기면 폴더를 임의로 만들지 않고 결정이 필요하다고 알립니다.
- 운영진 URL(`/manage` 또는 `/admin`), 조직 ID의 URL 포함 여부도 같은 방식으로 다룹니다.

## Server·Client 경계

- page와 layout은 Server Component를 기본으로 합니다.
- 이벤트, state, effect, 브라우저 API가 필요한 가장 안쪽 컴포넌트에만 `'use client'`를 둡니다.
- Server Component에서 Client Component로 넘기는 props는 직렬화 가능한 데이터여야 합니다. 함수·클래스 인스턴스를 경계 너머로 전달하지 않습니다.
- Provider는 서로 떨어진 화면이 같은 상태를 실제로 공유할 때만 추가하고, 필요한 만큼 트리 안쪽에 둡니다.

## 영역별 layout과 권한

- 지원자, 운영진, 인증 영역은 각자의 `layout.tsx`에서 헤더·내비게이션을 관리합니다. root layout에 영역별 UI를 넣지 않습니다.
- 운영진 영역은 인증이 필요합니다. 인증 방식이 정해지기 전에는 접근 제어를 임의로 구현하지 않고 TODO로 보고합니다.
- 운영진 전용 코드가 지원자 화면 번들에 섞이지 않게 import 범위를 유지합니다.

## 라우트 파일

- `loading.tsx`, `error.tsx`, `not-found.tsx`는 실제 사용자 복구 흐름이 필요할 때 추가합니다.
- 내부 이동은 `next/link`와 `next/navigation`을 사용합니다. `next/router`, `next/document`는 사용하지 않습니다.
- `typedRoutes`가 켜져 있어 존재하지 않는 경로로 `Link`하면 타입 오류가 납니다. 경로를 문자열로 조합하기 전에 실제 route를 확인합니다.
- Next.js 16 API가 학습 데이터와 다를 수 있으므로 낯선 API는 `node_modules/next/dist/docs/`에서 확인합니다.
