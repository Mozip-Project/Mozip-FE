import { z } from 'zod'

const RECRUIT_TYPES = ['position', 'integrated'] as const

const postingMethodSchema = z.object({
  recruitType: z.enum(RECRUIT_TYPES).nullable(),
  positions: z.array(z.object({ name: z.string() })),
})

type PostingMethodValues = z.infer<typeof postingMethodSchema>
type RecruitType = (typeof RECRUIT_TYPES)[number]

const EMPTY_POSTING_METHOD = {
  recruitType: null,
  positions: [],
} satisfies PostingMethodValues

// 앞뒤 공백을 지운 뒤 비어 있으면 추가 불가
const positionNameSchema = z.object({ name: z.string().trim().min(1) })

type PositionNameValues = z.infer<typeof positionNameSchema>

const requiredPostingMethodSchema = postingMethodSchema.superRefine(
  ({ recruitType, positions }, context) => {
    if (!recruitType) {
      context.addIssue({
        code: 'custom',
        path: ['recruitType'],
        message: '모집 유형을 선택해 주세요',
      })
    }
    if (recruitType === 'position' && positions.length === 0) {
      context.addIssue({ code: 'custom', path: ['positions'], message: '포지션을 추가해 주세요' })
    }
  },
)

export {
  EMPTY_POSTING_METHOD,
  positionNameSchema,
  RECRUIT_TYPES,
  requiredPostingMethodSchema as postingMethodSchema,
}
export type { PositionNameValues, PostingMethodValues, RecruitType }
