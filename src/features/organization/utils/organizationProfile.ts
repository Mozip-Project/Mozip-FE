import type {
  ActivityCategory,
  OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import type {
  OrganizationField,
  OrganizationProfileFieldsFragment,
  UpdateOrganizationInput,
} from '@/gql/graphql'

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
    links: values.links.map(({ url }) => ({ url: url.trim() })),
  }
}

export { isStudentCouncil, toOrganizationProfileValues, toUpdateOrganizationInput }
