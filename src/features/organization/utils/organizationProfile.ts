import type {
  ActivityCategory,
  OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import type {
  OrganizationField,
  OrganizationProfileFieldsFragment,
  OrganizationScope,
  OrganizationType,
  UpdateOrganizationInput,
} from '@/gql/graphql'

const ORGANIZATION_TYPE_LABEL = {
  CLUB: '동아리',
  ACADEMIC: '학회',
  STUDENT_COUNCIL: '학생회',
} satisfies Record<OrganizationType, string>

const ORGANIZATION_SCOPE_LABEL = {
  CAMPUS: '교내',
  UNION: '연합',
} satisfies Record<OrganizationScope, string>

type OrganizationSummary = {
  type: string
  scope: string
  // 연합 단체는 학교가 없어 학교 칸을 숨김
  school: string | null
}

function toOrganizationSummary(
  organization: Pick<OrganizationProfileFieldsFragment, 'type' | 'scope' | 'school'>,
): OrganizationSummary {
  return {
    type: ORGANIZATION_TYPE_LABEL[organization.type],
    scope: ORGANIZATION_SCOPE_LABEL[organization.scope],
    school: organization.school?.name ?? null,
  }
}

const ACTIVITY_CATEGORY_BY_FIELD = {
  ACADEMIC_STUDY: '학술 · 스터디',
  IT_DEV: 'IT · 개발',
  DESIGN_MEDIA: '디자인 · 미디어',
  PERFORMANCE_MUSIC: '공연 · 음악',
  SPORTS: '체육 · 스포츠',
  CULTURE_HOBBY: '문화 · 취미',
  VOLUNTEER: '봉사 · 사회참여',
  LANGUAGE_GLOBAL: '어학 · 국제교류',
  STARTUP_BUSINESS: '창업 · 비즈니스',
  RELIGION: '종교',
  ETC: '기타',
} satisfies Record<OrganizationField, ActivityCategory>

// 위 표를 뒤집은 값, fromEntries가 키 타입을 잃어 단언하고 왕복 테스트로 누락 확인
const FIELD_BY_ACTIVITY_CATEGORY = Object.fromEntries(
  Object.entries(ACTIVITY_CATEGORY_BY_FIELD).map(([field, category]) => [category, field]),
) as Record<ActivityCategory, OrganizationField>

const HTTP_URL_PATTERN = /^https?:\/\//i

// 서버는 http·https 링크만 받아 프로토콜 없이 입력한 주소는 https로 보냄
function toHttpUrl(url: string) {
  const trimmedUrl = url.trim()
  return HTTP_URL_PATTERN.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
}

function isStudentCouncil({ type }: Pick<OrganizationProfileFieldsFragment, 'type'>) {
  return type === 'STUDENT_COUNCIL'
}

// 로고는 파일 업로드 전용 입력이라 기존 로고는 logoUrl로 따로 표시
function toOrganizationProfileValues(
  organization: OrganizationProfileFieldsFragment,
): OrganizationProfileValues {
  return {
    logo: null,
    introduction: organization.tagline ?? '',
    categories: organization.fields.map((field) => ACTIVITY_CATEGORY_BY_FIELD[field]),
    keywords: organization.keywords,
    // 서버는 링크 1개 이상을 요구하므로 비어 있으면 입력란 하나를 둠
    links:
      organization.links.length > 0
        ? organization.links.map(({ url }) => ({ url }))
        : [{ url: '' }],
  }
}

// TODO: 로고 업로드(presigned URL) 연결 전까지 logoFileKey는 null로 기존 로고 유지
function toUpdateOrganizationInput(
  values: OrganizationProfileValues,
  isStudentCouncilOrganization: boolean,
): UpdateOrganizationInput {
  return {
    logoFileKey: null,
    tagline: values.introduction.trim(),
    // 학생회는 화면에 활동 분야가 없어 빈 배열
    fields: isStudentCouncilOrganization
      ? []
      : values.categories.map((category) => FIELD_BY_ACTIVITY_CATEGORY[category]),
    keywords: values.keywords,
    links: values.links.map(({ url }) => ({ url: toHttpUrl(url) })),
  }
}

type ProfileFieldPath = 'introduction' | 'categories' | 'keywords' | 'links.0.url'

// 서버 입력 필드 이름 → 폼 입력 위치, 링크는 어느 칸인지 알 수 없어 첫 칸에 표시
const PROFILE_FIELD_BY_SERVER_FIELD: Record<string, ProfileFieldPath> = {
  tagline: 'introduction',
  fields: 'categories',
  keywords: 'keywords',
  links: 'links.0.url',
}

function toProfileFieldErrors(fieldErrors: readonly { field: string; message: string }[]) {
  return fieldErrors.flatMap(({ field, message }) => {
    // links[0].url처럼 와도 앞부분 이름으로 판단
    const serverField = field.split(/[.[]/)[0] ?? field
    const path = PROFILE_FIELD_BY_SERVER_FIELD[serverField]
    return path ? [{ path, message }] : []
  })
}

export {
  ORGANIZATION_TYPE_LABEL,
  isStudentCouncil,
  toOrganizationProfileValues,
  toOrganizationSummary,
  toProfileFieldErrors,
  toUpdateOrganizationInput,
}
export type { OrganizationSummary, ProfileFieldPath }
