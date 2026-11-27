import { delay, HttpResponse } from 'msw'
import type {
  KeywordSuggestionsQuery,
  KeywordSuggestionsQueryVariables,
  OrganizationProfileFieldsFragment,
  OrganizationProfileQuery,
  OrganizationProfileQueryVariables,
  UpdateOrganizationInput,
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

// 명세 검증 규칙
const TAGLINE_MAX_LENGTH = 40
const KEYWORD_MAX_COUNT = 10
const LINK_URL_MAX_LENGTH = 500
// 쿼리에서 limit을 넘기지 않아 명세 기본값 사용
const DEFAULT_SUGGESTION_LIMIT = 5

// 외부 이미지 호스트 없이 기존 로고 표시를 확인하기 위한 인라인 SVG
const SAMPLE_LOGO_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"%3E%3Crect width="240" height="240" fill="%23e8f0ff"/%3E%3Ctext x="120" y="140" font-size="64" text-anchor="middle" fill="%23356af5"%3EUX%3C/text%3E%3C/svg%3E'

// 단체 ID는 내 정보(me) MSW의 소속 단체와 같음, 단체 2는 로고·학교 없는 연합 학생회
function createInitialOrganizations(): Record<string, OrganizationProfileFieldsFragment> {
  return {
    [MOCK_ORGANIZATION_ID]: {
      id: MOCK_ORGANIZATION_ID,
      name: 'UXUX',
      type: 'CLUB',
      scope: 'CAMPUS',
      school: { name: '과학기술연합대학원대학교' },
      logoUrl: SAMPLE_LOGO_URL,
      tagline: '사용자 경험을 연구하고 만드는 동아리',
      fields: ['DESIGN_MEDIA', 'IT_DEV'],
      keywords: ['UX', '디자인', '프로토타이핑'],
      links: [{ id: 'link-1', url: 'https://instagram.com/uxux' }],
    },
    '2': {
      id: '2',
      name: '멋쟁이개발자',
      type: 'STUDENT_COUNCIL',
      scope: 'UNION',
      school: null,
      logoUrl: null,
      tagline: null,
      fields: [],
      keywords: [],
      links: [],
    },
  }
}

// 다른 단체가 등록한 키워드 예시, 많이 쓴 순
const KEYWORD_SUGGESTION_POOL = [
  '개발',
  '개발 스터디',
  '디자인',
  '디자인 시스템',
  '데이터 분석',
  '프로토타이핑',
  '프론트엔드',
  '백엔드',
  'UX',
  'UI',
  '기획',
  '봉사',
]

// 저장 결과가 새로고침 전까지 유지되도록 메모리에 보관
let organizations = createInitialOrganizations()

function resetOrganizationProfiles() {
  organizations = createInitialOrganizations()
}

function isHttpUrl(url: string) {
  return /^https?:\/\//.test(url) && url.length <= LINK_URL_MAX_LENGTH
}

function validateInput(input: UpdateOrganizationInput) {
  const fieldErrors = [
    !input.tagline || input.tagline.length > TAGLINE_MAX_LENGTH
      ? { field: 'tagline', message: `한 줄 소개는 1~${TAGLINE_MAX_LENGTH}자로 입력해 주세요.` }
      : null,
    input.keywords.length === 0 || input.keywords.length > KEYWORD_MAX_COUNT
      ? {
          field: 'keywords',
          message: `검색 키워드는 1~${KEYWORD_MAX_COUNT}개까지 등록할 수 있어요.`,
        }
      : null,
    input.links.length === 0 || !input.links.every(({ url }) => isHttpUrl(url))
      ? { field: 'links', message: 'http 또는 https로 시작하는 링크를 입력해 주세요.' }
      : null,
  ]
  return fieldErrors.filter((error) => error !== null)
}

const organizationProfileHandlers = [
  graphqlApi.query<OrganizationProfileQuery, OrganizationProfileQueryVariables>(
    'OrganizationProfile',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const organization = organizations[String(variables.id)]

      if (!organization) {
        return HttpResponse.json({
          errors: [{ message: '단체를 찾을 수 없습니다.', extensions: { code: 'ORG_404' } }],
          data: null,
        })
      }
      return HttpResponse.json({ data: { organization } })
    },
  ),

  graphqlApi.mutation<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(
    'UpdateOrganization',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const organizationId = String(variables.id)
      const organization = organizations[organizationId]

      // 명세상 소속이 아닌 단체 저장은 COMMON_403
      if (!organization) {
        return HttpResponse.json({
          errors: [{ message: '접근 권한이 없습니다.', extensions: { code: 'COMMON_403' } }],
          data: null,
        })
      }

      const { input } = variables
      const fieldErrors = validateInput(input)
      if (fieldErrors.length > 0) {
        return HttpResponse.json({
          errors: [
            {
              message: '입력값을 확인해 주세요.',
              extensions: { code: 'ORG_400', fieldErrors },
            },
          ],
          data: null,
        })
      }

      const updated = {
        ...organization,
        // 서버처럼 보낸 주소로 덮어쓰고, 비어 있으면 기본 이미지(null)
        logoUrl: input.logoUrl || null,
        tagline: input.tagline,
        fields: input.fields,
        keywords: [...new Set(input.keywords)],
        links: input.links.map(({ url }, index) => ({ id: `link-${index + 1}`, url })),
      }
      organizations[organizationId] = updated
      return HttpResponse.json({ data: { updateOrganization: updated } })
    },
  ),

  graphqlApi.query<KeywordSuggestionsQuery, KeywordSuggestionsQueryVariables>(
    'KeywordSuggestions',
    ({ variables }) => {
      const query = variables.query.trim().toLowerCase()
      const keywordSuggestions = KEYWORD_SUGGESTION_POOL.filter((keyword) =>
        keyword.toLowerCase().startsWith(query),
      ).slice(0, DEFAULT_SUGGESTION_LIMIT)

      return HttpResponse.json({ data: { keywordSuggestions } })
    },
  ),
]

export { organizationProfileHandlers, resetOrganizationProfiles }
