import type { PostingStatus } from '@/gql/graphql'

type LnbStageStatus = {
  label: string
  isHighlighted: boolean
}

const WAITING = { label: '대기', isHighlighted: false } satisfies LnbStageStatus
const IN_PROGRESS = { label: '진행 중', isHighlighted: true } satisfies LnbStageStatus
const DONE = { label: '완료', isHighlighted: false } satisfies LnbStageStatus

// TODO: 종료 공고 표기 디자인 확인 필요, 지금은 상태 생략
function getPostingStageStatus(status: PostingStatus): LnbStageStatus | null {
  switch (status) {
    case 'DRAFT':
      return { label: '작성 중', isHighlighted: true }
    case 'RECRUITING':
    case 'DOC_REVIEW':
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
      return { label: '게시 중', isHighlighted: true }
    case 'ENDED':
      return null
  }
}

function getDocumentStageStatus(status: PostingStatus): LnbStageStatus {
  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
      return WAITING
    case 'DOC_REVIEW':
      return IN_PROGRESS
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return DONE
  }
}

function getInterviewStageStatus(status: PostingStatus): LnbStageStatus {
  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
    case 'DOC_REVIEW':
    case 'DOC_RESULT_NOTICE':
      return WAITING
    case 'INTERVIEW':
      return IN_PROGRESS
    case 'FINAL_RESULT':
    case 'ENDED':
      return DONE
  }
}

export { getDocumentStageStatus, getInterviewStageStatus, getPostingStageStatus }
export type { LnbStageStatus }
