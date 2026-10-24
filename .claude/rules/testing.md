# 테스트와 회귀 확인

## 도구와 위치

- 단위·동기 컴포넌트 테스트는 Vitest와 React Testing Library를 사용합니다. `src/test/setup.ts`에서 jest-dom matcher를 전역 등록하며, 사용자 상호작용은 `@testing-library/user-event`를 사용합니다.
- `pnpm test`는 감시 모드, `pnpm test:run`은 CI용 단발 실행입니다.
- 사람이 읽는 예시와 설명은 `docs/TESTING.md`에 있습니다.
- 테스트는 대상 파일 가까이에 둡니다. 유틸리티는 `.test.ts`, React 컴포넌트는 `.test.tsx`를 사용합니다.

```text
feature-name/
├── feature-navigation.ts
├── feature-navigation.test.ts
├── feature-section.tsx
└── feature-section.test.tsx
```

## 테스트 선택

| 대상                                            | 기본 판단                                |
| ----------------------------------------------- | ---------------------------------------- |
| 순수 유틸리티·데이터 변환                       | 분기나 경계값이 있으면 테스트            |
| 면접 시간 배정, 지원 상태 전환 같은 도메인 로직 | 경계값 포함 테스트 필수                  |
| 상태 전이·타이머·observer를 쓰는 hook           | 테스트 권장                              |
| 메뉴·accordion·drag·form 등 인터랙티브 UI       | 사용자 흐름과 접근성 테스트 권장         |
| 정적 카피·정적 마크업                           | 테스트 강제하지 않음                     |
| 비동기 Server Component·실제 브라우저 동작      | 브라우저 확인 또는 E2E 도입 시 별도 검증 |

- 아직 테스트 파일이 없어도 테스트 러너는 통과하도록 구성되어 있습니다. 테스트가 없다는 사실을 테스트 완료로 표현하지 않습니다.
- 테스트를 추가한다면 사용자에게 보이는 계약과 실패 가능성이 있는 로직을 우선합니다.
- DOM 탐색은 role, label, text를 우선합니다. className, 깊은 selector, 내부 컴포넌트 트리에 고정된 테스트는 피합니다.
- 타이머, observer, 브라우저 API는 mock 또는 fake timer로 격리하고, 테스트 뒤 원래 상태로 복구합니다.

## 시각·수동 확인

- 디자인 충실도는 단위 테스트가 아니라 실제 화면 비교로 확인합니다. 키보드, reduced motion, 드래그 같은 상호작용도 필요한 경우 수동 시나리오를 명시합니다.
- 시각적 결과는 스냅샷만으로 확정하지 않습니다. 디자인 기준, 데스크톱·모바일 화면, 키보드·reduced motion 동작을 변경 범위에 맞춰 확인합니다.
