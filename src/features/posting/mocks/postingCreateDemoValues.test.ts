import { describe, expect, it } from 'vitest'
import { postingFormSchema } from '@/features/posting/schemas/postingFormSchema'
import { postingInfoSchema } from '@/features/posting/schemas/postingInfoSchema'
import { postingInterviewSchema } from '@/features/posting/schemas/postingInterviewSchema'
import { postingMethodSchema } from '@/features/posting/schemas/postingMethodSchema'
import { getPostingScheduleSchema } from '@/features/posting/schemas/postingScheduleSchema'
import { createDemoPostingValues } from './postingCreateDemoValues'

const TODAY = '2026-11-26'
// 시연하는 사람이 직접 넣는 값
const VISITOR_INPUT = {
  title: '포토부스 동아리 1기 모집',
  mainImage: new File(['photo'], 'photo.png', { type: 'image/png' }),
}

describe('createDemoPostingValues', () => {
  it('제목·대표 이미지를 넣으면 면접 공고의 모든 입력 단계 통과', () => {
    const values = { ...createDemoPostingValues(true, TODAY), ...VISITOR_INPUT }

    expect(postingInfoSchema.safeParse(values).success).toBe(true)
    expect(getPostingScheduleSchema(true).safeParse(values).success).toBe(true)
    expect(postingMethodSchema.safeParse(values).success).toBe(true)
    expect(postingFormSchema.safeParse(values).success).toBe(true)
    expect(postingInterviewSchema.safeParse(values).success).toBe(true)
  })

  it('비면접 공고는 서류 발표일과 면접 값 없이 일정 통과', () => {
    const values = createDemoPostingValues(false, TODAY)

    expect(getPostingScheduleSchema(false).safeParse(values).success).toBe(true)
    expect(values.documentResultDate).toBeNull()
    expect(values.interviewSlots).toEqual([])
  })

  it('제목·대표 이미지·지원서 문항은 비워 시연에서 직접 입력', () => {
    const values = createDemoPostingValues(true, TODAY)

    expect(values.title).toBe('')
    expect(values.mainImage).toBeNull()
    expect(values.questionSets).toEqual([])
    expect(postingInfoSchema.safeParse(values).success).toBe(false)
  })
})
