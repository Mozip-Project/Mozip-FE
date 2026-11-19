// 켜고 끈 결과를 기준 순서대로 정렬해 반환
function toggleInOrder<T>(order: readonly T[], selected: readonly T[], item: T, isOn: boolean) {
  return order.filter((value) => (value === item ? isOn : selected.includes(value)))
}

export { toggleInOrder }
