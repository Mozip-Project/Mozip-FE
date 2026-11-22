import { describe, expect, it } from 'vitest'
import type { MyAccountFieldsFragment } from '@/gql/graphql'
import { toAccountSettings } from './accountSettings'

const ACCOUNT: MyAccountFieldsFragment = {
  id: 'user-1',
  phone: '01012345678',
  name: '김모집',
  school: { name: '모집대학교' },
  schoolVerification: {
    schoolName: null,
    email: 'mozip@mozip.ac.kr',
    school: { name: '모집대학교' },
  },
  memberships: [
    {
      id: 'member-1',
      role: 'REPRESENTATIVE',
      organization: { id: 'org-1', name: '모집 동아리' },
      team: { name: '기획팀' },
    },
    {
      id: 'member-2',
      role: 'OPERATOR',
      organization: { id: 'org-2', name: '모집 학회' },
      team: null,
    },
  ],
  notificationSettings: {
    notifyResult: true,
    notifyScrap: false,
    notifyOperator: true,
    marketingAgreed: false,
  },
}

describe('toAccountSettings', () => {
  it('이름과 가운데를 가린 전화번호를 프로필로 사용', () => {
    expect(toAccountSettings(ACCOUNT).profile).toEqual({
      name: '김모집',
      maskedPhone: '010-****-5678',
    })
  })

  it('소속 단체는 역할 라벨로 바꾸고 팀이 없으면 빈칸', () => {
    expect(toAccountSettings(ACCOUNT).organizations).toEqual([
      { id: 'org-1', name: '모집 동아리', roleLabel: '대표자', teamName: '기획팀' },
      { id: 'org-2', name: '모집 학회', roleLabel: '운영진', teamName: '' },
    ])
  })

  it('소속 단체가 없으면 빈 목록', () => {
    expect(toAccountSettings({ ...ACCOUNT, memberships: [] }).organizations).toEqual([])
  })

  it('목록에 있는 학교로 인증하면 학교 이름과 인증 이메일 사용', () => {
    expect(toAccountSettings(ACCOUNT).schoolVerification).toEqual({
      schoolName: '모집대학교',
      email: 'mozip@mozip.ac.kr',
    })
  })

  it('직접 입력한 학교의 재학증명서가 승인되면 입력한 이름과 이메일 null', () => {
    const account: MyAccountFieldsFragment = {
      ...ACCOUNT,
      school: null,
      schoolVerification: { schoolName: '직접입력대학교', email: null, school: null },
    }

    expect(toAccountSettings(account).schoolVerification).toEqual({
      schoolName: '직접입력대학교',
      email: null,
    })
  })

  it('인증 값이 비어 오면 학교 이름 빈칸, 이메일 null', () => {
    const account: MyAccountFieldsFragment = { ...ACCOUNT, school: null, schoolVerification: null }

    expect(toAccountSettings(account).schoolVerification).toEqual({ schoolName: '', email: null })
  })
})
