import { z } from 'zod'

const POSTING_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const
const POSTING_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024

const PUBLIC_ITEMS = ['region', 'fee'] as const
const QUALIFICATIONS = ['student', 'leaveOfAbsence', 'custom'] as const

const postingInfoSchema = z
  .object({
    title: z.string().trim().min(1),
    mainImage: z.instanceof(File).nullable(),
    publicItems: z.array(z.enum(PUBLIC_ITEMS)),
    region: z.string(),
    fee: z.string(),
    qualifications: z.array(z.enum(QUALIFICATIONS)).min(1),
    customQualification: z.string(),
    content: z.string(),
  })
  .superRefine(({ mainImage }, context) => {
    if (!mainImage) {
      context.addIssue({
        code: 'custom',
        path: ['mainImage'],
        message: '대표 이미지를 추가해 주세요',
      })
    }
  })

type PostingInfoValues = z.infer<typeof postingInfoSchema>
type PublicItem = (typeof PUBLIC_ITEMS)[number]
type Qualification = (typeof QUALIFICATIONS)[number]

const EMPTY_POSTING_INFO = {
  title: '',
  mainImage: null,
  publicItems: [],
  region: '',
  fee: '',
  qualifications: [],
  customQualification: '',
  content: '',
} satisfies PostingInfoValues

export {
  EMPTY_POSTING_INFO,
  POSTING_IMAGE_MAX_SIZE_BYTES,
  POSTING_IMAGE_TYPES,
  PUBLIC_ITEMS,
  QUALIFICATIONS,
  postingInfoSchema,
}
export type { PostingInfoValues, PublicItem, Qualification }
