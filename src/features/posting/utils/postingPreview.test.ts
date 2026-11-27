import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import type { PostingQuestion } from '@/features/posting/schemas/postingFormSchema'
import { getPreviewApplicationForms, toPostingPreviewDetail } from './postingPreview'

const TEXT_QUESTION: PostingQuestion = {
  id: 'q1',
  type: 'text',
  title: '지원 동기를 작성해 주세요.',
  description: ' ',
  maxLength: '500',
  isRequired: true,
  acceptsFile: false,
  acceptsLink: false,
  fileTypes: [],
  activityFields: [],
  maxActivityCount: 3,
}

const FILE_QUESTION: PostingQuestion = {
  ...TEXT_QUESTION,
  id: 'q2',
  type: 'file',
  title: '포트폴리오',
  description: '링크도 가능해요',
  isRequired: false,
  acceptsFile: true,
  acceptsLink: true,
  fileTypes: ['pdf'],
}

const VALUES: PostingCreateValues = {
  ...EMPTY_POSTING_CREATE,
  title: ' UXUX 14기 신입 부원 모집 ',
  publicItems: ['fee'],
  region: '신촌',
  fee: '30000',
  qualifications: ['student', 'custom'],
  customQualification: '1~3학년',
  content: '<h2>소개</h2><p>함께해요</p>',
  recruitStartDate: '2026-10-01',
  recruitEndDate: '2026-10-15',
  recruitEndTime: '18:00',
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-27',
  recruitType: 'position',
  positions: [{ name: '디자인' }, { name: '개발' }],
  questionSets: [{ questions: [TEXT_QUESTION] }, { questions: [TEXT_QUESTION, FILE_QUESTION] }],
  interviewDates: ['2026-10-22', '2026-10-21'],
  interviewSlots: ['2026-10-22T13:00', '2026-10-21T13:00'],
}

describe('toPostingPreviewDetail', () => {
  it('공개하기로 한 항목만 채우고 모집 시각은 기본 시각으로 보완', () => {
    const detail = toPostingPreviewDetail(VALUES, true)

    expect(detail).toMatchObject({
      title: 'UXUX 14기 신입 부원 모집',
      eligibility: '대학생 (1~3학년)',
      activityArea: null,
      membershipFee: '30,000',
      recruitmentStartsAt: '2026-10-01T00:00:00+09:00',
      recruitmentEndsAt: '2026-10-15T18:00:00+09:00',
      interviewPeriod: { startDate: '2026-10-21', endDate: '2026-10-22' },
    })
    expect(detail.content).toEqual([
      { type: 'heading', text: '소개' },
      { type: 'paragraph', runs: [{ text: '함께해요' }] },
    ])
  })

  it('포지션별 문항 끝에 면접 가능 시간을 붙이고, 면접 없는 모집은 문항만', () => {
    const [, development] = toPostingPreviewDetail(VALUES, true).positions

    expect(development?.name).toBe('개발')
    expect(development?.questions.map(({ title }) => title)).toEqual([
      '지원 동기를 작성해 주세요.',
      '포트폴리오',
      '면접 가능 시간 선택',
    ])

    const withoutInterview = toPostingPreviewDetail(VALUES, false)

    expect(withoutInterview.interviewPeriod).toBeNull()
    expect(withoutInterview.documentResultDate).toBe('2026-10-27')
    expect(withoutInterview.positions[0]?.questions).toEqual([
      { id: 'q1', title: '지원 동기를 작성해 주세요.' },
    ])
  })
})

describe('getPreviewApplicationForms', () => {
  it('포지션마다 지원서 문항으로 바꾸고 면접 가능 시간은 시각 순서로', () => {
    const [design, development] = getPreviewApplicationForms(VALUES, true)

    expect(design?.positionName).toBe('디자인')
    expect(design?.questions[0]).toEqual({
      id: 'q1',
      type: 'text',
      title: '지원 동기를 작성해 주세요.',
      description: null,
      isRequired: true,
      maxLength: 500,
    })
    expect(development?.questions.map(({ type }) => type)).toEqual(['text', 'file', 'availability'])
    expect(development?.questions.at(-1)).toMatchObject({
      interviewSlots: ['2026-10-21T13:00', '2026-10-22T13:00'],
    })
  })

  it('통합 모집은 포지션 이름 없는 지원서 하나', () => {
    const forms = getPreviewApplicationForms(
      { ...VALUES, recruitType: 'integrated', positions: [] },
      false,
    )

    expect(forms).toHaveLength(1)
    expect(forms[0]?.positionName).toBeNull()
    expect(forms[0]?.questions).toHaveLength(1)
  })
})
