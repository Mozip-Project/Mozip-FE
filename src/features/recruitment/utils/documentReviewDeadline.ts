// 마감 시각부터 수정 불가, 읽을 수 없는 값도 수정 불가로 처리
function canEditDocumentReview(deadline: string, now: Date) {
  const deadlineTime = Date.parse(deadline)

  if (Number.isNaN(deadlineTime)) {
    return false
  }

  return now.getTime() < deadlineTime
}

export { canEditDocumentReview }
