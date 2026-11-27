import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_CREATE,
  type PostingCreateValues,
} from '@/features/posting/schemas/postingCreateValues'
import type { PostingQuestion } from '@/features/posting/schemas/postingFormSchema'
import { toDraftStepInput, type DraftInputContext } from './postingDraftInput'
import { createQuestion } from './postingQuestions'

const EMPTY_CONTEXT = { savedPositions: [] } satisfies DraftInputContext

function question(overrides: Partial<PostingQuestion> & Pick<PostingQuestion, 'type'>) {
  return { ...createQuestion(overrides.type), ...overrides }
}

function values(overrides: Partial<PostingCreateValues>): PostingCreateValues {
  return { ...EMPTY_POSTING_CREATE, ...overrides }
}

describe('toDraftStepInput', () => {
  it('공고 정보: 끈 공개 항목은 null(지움), 지원 자격 체크를 서버 값으로, 면접 여부 포함, 저장된 이미지만 있으면 생략', () => {
    const input = toDraftStepInput(
      'info',
      values({
        title: '  UXUX 14기  ',
        savedMainImageUrl: 'https://cdn/saved.png',
        publicItems: ['fee'],
        region: '서울 마포구',
        fee: '30000',
        qualifications: ['student', 'custom'],
        customQualification: ' 졸업 예정자 가능 ',
        content: '<p>함께해요</p>',
      }),
      false,
      EMPTY_CONTEXT,
    )

    expect(input).toEqual({
      title: 'UXUX 14기',
      content: '<p>함께해요</p>',
      region: null,
      fee: '30000',
      allowEnrolled: true,
      allowOnLeave: false,
      eligibilityNote: '졸업 예정자 가능',
      hasInterview: false,
    })
  })

  it('공고 정보: 새로 업로드한 이미지는 대표 이미지 한 장으로 전송', () => {
    const input = toDraftStepInput('info', values({}), true, {
      ...EMPTY_CONTEXT,
      mainImageFileKey: 'posting_image/main.png',
    })

    expect(input.images).toEqual([
      { fileKey: 'posting_image/main.png', sortOrder: 0, isRepresentative: true },
    ])
  })

  it('공고 정보: 새 이미지도 저장된 이미지도 없으면 빈 배열로 서버 이미지 삭제', () => {
    const input = toDraftStepInput('info', values({ savedMainImageUrl: null }), true, EMPTY_CONTEXT)

    expect(input.images).toEqual([])
  })

  it('모집 일정: 시간 미선택은 시작 00:00·마감 23:59, 발표일은 보내지 않음', () => {
    const input = toDraftStepInput(
      'schedule',
      values({
        recruitStartDate: '2026-10-01',
        recruitEndDate: '2026-10-07',
        recruitEndTime: '18:00',
        documentResultDate: '2026-10-10',
        finalResultDate: '2026-10-20',
        activityStartDate: '2026-11-01',
      }),
      true,
      EMPTY_CONTEXT,
    )

    expect(input).toEqual({
      recruitStartAt: '2026-10-01T00:00:00+09:00',
      recruitEndAt: '2026-10-07T18:00:00+09:00',
      activityStartedOn: '2026-11-01',
      activityEndedOn: null,
    })
  })

  it('모집 방식: 미선택은 빈 입력, 통합은 noPosition만, 포지션별은 이름과 순서', () => {
    expect(toDraftStepInput('method', values({}), false, EMPTY_CONTEXT)).toEqual({})
    expect(
      toDraftStepInput('method', values({ recruitType: 'integrated' }), false, EMPTY_CONTEXT),
    ).toEqual({ noPosition: true })
    expect(
      toDraftStepInput(
        'method',
        values({ recruitType: 'position', positions: [{ name: '디자인팀' }, { name: '개발팀' }] }),
        false,
        EMPTY_CONTEXT,
      ),
    ).toEqual({
      noPosition: false,
      positions: [
        { name: '디자인팀', sortOrder: 0 },
        { name: '개발팀', sortOrder: 1 },
      ],
    })
  })

  it('모집 방식: 저장된 포지션과 이름·순서가 같으면 다시 만들지 않도록 positions 생략', () => {
    const savedPositions = [
      { id: 'p1', name: '디자인팀' },
      { id: 'p2', name: '개발팀' },
    ]
    const toInput = (names: string[]) =>
      toDraftStepInput(
        'method',
        values({ recruitType: 'position', positions: names.map((name) => ({ name })) }),
        false,
        { savedPositions },
      )

    expect(toInput(['디자인팀', '개발팀'])).toEqual({ noPosition: false })
    expect(toInput(['개발팀', '디자인팀']).positions).toEqual([
      { name: '개발팀', sortOrder: 0 },
      { name: '디자인팀', sortOrder: 1 },
    ])
    expect(toInput(['디자인팀']).positions).toEqual([{ name: '디자인팀', sortOrder: 0 }])
  })

  it('지원서 양식: 포지션 순서대로 positionId, 탭 안 순서, 글 문항만 글자 수', () => {
    const intro = question({ type: 'text', title: ' 자기소개 ', maxLength: '700' })
    const portfolio = question({ type: 'file', title: '포트폴리오', description: '  ' })
    const input = toDraftStepInput(
      'form',
      values({
        recruitType: 'position',
        questionSets: [{ questions: [intro, portfolio] }, { questions: [intro] }],
      }),
      false,
      {
        savedPositions: [
          { id: 'p1', name: '디자인팀' },
          { id: 'p2', name: '개발팀' },
        ],
      },
    )

    expect(input.questions).toEqual([
      {
        positionId: 'p1',
        type: 'TEXT',
        title: '자기소개',
        description: null,
        required: intro.isRequired,
        maxLength: 700,
        sortOrder: 0,
      },
      {
        positionId: 'p1',
        type: 'FILE_LINK',
        title: '포트폴리오',
        description: null,
        required: portfolio.isRequired,
        maxLength: null,
        sortOrder: 1,
      },
      expect.objectContaining({ positionId: 'p2', type: 'TEXT', sortOrder: 0 }),
    ])
  })

  it('지원서 양식: 통합 모집은 positionId null, 서버에 없는 활동 경험 문항은 빼고 순서를 다시 매김', () => {
    const input = toDraftStepInput(
      'form',
      values({
        recruitType: 'integrated',
        questionSets: [
          {
            questions: [
              question({ type: 'activity', title: '활동' }),
              question({ type: 'text', title: '지원 동기' }),
            ],
          },
        ],
      }),
      false,
      { savedPositions: [{ id: 'p1', name: '디자인팀' }] },
    )

    expect(input.questions).toEqual([
      expect.objectContaining({ positionId: null, title: '지원 동기', sortOrder: 0 }),
    ])
  })

  it('면접 시간: 이어진 30분 칸을 날짜별 시작·종료 블록으로, 선택 값은 숫자로', () => {
    const input = toDraftStepInput(
      'interview',
      values({
        interviewDuration: '30',
        interviewBreak: '10',
        interviewDates: ['2026-10-12', '2026-10-13'],
        interviewSlots: [
          '2026-10-13T13:00',
          '2026-10-12T09:00',
          '2026-10-12T09:30',
          '2026-10-12T11:00',
        ],
        interviewApplicantCount: '2',
        interviewRoomCount: null,
      }),
      true,
      EMPTY_CONTEXT,
    )

    expect(input).toEqual({
      interviewMinutes: 30,
      breakMinutes: 10,
      interviewTimeRanges: [
        { positionId: null, date: '2026-10-12', startTime: '09:00', endTime: '10:00' },
        { positionId: null, date: '2026-10-12', startTime: '11:00', endTime: '11:30' },
        { positionId: null, date: '2026-10-13', startTime: '13:00', endTime: '13:30' },
      ],
      maxApplicantsPerInterview: 2,
      maxParallelInterviews: null,
    })
  })
})
