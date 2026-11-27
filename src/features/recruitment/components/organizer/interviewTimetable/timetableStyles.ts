// Figma 선택 상태의 2px 테두리, 1px 테두리 안쪽에 1px ring을 겹쳐 크기 변화 방지
const SELECTED_BORDER_CLASS =
  'border-brand-solid ring-1 ring-(--border-color-brand-solid) ring-inset'

const FOCUS_RING_CLASS =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid'

export { FOCUS_RING_CLASS, SELECTED_BORDER_CLASS }
