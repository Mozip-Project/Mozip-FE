import { z } from 'zod'

// TODO: 백엔드 enum 확정 후 값 교체
const GRADES = ['year1', 'year2', 'year3', 'year4', 'year5OrMore', 'graduationDeferred'] as const

type Grade = (typeof GRADES)[number]

type ApplicationInfoRule = {
  // 지원할 수 있는(아직 지원하지 않은) 포지션 id, null은 포지션 없는 모집
  selectablePositionIds: readonly string[] | null
  requiresProfilePhoto: boolean
  hasSavedPhoto: boolean
}

function createApplicationInfoSchema({
  selectablePositionIds,
  requiresProfilePhoto,
  hasSavedPhoto,
}: ApplicationInfoRule) {
  return z
    .object({
      positionId: z.string(),
      department: z.string().trim().min(1, '학과를 입력해 주세요'),
      grade: z.enum(GRADES).nullable(),
      // 이번에 새로 고른 사진
      photo: z.instanceof(File).nullable(),
    })
    .superRefine(({ positionId, grade, photo }, context) => {
      if (selectablePositionIds && !selectablePositionIds.includes(positionId)) {
        context.addIssue({ code: 'custom', path: ['positionId'] })
      }
      if (!grade) {
        context.addIssue({ code: 'custom', path: ['grade'], message: '학년을 선택해 주세요' })
      }
      if (requiresProfilePhoto && !hasSavedPhoto && !photo) {
        context.addIssue({ code: 'custom', path: ['photo'] })
      }
    })
}

type ApplicationInfoValues = z.input<ReturnType<typeof createApplicationInfoSchema>>

const EMPTY_APPLICATION_INFO = {
  positionId: '',
  department: '',
  grade: null,
  photo: null,
} satisfies ApplicationInfoValues

export { createApplicationInfoSchema, EMPTY_APPLICATION_INFO, GRADES }
export type { ApplicationInfoRule, ApplicationInfoValues, Grade }
