'use server'

import { cookies } from 'next/headers'
import { CURRENT_ORGANIZATION_COOKIE } from './currentOrganizationCookie'

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
// 서버 ID 형식이 정해지지 않아 길이만 제한
const MAX_ORGANIZATION_ID_LENGTH = 64

// 쿠키 변경 시 Next가 현재 페이지와 layout을 다시 그려 새 단체로 갱신
// 권한은 백엔드가 요청마다 organizationId로 검사하므로 여기서는 형식만 확인
async function saveCurrentOrganization(organizationId: string) {
  if (organizationId.length === 0 || organizationId.length > MAX_ORGANIZATION_ID_LENGTH) {
    throw new Error('잘못된 단체 ID')
  }

  const cookieStore = await cookies()
  cookieStore.set(CURRENT_ORGANIZATION_COOKIE, organizationId, {
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
}

export { saveCurrentOrganization }
