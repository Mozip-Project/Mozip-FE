import { z } from 'zod'

const POSTING_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const
const POSTING_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024

const PUBLIC_ITEMS = ['region', 'fee'] as const

// 서버 저장 제한과 같은 글자 수. 회비는 숫자만 받아 제한 없음
const POSTING_INFO_MAX_LENGTH = {
  title: 100,
  region: 100,
  customQualification: 200,
} as const
const QUALIFICATIONS = ['student', 'leaveOfAbsence', 'custom'] as const

// 체크하면 나타나는 입력 칸의 빈칸 안내. 검사와 화면 문구를 한 곳에서 관리
const OPTION_INPUT_REQUIRED_MESSAGE = {
  region: '활동 지역을 입력해 주세요',
  fee: '회비를 입력해 주세요',
  customQualification: '지원 자격을 입력해 주세요',
} as const

type OptionInputName = keyof typeof OPTION_INPUT_REQUIRED_MESSAGE

function validateOptionInput(name: OptionInputName, value: string) {
  return value.trim() !== '' || OPTION_INPUT_REQUIRED_MESSAGE[name]
}

const postingInfoSchema = z
  .object({
    title: z.string().trim().min(1),
    mainImage: z.instanceof(File).nullable(),
    // 이어서 작성할 때 서버에 이미 올라간 대표 이미지. 새 파일을 고르면 파일이 우선
    savedMainImageUrl: z.string().nullable(),
    publicItems: z.array(z.enum(PUBLIC_ITEMS)),
    region: z.string(),
    fee: z.string(),
    qualifications: z.array(z.enum(QUALIFICATIONS)).min(1),
    customQualification: z.string(),
    content: z.string(),
  })
  .superRefine((values, context) => {
    if (!values.mainImage && !values.savedMainImageUrl) {
      context.addIssue({
        code: 'custom',
        path: ['mainImage'],
        message: '대표 이미지를 추가해 주세요',
      })
    }
    const openedInputs: OptionInputName[] = [
      ...values.publicItems,
      ...(values.qualifications.includes('custom') ? (['customQualification'] as const) : []),
    ]
    for (const name of openedInputs) {
      const result = validateOptionInput(name, values[name])
      if (result !== true) {
        context.addIssue({ code: 'custom', path: [name], message: result })
      }
    }
  })

type PostingInfoValues = z.infer<typeof postingInfoSchema>
type PublicItem = (typeof PUBLIC_ITEMS)[number]
type Qualification = (typeof QUALIFICATIONS)[number]

const EMPTY_POSTING_INFO = {
  title: '',
  mainImage: null,
  savedMainImageUrl: null,
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
  POSTING_INFO_MAX_LENGTH,
  POSTING_IMAGE_TYPES,
  PUBLIC_ITEMS,
  QUALIFICATIONS,
  postingInfoSchema,
  validateOptionInput,
}
export type { PostingInfoValues, PublicItem, Qualification }
