# 테스트

## 명령어

- `pnpm test`: 감시 모드. 파일을 저장할 때마다 관련 테스트를 다시 실행합니다. 개발 중에 켜 둡니다.
- `pnpm test:run`: 한 번만 실행하고 종료합니다. CI에서 사용합니다.

## 파일 위치와 이름

테스트는 대상 파일 바로 옆에 둡니다. Vitest는 `*.test.ts`, `*.test.tsx` 파일을 자동으로 찾습니다.

```text
find-overlap.ts
find-overlap.test.ts      # 함수 테스트
ScrapButton.tsx
ScrapButton.test.tsx      # 컴포넌트 테스트
```

## 무엇을 테스트할까

| 대상                                                       | 판단                          |
| ---------------------------------------------------------- | ----------------------------- |
| 계산·변환 로직 (면접 시간 배정, 지원 상태 전환, 날짜 처리) | 분기나 경계값이 있으면 테스트 |
| 폼, 버튼처럼 사용자가 조작하는 UI                          | 핵심 흐름 위주로 테스트       |
| 단순히 텍스트를 보여주는 화면                              | 테스트하지 않음               |

## 예시 1: 함수

```ts
import { describe, expect, it } from 'vitest'
import { findOverlap } from './find-overlap'

describe('findOverlap', () => {
  it('끝과 시작이 딱 맞닿기만 하면 겹친 게 아니다', () => {
    expect(findOverlap({ start: 600, end: 660 }, { start: 660, end: 720 })).toBeNull()
  })
})
```

- `describe`: 테스트 묶음 (무엇을 테스트하는지)
- `it`: 테스트 하나 (어떤 상황에서 어떻게 되어야 하는지)
- `expect(실제값).toXxx(기대값)`: 확인. 하나라도 틀리면 그 테스트는 실패합니다.

정상 케이스보다 **경계값**(딱 맞닿는 시간, 빈 배열, 0명)이 버그를 더 잘 잡습니다.

## 예시 2: 컴포넌트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ScrapButton } from './ScrapButton'

it('누르면 스크랩 상태가 된다', async () => {
  const user = userEvent.setup()
  render(<ScrapButton />) // 1. 그리기

  await user.click(screen.getByRole('button', { name: '스크랩' })) // 2. 찾아서 누르기

  expect(screen.getByRole('button', { name: '스크랩 취소' })).toBeInTheDocument() // 3. 확인
})
```

- 요소는 `className`이 아니라 **사용자가 보는 기준**(`getByRole`, `getByLabelText`, `getByText`)으로 찾습니다. 스타일을 바꿔도 테스트가 깨지지 않습니다.
- 클릭과 입력은 `user-event`를 사용하고, `await`를 붙입니다.

## 한계

- 비동기 Server Component나 실제 브라우저 동작(스크롤, 레이아웃)은 이 테스트로 확인하기 어렵습니다. 필요해지면 Playwright 같은 E2E 도구를 별도로 검토합니다.
- 디자인이 맞는지는 테스트가 아니라 실제 화면으로 확인합니다.
