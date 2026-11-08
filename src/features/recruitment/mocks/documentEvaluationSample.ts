import type { StripApplicant } from '@/components/ui/ApplicantChipStrip/applicantChipStrip'
import type { Attachment } from '@/components/ui/AttachmentCard/attachmentCard'
import { DOCUMENT_REVIEW_SAMPLE } from '@/features/recruitment/api/documentReviewSample'
import type { ScoreQuestion } from '@/features/recruitment/components/documentEvaluation/scoreField'
import type { DocumentEvaluationValues } from '@/features/recruitment/schemas/documentEvaluationSchema'
import { DOCUMENT_REVIEW_POSITION_LABEL } from '@/features/recruitment/types'

const EVALUATION_DETAIL_SAMPLE = {
  education: '성균관대학교 컴퓨터공학과 3학년',
  phone: '010-0000-0000',
  email: 'mozip@example.com',
  answers: [
    {
      id: 'motivation',
      question: 'UXUX에 지원한 동기를 작성해 주세요.',
      answer:
        'UX 리서치를 혼자 공부하면서 실제 사용자를 만나 가설을 검증해 본 경험이 부족하다는 걸 느꼈습니다. 지난 학기 교내 도서관 좌석 예약 서비스를 개선하는 수업 프로젝트에서 학생 12명을 인터뷰하고 사용성 테스트를 진행했는데, 팀이 예상했던 문제와 전혀 다른 불편을 발견하면서 리서치의 힘을 실감했습니다.\n\nUXUX에서는 다양한 전공의 사람들과 실제 문제를 함께 정의하고, 리서치부터 프로토타입, 검증까지 한 사이클을 끝까지 경험해 보고 싶습니다. 특히 매 기수 진행하는 기업 연계 프로젝트에 참여해 제 결과물이 실제 사용자에게 닿는 과정을 배우고, 제가 가진 인터뷰 설계 경험을 팀에 나누고 싶어 지원했습니다.',
      maxLength: 500,
    },
    {
      id: 'conflict',
      question: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.',
      answer:
        "3학년 1학기 캡스톤 프로젝트에서 디자이너 2명, 개발자 3명이 함께 동아리 일정 관리 앱을 만들었습니다. 중간 발표를 2주 앞두고 개발 일정이 밀리면서, 디자인 시안을 계속 바꾸는 디자이너와 구현 범위를 줄이자는 개발자 사이에 갈등이 생겼습니다.\n\n저는 양쪽의 이야기를 따로 듣고, 문제의 원인이 '완성 기준이 서로 다르다'는 데 있다고 판단했습니다. 그래서 핵심 사용 흐름 3개를 함께 정하고, 그 흐름에 필요한 화면만 우선순위로 확정하는 회의를 제안했습니다. 이후 매주 월요일 15분씩 디자인 변경 사항을 공유하는 시간을 만들어 같은 문제가 반복되지 않도록 했습니다.\n\n그 결과 중간 발표 일정을 지킬 수 있었고, 최종 발표에서는 사용성 테스트 결과까지 포함해 우수상을 받았습니다. 이 경험으로 갈등은 사람보다 기준의 차이에서 생기는 경우가 많다는 것을 배웠습니다.",
      maxLength: 700,
    },
  ],
  availableSlots: ['10/21 (수) 13:00', '10/21 (수) 14:00', '10/22 (목) 14:00', '10/23 (금) 16:00'],
  attachments: [
    { type: 'file', name: '포트폴리오_2026.pdf', meta: 'PDF · 4.2MB', href: '#' },
    {
      type: 'link',
      name: 'behance.net/mozip',
      meta: '외부 링크',
      href: 'https://www.behance.net/',
    },
  ] satisfies Attachment[],
  scoreQuestions: [
    { id: 'motivation', label: '지원 동기' },
    { id: 'conflict', label: '갈등 해결 경험' },
  ] satisfies ScoreQuestion[],
}

// 일부만 입력하고 넘어간 임시저장 평가, 다시 들어오면 빠진 항목 오류 표시 확인용
const DRAFT_EVALUATION_SAMPLE: Partial<Record<string, DocumentEvaluationValues>> = {
  '3': { opinion: 'hold', scores: { motivation: '4' }, memo: '' },
}

const EVALUATION_STRIP_SAMPLE: StripApplicant[] = DOCUMENT_REVIEW_SAMPLE.map(
  ({ id, name, isEvaluated }) => ({ id, name, isDone: isEvaluated }),
)

// 목록 샘플의 지원자만 상세를 갖고, 없는 id는 undefined
function getDocumentEvaluationSample(applicantId: string) {
  const applicant = DOCUMENT_REVIEW_SAMPLE.find(({ id }) => id === applicantId)

  if (!applicant) {
    return undefined
  }

  return {
    ...EVALUATION_DETAIL_SAMPLE,
    id: applicant.id,
    name: applicant.name,
    position: DOCUMENT_REVIEW_POSITION_LABEL[applicant.position],
    savedEvaluation: DRAFT_EVALUATION_SAMPLE[applicant.id] ?? null,
  }
}

export { EVALUATION_STRIP_SAMPLE, getDocumentEvaluationSample }
