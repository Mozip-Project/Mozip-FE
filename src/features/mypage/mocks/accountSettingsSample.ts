import type { AffiliatedOrganization } from '@/features/mypage/components/accountSettings/organizationSection'

const ACCOUNT_SETTINGS_SAMPLE = {
  profile: {
    name: '김모집',
    maskedPhone: '010-****-1234',
  },
  schoolVerification: {
    schoolName: '성균관대학교',
    email: 'mozip@skku.edu',
  },
  organizations: [
    { id: 'uxux', name: 'UXUX', roleLabel: '대표자', teamName: '기획팀' },
    { id: 'cool-developers', name: '멋쟁이개발자', roleLabel: '운영진', teamName: '개발팀' },
  ] satisfies AffiliatedOrganization[],
}

export { ACCOUNT_SETTINGS_SAMPLE }
