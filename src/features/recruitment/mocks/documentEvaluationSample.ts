import type { DocEvaluationApplicationDetailQuery, PostingQuestionsQuery } from '@/gql/graphql'

type SampleAttachment =
  DocEvaluationApplicationDetailQuery['application']['answers'][number]['attachments'][number]

const EVALUATION_DETAIL_SAMPLE = {
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
  availableTimes: [
    '2026-10-21T13:00:00+09:00',
    '2026-10-21T14:00:00+09:00',
    '2026-10-22T14:00:00+09:00',
    '2026-10-23T16:00:00+09:00',
  ],
  // 지원서 작성 화면이 보내는 활동 경험 JSON 모양
  activities: [
    {
      name: 'UXUX 디자인 동아리',
      period: '2024.03 ~ 2024.12',
      role: 'UI 디자이너',
      achievement: '도서관 좌석 예약 서비스 리디자인, 우수상 수상',
    },
    {
      name: '교내 UX 스터디',
      period: '2023.09 ~ 2024.02',
      role: '스터디장',
      achievement: '사용성 테스트 방법론 스터디 12주 운영',
    },
    {
      name: '캡스톤 디자인',
      period: '2024.03 ~ 2024.06',
      role: '디자이너',
      achievement: '일정 관리 앱 기획·디자인, 최종 발표 우수상',
    },
  ],
  files: [
    { id: 'work-file-1', type: 'FILE', url: '#', fileName: '포트폴리오_2026.pdf' },
    { id: 'work-file-2', type: 'FILE', url: '#', fileName: '작업물_모음.zip' },
  ] satisfies SampleAttachment[],
  links: [
    {
      id: 'reference-link-1',
      type: 'LINK',
      url: 'https://portfolio.example.com/mozip',
      fileName: null,
    },
    { id: 'reference-link-2', type: 'LINK', url: 'https://code.example.com/mozip', fileName: null },
  ] satisfies SampleAttachment[],
}

const LONG_FORM_ANSWERS = [
  {
    id: 'motivation',
    question: '지원 동기를 작성해 주세요.',
    answer:
      '사용자 인터뷰로 문제를 정의하고 개발자와 함께 결과물을 만들어 보는 경험을 하고 싶어 지원했습니다. 혼자 하는 공부로는 실제 사용자 반응을 확인하기 어려웠습니다.',
  },
  {
    id: 'strength',
    question: '본인의 강점을 프로젝트 경험과 함께 알려 주세요.',
    answer:
      '일정이 밀릴 때 우선순위를 다시 정리하는 역할을 자주 맡았습니다. 해커톤에서 기능 10개 중 핵심 3개만 남기자고 제안해 시간 안에 시연까지 마쳤습니다.',
  },
  {
    id: 'conflict',
    question: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.',
    answer:
      '디자인 시안 변경이 잦아 개발 일정이 밀렸을 때, 완성 기준을 함께 정하는 회의를 제안했습니다. 이후 매주 변경 사항을 짧게 공유하는 시간을 만들었습니다.',
  },
  {
    id: 'failure',
    question: '실패했던 경험과 그 경험에서 배운 점을 알려 주세요.',
    answer:
      '첫 프로젝트에서 사용자 조사 없이 기능을 만들었다가 아무도 쓰지 않는 결과가 나왔습니다. 이후에는 만들기 전에 최소 5명에게 먼저 묻는 습관을 들였습니다.',
  },
  {
    id: 'tool',
    question: '자주 쓰는 도구와 활용 방식을 알려 주세요.',
    answer:
      'Figma로 화면 흐름을 먼저 그리고, 컴포넌트를 나눠 개발자에게 넘깁니다. 인터뷰 기록은 노트 앱에 태그를 달아 정리합니다.',
  },
  {
    id: 'plan',
    question: '활동 기간 동안 이루고 싶은 목표를 알려 주세요.',
    answer:
      '기업 연계 프로젝트에서 리서치부터 검증까지 한 사이클을 끝까지 경험하고, 그 과정을 글로 정리해 다음 기수와 나누고 싶습니다.',
  },
]

// 점수 문항이 많아 평가 패널이 창보다 길어지는 경우 확인용
const LONG_FORM_DETAIL_SAMPLE: typeof EVALUATION_DETAIL_SAMPLE = {
  ...EVALUATION_DETAIL_SAMPLE,
  answers: LONG_FORM_ANSWERS.map(({ id, question, answer }) => ({
    id,
    question,
    answer,
    maxLength: 300,
  })),
}

const DETAIL_SAMPLE_BY_ID: Partial<Record<string, typeof EVALUATION_DETAIL_SAMPLE>> = {
  '4': LONG_FORM_DETAIL_SAMPLE,
}

// 지원서 상세 MSW 응답의 답변·면접 가능 시간·첨부
function getApplicationDetailSample(applicantId: string) {
  return DETAIL_SAMPLE_BY_ID[applicantId] ?? EVALUATION_DETAIL_SAMPLE
}

// 서술형 답변 뒤에 활동 경험, 그 뒤 파일·링크 문항
const ACTIVITY_SORT_ORDER = 100
const FILE_LINK_SORT_ORDER = 101

// 공고의 서술형 문항 순서, 샘플마다 답한 서술형 문항 수가 달라 나머지는 비운 문항
const SAMPLE_TEXT_QUESTION_IDS = ['motivation', 'conflict', 'strength', 'failure', 'tool', 'plan']
const ACTIVITY_QUESTION_ID = 'activity'
const FILE_LINK_QUESTION_IDS = ['work-files', 'reference-links'] as const

// 활동 경험(선택)을 비운 지원자, 백엔드처럼 비운 문항은 answers에서 뺌
const SKIPPED_ANSWER_APPLICANT_ID = '4'

// 기본 샘플이 답한 두 문항만 필수, 나머지 서술형은 선택이라 안 쓴 지원자는 미응답 카드
const TEXT_QUESTION_SETTING: Partial<Record<string, { title: string; maxLength: number }>> = {
  ...Object.fromEntries(
    LONG_FORM_DETAIL_SAMPLE.answers.map(({ id, question, maxLength }) => [
      id,
      { title: question, maxLength },
    ]),
  ),
  ...Object.fromEntries(
    EVALUATION_DETAIL_SAMPLE.answers.map(({ id, question, maxLength }) => [
      id,
      { title: question, maxLength },
    ]),
  ),
}
const REQUIRED_TEXT_QUESTION_IDS = EVALUATION_DETAIL_SAMPLE.answers.map(({ id }) => id)

const ACTIVITY_QUESTION = {
  title: '활동 경험을 입력해 주세요.',
  description: '최근 활동부터 최대 3개까지 입력해 주세요.',
  required: false,
  maxLength: null,
  options: {
    activityFields: ['NAME' as const, 'PERIOD' as const, 'ROLE' as const, 'ACHIEVEMENT' as const],
  },
}
const FILE_LINK_QUESTION_TITLES = [
  '작업물 파일을 첨부해 주세요.',
  '참고할 수 있는 링크를 첨부해 주세요.',
]

// 모든 샘플 공고가 같은 공통 문항 사용
const SAMPLE_POSTING_QUESTIONS: PostingQuestionsQuery['posting']['questions'] = [
  ...SAMPLE_TEXT_QUESTION_IDS.map((id, index) => ({
    id,
    type: 'TEXT' as const,
    title: TEXT_QUESTION_SETTING[id]?.title ?? id,
    description: null,
    required: REQUIRED_TEXT_QUESTION_IDS.includes(id),
    maxLength: TEXT_QUESTION_SETTING[id]?.maxLength ?? null,
    sortOrder: index,
    position: null,
    options: null,
  })),
  {
    ...ACTIVITY_QUESTION,
    id: ACTIVITY_QUESTION_ID,
    type: 'ACTIVITY',
    sortOrder: ACTIVITY_SORT_ORDER,
    position: null,
  },
  ...FILE_LINK_QUESTION_IDS.map((id, index) => ({
    id,
    type: 'FILE_LINK' as const,
    title: FILE_LINK_QUESTION_TITLES[index] ?? id,
    description: null,
    required: true,
    maxLength: null,
    sortOrder: FILE_LINK_SORT_ORDER + index,
    position: null,
    options: null,
  })),
]

// 문항 ID는 답변 ID와 같게, 서술형 뒤에 활동 경험과 파일·링크 문항, 샘플 지원자 번호 기준
function getSampleAnswers(applicantId: string) {
  const detail = getApplicationDetailSample(applicantId)
  const textAnswers = detail.answers.map(({ id, question, answer, maxLength }) => ({
    id,
    question: {
      id,
      type: 'TEXT' as const,
      title: question,
      description: null,
      required: true,
      maxLength,
      sortOrder: SAMPLE_TEXT_QUESTION_IDS.indexOf(id),
      options: null,
    },
    content: answer,
    attachments: [],
  }))
  const activityAnswer = {
    id: ACTIVITY_QUESTION_ID,
    question: {
      ...ACTIVITY_QUESTION,
      id: ACTIVITY_QUESTION_ID,
      type: 'ACTIVITY' as const,
      sortOrder: ACTIVITY_SORT_ORDER,
    },
    content: JSON.stringify(detail.activities),
    attachments: [],
  }
  const fileLinkAnswers = [detail.files, detail.links].map((attachments, index) => {
    const id = FILE_LINK_QUESTION_IDS[index] ?? String(index)

    return {
      id,
      question: {
        id,
        type: 'FILE_LINK' as const,
        title: FILE_LINK_QUESTION_TITLES[index] ?? id,
        description: null,
        required: true,
        maxLength: null,
        sortOrder: FILE_LINK_SORT_ORDER + index,
        options: null,
      },
      content: null,
      attachments,
    }
  })

  const answers = [...textAnswers, activityAnswer, ...fileLinkAnswers]
  return applicantId === SKIPPED_ANSWER_APPLICANT_ID
    ? answers.filter(({ question }) => question.id !== ACTIVITY_QUESTION_ID)
    : answers
}

export { getApplicationDetailSample, getSampleAnswers, SAMPLE_POSTING_QUESTIONS }
