import { z } from 'zod'

const RECRUIT_TYPES = ['position', 'integrated'] as const

// 서버 저장 제한과 같은 글자 수
const POSITION_NAME_MAX_LENGTH = 50

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

// 앞뒤 공백을 지운 뒤 비었거나 이미 추가한 이름이면 추가 불가
function createPositionNameSchema(existingNames: readonly string[]) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, '포지션을 입력해 주세요')
      .refine((name) => !existingNames.includes(name), '이미 추가한 포지션이에요'),
  })
}

type PositionNameValues = z.infer<ReturnType<typeof createPositionNameSchema>>

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
  createPositionNameSchema,
  POSITION_NAME_MAX_LENGTH,
  RECRUIT_TYPES,
  requiredPostingMethodSchema as postingMethodSchema,
}
export type { PositionNameValues, PostingMethodValues, RecruitType }
