import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import {
  findOrganizationPostingSample,
  ORGANIZATION_POSTING_ID,
  ORGANIZATION_POSTING_SAMPLES,
} from '@/features/posting/mocks/organizationPostingSamples'
import { POSTING_SAMPLE_ID } from '@/features/posting/mocks/postingDetailHandlers'
import { getMockAccount } from '@/features/user/mocks/userHandlers'
import type {
  DocResult,
  MyDocEvaluationFieldsFragment,
  MyDocEvaluationStatus,
  Opinion,
  PostingStatus,
} from '@/gql/graphql'
import { applicantApplications, type MockApplication } from './applicantApplicationStore'
import { getSampleAnswers } from './documentEvaluationSample'
import { DOCUMENT_RESULT_SAMPLE } from './documentResultSample'

// 지원자 관리·서류 평가·평가하기·취합 MSW가 같은 지원자·내 평가·서류 결과를 보도록 한곳에서 관리

// 샘플 의견 수 합계와 같은 운영진 수, 그중 한 명이 나
const EVALUATOR_COUNT = 3
const OTHER_EVALUATOR_COUNT = EVALUATOR_COUNT - 1

const SAMPLE_FIRST_SUBMITTED_AT = Date.UTC(2026, 9, 15, 12)
const SAMPLE_SUBMIT_INTERVAL_MS = 60 * 60 * 1000

// 서류 평가 중 공고에서 내가 아직 평가하지 않은 지원자(샘플 번호)
const MY_UNEVALUATED_SAMPLE_ID = '1'

const MIN_SCORE = 1
const MAX_SCORE = 5

type SampleApplicant = (typeof DOCUMENT_RESULT_SAMPLE)[number]
type SampleOpinion = keyof SampleApplicant['opinionCounts']

type PostingApplication = {
  id: string
  // 샘플 지원자 번호, 지원서 상세 샘플을 고를 때 사용
  sampleId: string
  name: string
  positionId: string
  submittedAt: string
  sample: SampleApplicant
  // 지원서 작성 화면에서 낸 지원서, 샘플 지원자는 null
  submitted: MockApplication | null
}

// 전체 공고의 시연용 공고에 낸 지원서가 들어오는 운영진 공고(같은 제목)
const APPLY_POSTING_ID_BY_POSTING_ID: Partial<Record<string, string>> = {
  [ORGANIZATION_POSTING_ID.docReview]: POSTING_SAMPLE_ID.open,
}

// 낸 지원서에 채우는 다른 운영진 두 명의 평가, 내 평가는 직접 하도록 비움
const SUBMITTED_APPLICANT_SAMPLE = {
  opinionCounts: { pass: 3, hold: 0, fail: 0 },
  averageScore: 4.2,
  result: 'pass',
} satisfies Pick<SampleApplicant, 'opinionCounts' | 'averageScore' | 'result'>

const SAMPLE_OPINIONS = ['pass', 'hold', 'fail'] as const satisfies readonly SampleOpinion[]

const OPINION = { pass: 'PASS', hold: 'HOLD', fail: 'FAIL' } as const satisfies Record<
  SampleOpinion,
  Opinion
>

const REVIEW_DOC_RESULT = {
  pass: 'PASS',
  hold: 'HOLD',
  fail: 'FAIL',
} satisfies Record<SampleOpinion, DocResult>

const CONFIRMED_DOC_RESULT = {
  pass: 'PASS',
  hold: 'FAIL',
  fail: 'FAIL',
} satisfies Record<SampleOpinion, DocResult>

// 새로고침 전까지 유지되도록 지원서 ID별로 메모리에 보관
const myEvaluations = new Map<string, MyDocEvaluationFieldsFragment>()
const docResultOverrides = new Map<string, DocResult>()

// 결과 변경·평가 저장 요청엔 공고 ID가 없어 공고별로 다른 지원서 ID 사용
function getSampleApplicationId(postingId: string, sampleId: string) {
  return `application-${postingId}-${sampleId}`
}

// 샘플 순서대로 1시간씩 앞선 제출 시각
function toPostingApplications(postingId: string, applicantCount: number): PostingApplication[] {
  return DOCUMENT_RESULT_SAMPLE.slice(0, applicantCount).map((sample, index) => ({
    id: getSampleApplicationId(postingId, sample.id),
    sampleId: sample.id,
    name: sample.name,
    positionId: sample.position,
    submittedAt: new Date(
      SAMPLE_FIRST_SUBMITTED_AT - index * SAMPLE_SUBMIT_INTERVAL_MS,
    ).toISOString(),
    sample,
    submitted: null,
  }))
}

// 브라우저 MSW 메모리의 지원서라 새로고침하면 사라짐
function toSubmittedApplications(postingId: string): PostingApplication[] {
  const applyPostingId = APPLY_POSTING_ID_BY_POSTING_ID[postingId]
  const { name } = getMockAccount()

  return [...applicantApplications].flatMap(([id, submitted]): PostingApplication[] => {
    const { positionId, submittedAt } = submitted
    const position = DOCUMENT_RESULT_SAMPLE.find((sample) => sample.position === positionId)
    if (submitted.postingId !== applyPostingId || !submittedAt || !position) {
      return []
    }

    const sampleId = `my-${position.position}`
    return [
      {
        id,
        sampleId,
        name,
        positionId: position.position,
        submittedAt,
        sample: { ...SUBMITTED_APPLICANT_SAMPLE, id: sampleId, name, position: position.position },
        submitted,
      },
    ]
  })
}

// 운영진 홈 공고 상태를 따르는 공고와 지원자, 삭제됐거나 단체 공고가 아니면 null
function getPostingApplications(postingId: string) {
  const posting = getManagedPostingSample(postingId)
  const sample = findOrganizationPostingSample(postingId)

  if (!posting || !sample) {
    return null
  }
  return {
    posting,
    sample,
    applications: [
      ...toSubmittedApplications(postingId),
      ...toPostingApplications(postingId, sample.applicantCount),
    ],
  }
}

function findApplication(applicationId: string) {
  for (const { id } of ORGANIZATION_POSTING_SAMPLES) {
    const found = getPostingApplications(id)
    const application = found?.applications.find((item) => item.id === applicationId)
    if (found && application) {
      return { ...found, application }
    }
  }
  return null
}

// 내 처음 의견은 샘플 결과와 같은 의견, 그 의견이 없으면 받은 의견 중 첫 번째
function getMyInitialOpinion({ result, opinionCounts }: SampleApplicant): SampleOpinion {
  if (opinionCounts[result] > 0) {
    return result
  }
  return SAMPLE_OPINIONS.find((opinion) => opinionCounts[opinion] > 0) ?? result
}

function isMyInitiallyEvaluated(
  { sampleId, submitted }: PostingApplication,
  status: PostingStatus,
) {
  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
      return false
    case 'DOC_REVIEW':
      return !submitted && sampleId !== MY_UNEVALUATED_SAMPLE_ID
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return true
  }
}

// 처음 점수는 샘플 평균에 가까운 값으로 모든 답한 문항에 같은 점수
function createMyInitialEvaluation(
  application: PostingApplication,
  status: PostingStatus,
): MyDocEvaluationFieldsFragment | null {
  if (!isMyInitiallyEvaluated(application, status)) {
    return null
  }

  const score = Math.min(
    Math.max(Math.round(application.sample.averageScore), MIN_SCORE),
    MAX_SCORE,
  )
  return {
    id: `evaluation-${application.id}`,
    memo: null,
    updatedAt: application.submittedAt,
    status: 'SAVED',
    opinion: OPINION[getMyInitialOpinion(application.sample)],
    scores: getSampleAnswers(application.sampleId).map(({ question }) => ({
      question: { id: question.id },
      score,
    })),
  }
}

function getMyEvaluation(application: PostingApplication, status: PostingStatus) {
  return myEvaluations.get(application.id) ?? createMyInitialEvaluation(application, status)
}

function getMyEvaluationStatus(
  application: PostingApplication,
  status: PostingStatus,
): MyDocEvaluationStatus {
  return getMyEvaluation(application, status)?.status ?? 'NONE'
}

function saveMyEvaluation(applicationId: string, evaluation: MyDocEvaluationFieldsFragment) {
  myEvaluations.set(applicationId, evaluation)
}

function setDocResultOverride(applicationId: string, docResult: DocResult) {
  docResultOverrides.set(applicationId, docResult)
}

function toSampleOpinion(opinion: Opinion): SampleOpinion {
  switch (opinion) {
    case 'PASS':
      return 'pass'
    case 'HOLD':
      return 'hold'
    case 'FAIL':
      return 'fail'
  }
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10
}

// 모집 중에는 다른 운영진 두 명이 아직 평가 전이라 내 평가만 반영
function hasOtherEvaluations(status: PostingStatus) {
  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
      return false
    case 'DOC_REVIEW':
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return true
  }
}

// 다른 운영진 두 명의 의견·평균은 샘플 값에서 내 처음 의견을 뺀 것, 세 명 모두 저장 완료해야 평가 완료
function getEvaluationSummary(application: PostingApplication, status: PostingStatus) {
  const { sample } = application
  const isOthersEvaluated = hasOtherEvaluations(status)
  const myInitialOpinion = getMyInitialOpinion(sample)
  const mine = getMyEvaluation(application, status)
  const mySavedOpinion =
    mine?.status === 'SAVED' && mine.opinion ? toSampleOpinion(mine.opinion) : null
  const opinionCounts = {
    pass: 0,
    hold: 0,
    fail: 0,
    notEvaluated: (isOthersEvaluated ? 0 : OTHER_EVALUATOR_COUNT) + (mySavedOpinion ? 0 : 1),
  }
  SAMPLE_OPINIONS.forEach((opinion) => {
    const otherCount = isOthersEvaluated
      ? sample.opinionCounts[opinion] - (opinion === myInitialOpinion ? 1 : 0)
      : 0
    opinionCounts[opinion] = otherCount + (opinion === mySavedOpinion ? 1 : 0)
  })

  const myScores = mine?.scores ?? []
  const myAverage =
    mySavedOpinion && myScores.length > 0
      ? myScores.reduce((sum, { score }) => sum + score, 0) / myScores.length
      : null
  const evaluationComplete = isOthersEvaluated && mySavedOpinion !== null
  return {
    docResult: getDocResult(application, status, evaluationComplete),
    averageScore: getAverageScore(sample, myAverage, isOthersEvaluated),
    opinionCounts,
    evaluationComplete,
  }
}

function getAverageScore(
  sample: SampleApplicant,
  myAverage: number | null,
  isOthersEvaluated: boolean,
) {
  if (!isOthersEvaluated) {
    return myAverage === null ? null : roundToTenth(myAverage)
  }
  if (myAverage === null) {
    return sample.averageScore
  }
  return roundToTenth((sample.averageScore * OTHER_EVALUATOR_COUNT + myAverage) / EVALUATOR_COUNT)
}

// 평가 중에는 처음부터 평가를 마친 지원자만 샘플 결과, 새로 평가를 마친 지원자는 결과 선택 전
function getDocResult(
  application: PostingApplication,
  status: PostingStatus,
  evaluationComplete: boolean,
): DocResult {
  if (!evaluationComplete) {
    return 'PENDING'
  }

  const override = docResultOverrides.get(application.id)
  if (override) {
    return override
  }
  if (status === 'DOC_REVIEW') {
    return isMyInitiallyEvaluated(application, status)
      ? REVIEW_DOC_RESULT[application.sample.result]
      : 'PENDING'
  }
  return CONFIRMED_DOC_RESULT[application.sample.result]
}

export {
  findApplication,
  getEvaluationSummary,
  getMyEvaluation,
  getMyEvaluationStatus,
  getPostingApplications,
  saveMyEvaluation,
  setDocResultOverride,
}
export type { PostingApplication }
