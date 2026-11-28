// 시연 시나리오 화면 단계, Mixpanel 단계별 이탈·탐색 시간 집계 기준
type ScenarioStep =
  | 'manage_home'
  | 'posting_info'
  | 'posting_schedule'
  | 'posting_method'
  | 'posting_form'
  | 'posting_interview'
  | 'posting_review'
  | 'document_review'
  | 'document_evaluation'
  | 'document_result'
  | 'interview_timetable'

// 공고 작성 주소의 step 값, 없거나 모르는 값은 첫 단계
const POSTING_CREATE_STEP: Partial<Record<string, ScenarioStep>> = {
  info: 'posting_info',
  schedule: 'posting_schedule',
  method: 'posting_method',
  form: 'posting_form',
  interview: 'posting_interview',
  review: 'posting_review',
}

const POSTING_CREATE_PATH_PATTERN = /^\/manage\/postings\/(new|[^/]+\/edit)$/
const POSTING_STAGE_PATH_PATTERN =
  /^\/manage\/postings\/[^/]+\/(documents|documents\/summary|interviews\/timetable|documents\/[^/]+)$/

function getPostingCreateStep(stepParam: string | null): ScenarioStep {
  return (stepParam && POSTING_CREATE_STEP[stepParam]) || 'posting_info'
}

function getPostingStageStep(section: string): ScenarioStep {
  switch (section) {
    case 'documents':
      return 'document_review'
    case 'documents/summary':
      return 'document_result'
    case 'interviews/timetable':
      return 'interview_timetable'
    default:
      return 'document_evaluation'
  }
}

// 시나리오 밖 화면은 null, 클릭 측정 대상에서 제외
function getScenarioStep(pathname: string, stepParam: string | null): ScenarioStep | null {
  if (pathname === '/manage') {
    return 'manage_home'
  }
  if (POSTING_CREATE_PATH_PATTERN.test(pathname)) {
    return getPostingCreateStep(stepParam)
  }
  const stageSection = POSTING_STAGE_PATH_PATTERN.exec(pathname)?.[1]
  return stageSection ? getPostingStageStep(stageSection) : null
}

export { getScenarioStep }
export type { ScenarioStep }
