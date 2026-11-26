// 포인터가 항목 가운데보다 위면 그 항목 앞, 모든 항목 아래면 마지막 뒤(itemCenters.length)
function getDropIndex(itemCenters: readonly number[], pointerY: number) {
  const index = itemCenters.findIndex((center) => pointerY <= center)
  return index === -1 ? itemCenters.length : index
}

export { getDropIndex }
