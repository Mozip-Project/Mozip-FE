# 컴포넌트 가이드

## 경계

- 한 번만 사용되는 화면 내부 조합은 해당 기능·페이지 폴더에 둡니다.
- 두 개 이상 화면에서 재사용되는 작고 안정적인 UI만 공통 컴포넌트로 추출합니다.
- 페이지는 화면 구성 요소를 조립하고, 각 구성 요소는 레이아웃·콘텐츠·상호작용을 책임집니다.
- 특정 화면 전용 하위 컴포넌트·상수·타입은 해당 화면 폴더에 co-locate합니다. 다른 화면이 실제로 필요로 할 때만 승격합니다.
- 컴포넌트 안에 새 컴포넌트를 선언하지 않습니다. 렌더링마다 컴포넌트 타입이 바뀌고 책임 경계가 흐려집니다.
- Next.js의 `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`를 제외하면 named export를 기본으로 사용합니다.

## 선택 우선순위

1. 시맨틱 HTML과 Tailwind CSS 유틸리티로 해당 화면 안에서 해결합니다.
2. 현재 화면에 이미 있는 작고 명확한 UI를 재사용합니다.
3. 두 개 이상의 화면이 같은 목적과 변경 주기를 공유할 때만 작은 공용 컴포넌트를 만듭니다.
4. Dialog, Popover, Menu처럼 키보드·포커스 제어가 필요한 복잡한 동작은 shadcn/ui 컴포넌트를 가져와 사용합니다.

- 기본 UI 라이브러리는 shadcn/ui입니다. shadcn/ui 외의 공용 UI 라이브러리나 아이콘 라이브러리를 임의로 추가하지 않습니다.
- shadcn/ui 테마 변수(`--primary`, `--border` 등)는 두지 않습니다. `pnpm exec shadcn add`로 가져온 컴포넌트는 `bg-primary`, `rounded-4xl`, `dark:` 같은 shadcn 기본 클래스를 `tokens.css`의 클래스(`bg-brand-solid`, `rounded-m` 등)로 바꾼 뒤 사용합니다.
- `shadcn add` 후 `globals.css`에 `:root`·`.dark`·`@theme inline` 변수가 추가되면 되돌립니다. `globals.css`에는 import만 둡니다.
- 가져온 컴포넌트의 `import { cn } from 'cn'`은 `@/lib/utils`로 바꿉니다. 기본 `cn`은 `text-body1` 같은 커스텀 토큰을 몰라 글자 색 클래스를 지웁니다. `tokens.css`에 반경·간격·텍스트 토큰을 추가하면 `src/lib/utils.ts` 목록도 함께 갱신합니다.
- 아이콘은 먼저 `src/assets/icons/`에 이미 있는지 확인합니다. 없으면 Figma에서 SVG로 내보내 그 폴더에 두고, 색은 `currentColor`로 바꿔 `@/assets/icons/<name>.svg`로 import합니다. SVGR 변환 대상은 `next.config.ts`, `.storybook/main.ts`, `vitest.config.mts`에 같은 경로로 맞춰 둡니다. `lucide-react`는 쓰지 않습니다. `shadcn add`로 가져온 컴포넌트가 lucide 아이콘을 import하거나 `package.json`에 `lucide-react`를 다시 추가하면, 아이콘을 `src/assets/icons/`의 SVG로 바꾸고 의존성을 제거합니다.
- 입력과 검증이 있는 폼은 react-hook-form과 zod를 사용합니다.
- 한 번만 쓰는 UI를 범용 `Button`, `Card`, `Section`처럼 성급하게 추상화하지 않습니다. 실제 재사용 요구가 생긴 뒤에만 승격합니다.

## 설계 순서

1. 화면의 콘텐츠와 시맨틱 구조를 먼저 작성합니다.
2. 반복되는 항목만 명시적 타입의 데이터 배열로 분리합니다.
3. 화면 변화가 필요한 경우에만 상태와 이벤트를 추가합니다.
4. 동일한 목적·변경 주기를 가진 다른 사용처가 생긴 뒤 공용 컴포넌트 추출을 검토합니다.

- boolean prop이 두세 개를 넘어 조합을 해석하기 어려워지면 `variant` 같은 제한된 union 또는 별도 컴포넌트가 더 명확한지 검토합니다.
- 아이콘, action, 보조 텍스트처럼 한 위치만 바꿔야 할 때는 무분별한 config object보다 `children` 또는 명확한 slot prop을 우선합니다.
- 컴포넌트 API는 현재 사용처가 요구하는 최소 표면으로 시작합니다. 미래의 모든 레이아웃을 지원하는 prop을 미리 만들지 않습니다.

## 재사용 컴포넌트 API

- `className`은 외부에서 레이아웃 또는 간격 조정이 실제로 필요한 재사용 UI에만 노출합니다. 모든 화면 컴포넌트에 기계적으로 추가하지 않습니다.
- `ref`는 focus, 측정, animation anchor처럼 호출자가 DOM 요소에 접근해야 하는 경우에만 전달합니다. React 19에서는 `ComponentPropsWithRef` 또는 명시적 `ref` prop으로 타입을 유지합니다.
- DOM 요소의 기본 props를 감싸는 공용 UI는 필요한 경우 `...props`를 전달하되, `type="button"`처럼 안전한 기본값이 있는 속성은 명시합니다.
- 부모와 상태를 공유하거나 외부 값에 동기화해야 하는 입력 UI는 controlled component로 작성합니다. 한 화면 내부에서만 독립적으로 쓰이는 작은 인터랙션은 local state로 관리해도 됩니다.
- 아이콘, 보조 텍스트, action처럼 한 위치만 바뀌는 UI는 boolean prop 또는 거대한 config object보다 `children`과 명확한 slot prop을 우선합니다.

## Variant와 반복 데이터

- 시각 상태가 두세 개를 넘어가면 boolean prop을 늘리지 말고 제한된 union type 또는 별도 컴포넌트로 의미를 드러냅니다.
- shadcn/ui에서 가져온 컴포넌트는 원래의 variant 작성 방식을 유지합니다. 직접 만드는 컴포넌트의 variant별 className은 누락을 막을 수 있도록 `Record`와 `satisfies`를 사용합니다.
- 반복되는 내비게이션 항목, 목록, 수치, 링크는 명시적 타입의 배열·설정 객체로 분리합니다. 한 번만 쓰는 짧은 텍스트와 마크업까지 억지로 데이터화하지 않습니다.

## UI 기본값

- 시맨틱 HTML을 먼저 선택합니다. 클릭 가능한 `div`나 `span`을 만들지 않습니다.
- 아이콘만 있는 버튼은 접근 가능한 이름을 제공합니다.
- input, textarea, select에는 보이는 label 또는 접근 가능한 이름을 제공합니다.
- 색상만으로 상태·오류·선택 여부를 전달하지 않고 텍스트, 아이콘, `aria-*` 속성을 함께 검토합니다.
- 이미지 컨테이너에는 고정된 비율 또는 크기 제약을 두어 레이아웃 이동을 줄입니다.
- 반응형에서 줄바꿈 가능한 텍스트 컨테이너는 `min-w-0`과 overflow 처리를 검토합니다.
- 로딩·오류·빈 상태가 실제로 발생하는 동적 콘텐츠에만 별도 UI를 추가합니다.

## 파일과 테스트 배치

- 화면 전용 파일은 해당 폴더에 함께 둡니다. 예를 들어 `feature-name/feature-section.tsx`, `feature-name/feature-content.ts`, `feature-name/feature-section.test.tsx`처럼 배치합니다.
- 재사용 컴포넌트의 테스트도 가까이에 두되, `src/components/ui/`의 공용 컴포넌트는 `src/components/ui/__tests__/`에 둡니다. 테스트는 사용자에게 보이는 계약과 실패 가능성이 있는 상호작용을 검증합니다.
- 정적 콘텐츠·정적 마크업에는 테스트를 강제하지 않습니다.

## Client Component

- 이벤트, state, Effect, 브라우저 API가 필요한 컴포넌트만 `'use client'`로 만듭니다.
- Client Component는 상호작용 경계에 가깝게 두고, 정적 콘텐츠까지 연쇄적으로 client화하지 않습니다.
- 사용자 이벤트에서만 필요한 로직은 이벤트 핸들러에 둡니다. `useEffect`는 외부 시스템·구독·브라우저 API 동기화에만 사용합니다.
- effect에서 등록한 이벤트·observer·timer는 같은 effect의 cleanup에서 해제합니다.
- `useEffect`로 props나 계산 가능한 값을 state에 복제하지 않습니다. 렌더링 중 계산할 수 있는 값은 그대로 계산합니다.
- 사용자의 클릭·키 입력에서만 필요한 동작은 effect가 아니라 이벤트 핸들러에서 실행합니다.
- scroll listener, intersection observer, animation frame은 필요한 화면 내부의 작은 Client Component에 두고 cleanup합니다. 정적 영역까지 Client Component로 전파하지 않습니다.

## 피해야 할 패턴

- 비슷해 보인다는 이유만으로 화면 전용 UI를 공용 컴포넌트로 추출하는 것
- `isPrimary`, `isLarge`, `isOutlined`처럼 해석하기 어려운 boolean prop을 계속 추가하는 것
- 모든 상태를 부모로 끌어올리거나, 반대로 공유해야 하는 상태를 각 자식에 분산하는 것
- JSX 안에 긴 데이터 목록을 하드코딩하거나, 짧은 정적 마크업까지 과도하게 설정 객체로 만드는 것
- 근거 없는 관리자형 UI, 장식용 카드, 임의의 모션을 추가하는 것
- 디자인 근거 없이 임의의 색상·간격·그림자·애니메이션 값을 추가하는 것
- 인라인 style로 Tailwind의 기존 스타일 체계를 우회하는 것
