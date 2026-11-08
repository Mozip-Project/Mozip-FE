# 토스트는 영역 layout의 공용 Provider로 띄운다

- 상태: accepted
- 기록일: 2026-11-07

## 맥락

서류 평가하기의 "저장하고 다음 지원자 보기"처럼 저장 뒤 다른 페이지로 이동하면서 토스트를 보여 줘야 하는 화면이 있습니다. 페이지 안에 토스트를 두면 이동할 때 함께 사라집니다. Figma에는 포트폴리오 다운로드, 결과 확정 실패 등 다른 화면의 토스트도 있습니다.

## 결정

`src/providers/toastProvider.tsx`의 `ToastProvider`를 영역 layout에 두고, 화면은 `useToast()`의 `showToast({ title, description })`로 토스트를 띄웁니다.

- 지금은 운영진 영역(`app/manage/layout.tsx`)에만 둡니다. 지원자 영역에서 필요해지면 그 영역 layout에 추가하거나 root layout으로 올립니다.
- 토스트 모양과 시간은 공용 UI `components/ui/Toast`를 그대로 사용합니다.

## 근거

- 영역 layout은 영역 안에서 페이지를 옮겨도 유지되어, 이동 직후에도 토스트가 남습니다.
- 화면마다 Provider·Viewport·열림 상태를 따로 두지 않아도 됩니다.

## 고려한 대안

- URL 쿼리로 다음 페이지에 표시 요청 전달: 토스트를 쓰는 화면마다 같은 처리가 반복됩니다.
- sonner 같은 토스트 라이브러리: 새 의존성이 필요하고 Figma에 맞춰 만든 `Toast`를 대체하게 됩니다.
- root layout에 바로 배치: 지금 토스트가 필요한 영역은 운영진뿐이라 범위가 필요보다 넓습니다.

## 영향 범위

- `src/providers/toastProvider.tsx`, `src/app/manage/layout.tsx`
- 토스트를 띄우는 모든 화면

## 검증 또는 재검토 조건

- 실패 토스트처럼 아이콘이 다른 토스트가 필요해지면 `Toast`에 variant를 추가하고 `showToast` 인자를 넓힙니다.

## 변경 기록

- 2026-11-07: 서류 평가 저장 토스트를 위해 최초 기록
