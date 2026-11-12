# 프로젝트 구조

> 팀이 정한 프론트엔드 구조 기준입니다. 새로 정한 기준은 `.claude/decisions/records/`에 기록하고 이 문서에 반영합니다.

## MOZIP 구조에 영향을 주는 특징

- **사용자가 두 종류**: 지원자와 운영진은 화면, 레이아웃, 권한이 다릅니다.
- **양쪽이 같은 데이터를 씁니다**: 공고, 지원서, 면접 데이터가 지원자 화면과 운영진 화면에 모두 나옵니다.
- **API 중심**: 대부분의 화면이 백엔드 데이터를 다루고, AI 기능도 API로 받습니다.
- **무거운 폼과 인터랙션**: 지원서 작성, 문항 설정, 캘린더, 면접표, 실시간 면접 보드가 있습니다.

## `app/`은 라우팅만 담당합니다

`page.tsx`는 화면에 무엇을 어떤 순서로 둘지만 정합니다. API 호출, 비즈니스 로직, 화면 컴포넌트는 `app/` 밖에 둡니다.

## 영역을 지원자, 운영진, 인증으로 나눕니다

```text
src/app/
├── layout.tsx       # html·body, 전역 폰트·스타일·Provider
├── page.tsx         # 로그아웃 홈 (GNB도 이 파일에서 렌더링)
├── (auth)/          # 로그인·회원가입 (아직 없음)
├── (applicant)/     # 지원자 영역 (지원자용 레이아웃)
└── manage/          # 운영진 영역 (운영진용 레이아웃·토스트 Provider, 인증 필요)
```

괄호로 감싼 폴더(route group)는 URL에 포함되지 않습니다. 영역마다 `layout.tsx`를 따로 두어 헤더, 네비게이션, 권한 처리를 분리합니다.

## 라우팅 구조

전체 경로 목록은 `src/app/`의 폴더 구조가 기준이며 이 문서에 따로 적지 않습니다. `typedRoutes`가 켜져 있어 존재하지 않는 경로로 링크하면 타입 오류가 납니다.

| 주소 범위                            | 영역        | GNB      |
| ------------------------------------ | ----------- | -------- |
| `/`                                  | 로그아웃 홈 | 로그아웃 |
| `(applicant)/` 아래 (`/postings` 등) | 지원자      | 지원자   |
| `/manage` 아래                       | 운영진      | 운영진   |

- 공고는 `postings`, 모집은 `recruitments`로 부르고, 목록 경로는 복수형을 씁니다.
- 조직 ID의 URL 포함 여부는 정하지 않았습니다.
- 사이드바 + 본문의 2단 화면은 해당 영역의 `layout.tsx`에서 `components/ui/Sidebar/sidebarLayout.tsx`의 `SidebarLayout`으로 구성합니다.

인증이 정해지기 전까지 GNB 상태는 주소로만 구분합니다. 임시 동작이므로 인증과 모드 저장 방식이 정해지면 다시 정합니다.

- 로그인·회원가입은 `/postings`, 로그아웃은 `/`로 이동만 합니다.
- 모드 전환은 지원자에서 `/manage`, 운영진에서 `/postings`로 이동만 합니다.
- 로그아웃 GNB에서 메뉴를 누르면 지원자 GNB가 나옵니다.
- 마이페이지는 Figma 시안에 맞춰 `/manage/mypage` 하나만 두므로 지원자 모드에서 들어가도 운영진 GNB가 나옵니다.

## API 호출은 한 곳의 클라이언트를 거칩니다

base URL, 인증 토큰, 에러 처리를 컴포넌트마다 따로 작성하지 않고, 공용 API 클라이언트 하나를 통해 호출합니다.

## 공용 코드는 도메인을 모릅니다

Button, Modal 같은 기본 UI와 날짜 포맷 같은 유틸은 "공고"나 "지원서"를 몰라야 합니다. 도메인 코드가 공용 코드를 가져다 쓰고, 그 반대는 하지 않습니다.

```text
src/
├── components/ui/   # 기본 UI. 컴포넌트 폴더마다 컴포넌트와 스토리만 둠, 테스트는 ui/__tests__/
├── hooks/           # 도메인을 모르는 공용 hook과 테스트
├── lib/             # 라이브러리 설정·래퍼
├── mocks/           # MSW 설정. 도메인 handler를 모으는 handler.ts와 browser.ts·server.ts
├── providers/       # 전역 Provider (Query, 토스트, MSW 대기)
└── utils/           # 의존성 없는 순수 함수와 테스트
```

`src/mocks/handler.ts`는 앱 전체의 handler를 한곳에 연결하는 자리라서, 예외적으로 `features/*/mocks/`를 import합니다.

컴포넌트 폴더에 계산 함수를 두지 않고 `utils/`로 뺍니다. 디자인 값은 컴포넌트에 두고 함수에 인자로 넘깁니다.

## 도메인 코드는 `features/`에 도메인별로 둡니다

```text
src/features/recruitment/
├── api/
│   ├── recruitment.ts   # 공통 API (지원 현황 조회 등)
│   ├── applicant.ts     # 지원자 전용 API (지원하기 등)
│   └── organizer.ts     # 운영진 전용 API (평가하기 등)
├── components/
│   ├── applicationStatusBadge.tsx # 양쪽이 쓰는 컴포넌트
│   ├── applicant/       # 지원자 전용 컴포넌트
│   └── organizer/       # 운영진 전용 컴포넌트
├── hooks/
├── mocks/               # MSW handler와 샘플 데이터
├── schemas/             # 폼 검증 zod 스키마와 폼 값 타입
├── utils/               # 도메인을 아는 순수 함수 (URL 쿼리 변환 등)
└── types.ts
```

공고와 모집은 다른 도메인입니다. 공고 탐색·스크랩·UP·공고 등록처럼 공고 데이터와 노출은 `features/posting/`, 지원 이후의 지원자 관리·평가·면접·선발은 `features/recruitment/`에 둡니다.

지원자·운영진 구분은 `api/`와 `components/` 안에서만 합니다. 위 구조는 양쪽 코드가 모두 있을 때의 모습입니다. 폴더와 파일은 실제 코드가 생길 때 만들고, 한쪽 역할의 코드만 있는 동안은 `applicant/`·`organizer/` 없이 `components/` 바로 아래에 둡니다.

`components/` 안에서는 함께 바뀌는 화면·영역 단위로 camelCase 폴더를 만들어 묶습니다. 폴더 이름은 그 영역의 진입 컴포넌트 이름을 따르고, 하위 컴포넌트·테스트·스토리를 같은 폴더에 둡니다. 컴포넌트가 아닌 계산 함수는 `utils/`에 둡니다. 역할 폴더가 생기면 그 안에서 같은 방식으로 묶습니다.

```text
src/features/recruitment/components/
├── documentReview/   # 서류 평가 목록 (documentReviewContent가 진입)
├── documentResult/   # 서류 평가 취합 (documentResultContent가 진입)
├── recruitmentBoard/ # 모집 관리 목록 공통 툴바·검색·페이지네이션
├── recruitmentNav/   # 모집 관리 LNB (recruitmentNav가 진입)
└── resultTable/      # 평가 결과 취합 표·평가자 의견 막대
```

| 코드                                     | 위치                 |
| ---------------------------------------- | -------------------- |
| 라우트 파일(`page.tsx`, `layout.tsx` 등) | `app/`               |
| 도메인을 아는 컴포넌트·API·hook·타입     | `features/<도메인>/` |
| 도메인을 모르는 기본 UI                  | `components/ui/`     |

- 도메인을 아는 컴포넌트는 한 화면에서만 쓰더라도 `features/`에 둡니다. route 옆에 `_components/`를 만들지 않습니다.
- `features/`의 스토리와 테스트는 대상 파일 옆에 둡니다.
- `JobCard`, `Gnb`처럼 Figma 공통 컴포넌트로 먼저 만든 컴포넌트는 아직 `components/ui/`에 있습니다.

## 전역 스타일은 바뀌는 이유에 따라 나눕니다

```text
src/app/globals.css      # 진입점. Tailwind와 아래 파일을 import
src/styles/
├── tokens.css           # Figma 디자인 토큰(색상·간격·반경·텍스트·layout)
├── utilities.css        # 커스텀 Tailwind 유틸리티
├── fonts.ts             # next/font/local로 Pretendard 로드
└── fonts/               # 폰트 파일과 라이선스
```

Figma 디자인 시스템이 바뀌면 `tokens.css`, 화면 구현에 필요한 유틸리티가 생기면 `utilities.css`를 수정합니다. 컴포넌트 전용 스타일은 이 폴더에 두지 않고 Tailwind 클래스로 작성합니다.

## 라이브러리 (2026-10-15 FE 회의)

| 영역        | 결정                  | 사용 기준                                                                    |
| ----------- | --------------------- | ---------------------------------------------------------------------------- |
| 기본 UI     | shadcn/ui             | 컴포넌트 코드를 저장소에 복사해 Figma 토큰 클래스로 바꿔 사용                |
| 서버 상태   | TanStack Query        | 브라우저에서 서버 데이터를 읽고 쓰는 화면. 공개 조회는 Server Component 우선 |
| 전역 상태   | 도입하지 않음         | 서버 데이터는 Query 캐시, 화면 간 공유 값은 URL·props 우선. 필요해지면 검토  |
| 폼과 검증   | react-hook-form + zod | 지원서·문항 설정처럼 입력과 검증이 있는 화면                                 |
| HTTP        | graphql-request       | 공용 GraphQL 클라이언트 한 곳에서만 사용. ky 대신 사용(결정 기록 015)        |
| 실시간 갱신 | 폴링                  | 면접 보드처럼 다른 사람의 변경을 봐야 하는 화면. 방식 변경은 백엔드와 결정   |
| UI 문서     | Storybook             | 공용 UI와 핵심 도메인 컴포넌트. 스토리는 컴포넌트 옆 `*.stories.tsx`         |
| API 목킹    | MSW                   | 개발 서버에서만. 아래 "API 목킹" 참고                                        |

설치는 각 라이브러리를 처음 실제로 쓰는 작업에서 합니다.

## API 목킹은 MSW로 합니다

handler 목록 하나를 브라우저, Next 서버, 테스트가 함께 씁니다(결정 기록 014).

| 요청이 나가는 곳 | 설정                   | 시작하는 곳                                                    |
| ---------------- | ---------------------- | -------------------------------------------------------------- |
| 브라우저         | `src/mocks/browser.ts` | `src/providers/mockProvider.tsx` (worker 준비까지 렌더링 대기) |
| Next 서버        | `src/mocks/server.ts`  | `src/instrumentation.ts`의 `register()`                        |
| Vitest           | `src/mocks/server.ts`  | API 연동 테스트가 생기면 `src/test/setup.ts`에 연결            |

- `.env.local`에 `NEXT_PUBLIC_API_MOCKING=enabled`를 두면 `pnpm dev`에서 켜집니다. production build에서는 값과 관계없이 꺼집니다.
- handler는 도메인의 `features/<도메인>/mocks/`에 작성하고 `src/mocks/handler.ts`에 추가합니다.
- `public/mockServiceWorker.js`는 msw가 만드는 파일이라 직접 고치지 않습니다. msw 버전을 올리면 `pnpm exec msw init`으로 다시 만듭니다.

## 인증 토큰은 httpOnly 쿠키로 받습니다

백엔드가 토큰을 httpOnly 쿠키로 발급하고, 프론트엔드 코드는 토큰을 직접 읽거나 저장하지 않습니다. 쿠키가 정상적으로 오가려면 FE와 BE가 같은 사이트(예: `mozip.kr`, `api.mozip.kr`)로 배포되어야 합니다. 로컬(`localhost`)에서는 이 조건이 드러나지 않으므로 배포 환경에서 따로 확인합니다.

## 공통 원칙

- 기본은 Server Component로 작성하고, 클릭·입력·브라우저 API가 필요한 부분만 `'use client'`로 분리합니다.
- 두 화면 이상에서 같은 이유로 바뀌는 코드만 공용으로 올립니다. 모양이 비슷하다는 이유만으로 미리 묶지 않습니다.
- `loading.tsx`, `error.tsx`, `not-found.tsx`는 실제로 필요한 화면이 생길 때 추가합니다.
