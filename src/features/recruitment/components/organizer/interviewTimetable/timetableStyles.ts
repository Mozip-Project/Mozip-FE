// Figma 선택 상태의 2px 테두리, 1px 테두리 안쪽에 1px ring을 겹쳐 크기 변화 방지
const SELECTED_BORDER_CLASS =
  'border-brand-solid ring-1 ring-(--border-color-brand-solid) ring-inset'

const FOCUS_RING_CLASS =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid'

// Figma 카드·열 머리글 팝오버는 기준 요소 바로 아래 12px
const POPOVER_BELOW_OFFSET_PX = 12

export { FOCUS_RING_CLASS, POPOVER_BELOW_OFFSET_PX, SELECTED_BORDER_CLASS }
