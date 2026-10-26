# 기본 UI는 shadcn/ui 기반

- 상태: accepted
- 기록일: 2026-10-15

## 맥락

운영진 화면에 Dialog, Dropdown, Popover처럼 키보드·포커스 제어가 필요한 UI가 많습니다.

## 결정

기본 UI 컴포넌트는 shadcn/ui에서 가져와 저장소 안에서 수정해 사용합니다.

## 근거

- 접근성 있는 동작을 직접 구현하는 시간을 줄입니다.
- 패키지가 아니라 코드를 복사하는 방식이라 디자인 시스템에 맞게 고칠 수 있습니다.
- Tailwind CSS 기반이라 기존 스타일 체계와 맞습니다.

## 고려한 대안

- 직접 구현: 의존성이 없지만 7주 일정에 접근성 처리 비용이 큽니다.
- 완성형 UI 라이브러리: 디자인 수정 자유도가 낮습니다.

## 영향 범위

- 공용 UI 컴포넌트 전체
- `.claude/rules/component-guide.md`의 UI 라이브러리·variant 규칙

## 검증 또는 재검토 조건

- 디자인 시스템이 shadcn/ui 구조와 크게 다르면 컴포넌트를 대부분 고쳐야 하므로 디자인 파트와 맞춰 봅니다.
- 설치 시 함께 들어오는 의존성(UI primitive, 아이콘 등)과 컴포넌트 위치는 도입 작업에서 확인합니다.

## 도입 설정 (2026-10-25)

- 스타일은 `radix-luma`, 컴포넌트는 `src/components/ui/`, `cn`은 `src/lib/utils.ts`에서 shadcn 공식 `cn` 패키지의 `createCn`으로 만들고, `tokens.css`의 반경·간격·텍스트 토큰을 등록합니다. 기본 `cn`을 쓰면 `text-body1`을 글자 색으로 판단해 `text-brand` 같은 글자 색 클래스를 지웁니다. `rounded-s`·`rounded-l`은 Tailwind 모서리 유틸리티와 이름이 겹쳐 `cn`이 다른 반경과 병합하지 않으므로, `className`으로 반경을 덮어쓸 때 주의합니다.
- 함께 설치된 의존성: `radix-ui`, `class-variance-authority`, `cn`, `lucide-react`(shadcn 컴포넌트 내부 아이콘, 2026-10-26 제거), `tw-animate-css`. `shadcn`은 CLI와 `shadcn/tailwind.css`(variant·keyframe)용 devDependency입니다.
- shadcn 테마 변수는 두지 않습니다. `tokens.css`가 Tailwind 기본 색·반경을 초기화하므로, shadcn 변수를 함께 두면 `bg-primary`와 `bg-brand-solid` 두 이름 체계가 섞이고 `--radius-xl` 같은 디자인 값이 덮어써집니다. 가져온 컴포넌트는 Figma 토큰 클래스로 바꿔 사용합니다.
- `components.json`의 `cssVariables`는 `true`로 둡니다. `false`면 CLI가 `bg-oklch(...)` 같은 잘못된 클래스를 생성합니다.
- 다크 모드는 디자인에 없으므로 설정하지 않습니다.

## 변경 기록

- 2026-10-15: FE 1차 회의 결정으로 최초 기록
- 2026-10-25: 설치와 함께 토큰 연결 방식(테마 변수 미사용) 기록
- 2026-10-26: 아이콘을 Figma SVG로 관리하기로 해 `lucide-react` 제거
