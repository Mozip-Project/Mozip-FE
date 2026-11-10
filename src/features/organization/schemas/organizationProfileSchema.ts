import { z } from 'zod'

const INTRODUCTION_MAX_LENGTH = 40
const KEYWORD_MAX_COUNT = 10

const ACTIVITY_CATEGORIES = [
  '학술 · 스터디',
  'IT · 개발',
  '디자인 · 미디어',
  '공연 · 음악',
  '체육 · 스포츠',
  '문화 · 취미',
  '봉사 · 사회참여',
  '어학 · 국제교류',
  '창업 · 비즈니스',
  '종교',
  '기타',
] as const

const organizationProfileSchema = z.object({
  logo: z.instanceof(File).nullable(),
  introduction: z.string().trim().min(1).max(INTRODUCTION_MAX_LENGTH),
  categories: z.array(z.enum(ACTIVITY_CATEGORIES)),
  keywords: z.array(z.string()).min(1).max(KEYWORD_MAX_COUNT),
  links: z.array(z.object({ url: z.string().trim().min(1) })).min(1),
})

function createOrganizationProfileSchema(isStudentCouncil: boolean) {
  return organizationProfileSchema.superRefine(({ logo, categories }, context) => {
    if (!logo) {
      context.addIssue({ code: 'custom', path: ['logo'], message: '로고를 업로드해 주세요' })
    }

    if (!isStudentCouncil && categories.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['categories'],
        message: '활동 분야를 선택해 주세요',
      })
    }
  })
}

type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]
type OrganizationProfileValues = z.infer<typeof organizationProfileSchema>

export {
  ACTIVITY_CATEGORIES,
  INTRODUCTION_MAX_LENGTH,
  KEYWORD_MAX_COUNT,
  createOrganizationProfileSchema,
}
export type { ActivityCategory, OrganizationProfileValues }
