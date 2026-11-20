const POSTING_CREATE_STEPS = [
  { id: 'info', label: '공고 정보' },
  { id: 'schedule', label: '모집 일정' },
  { id: 'method', label: '모집 방식' },
  { id: 'form', label: '지원서 양식' },
  { id: 'interview', label: '면접 시간 설정' },
  { id: 'review', label: '검토 및 게시' },
] as const

type PostingCreateStep = (typeof POSTING_CREATE_STEPS)[number]

function getPostingCreateSteps(hasInterview: boolean): PostingCreateStep[] {
  return hasInterview
    ? [...POSTING_CREATE_STEPS]
    : POSTING_CREATE_STEPS.filter((step) => step.id !== 'interview')
}

export { getPostingCreateSteps }
export type { PostingCreateStep }
