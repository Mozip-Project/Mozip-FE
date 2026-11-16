const ROVING_FOCUS_KEY_INTENT = {
  ArrowLeft: 'prev',
  ArrowRight: 'next',
  Home: 'first',
  PageUp: 'first',
  End: 'last',
  PageDown: 'last',
} as const

type RovingFocusIntent = (typeof ROVING_FOCUS_KEY_INTENT)[keyof typeof ROVING_FOCUS_KEY_INTENT]

// 가로 방향 키만 처리, 해당 없는 키는 undefined
function getRovingFocusIntent(key: string): RovingFocusIntent | undefined {
  return Object.hasOwn(ROVING_FOCUS_KEY_INTENT, key)
    ? ROVING_FOCUS_KEY_INTENT[key as keyof typeof ROVING_FOCUS_KEY_INTENT]
    : undefined
}

// 처음·끝에서 반대쪽으로 순환, Radix TabsList 기본값(loop)과 같은 동작
function getRovingFocusTargetIndex(
  intent: RovingFocusIntent,
  currentIndex: number,
  itemCount: number,
) {
  switch (intent) {
    case 'first':
      return 0
    case 'last':
      return itemCount - 1
    case 'prev':
      return (currentIndex - 1 + itemCount) % itemCount
    case 'next':
      return (currentIndex + 1) % itemCount
  }
}

export { getRovingFocusIntent, getRovingFocusTargetIndex }
export type { RovingFocusIntent }
