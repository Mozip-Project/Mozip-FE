import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { ACCOUNT_SETTINGS_SAMPLE } from '@/features/mypage/mocks/accountSettingsSample'
import { OrganizationSection } from './organizationSection'
import { ProfileSection } from './profileSection'
import { SchoolVerificationSection } from './schoolVerificationSection'

// TODO: 로그인 사용자 계정 정보 API 연결 후 샘플 데이터 제거
function AccountSettingsContent() {
  const { profile, schoolVerification, organizations } = ACCOUNT_SETTINGS_SAMPLE

  return (
    <div className="flex flex-col gap-gap-l">
      <ProfileSection name={profile.name} maskedPhone={profile.maskedPhone} />
      <hr className="border-neutral-subtle" />

      <SchoolVerificationSection
        schoolName={schoolVerification.schoolName}
        email={schoolVerification.email}
      />
      <hr className="border-neutral-subtle" />

      <OrganizationSection organizations={organizations} />
      {/* TODO: 탈퇴, 로그아웃 동작 연결 */}
      <div className="flex justify-end gap-gap-s">
        <Button variant="secondary" size="m" asChild>
          <Link href="/">로그아웃</Link>
        </Button>
        <Button variant="critical" size="m">
          회원 탈퇴
        </Button>
      </div>
    </div>
  )
}

export { AccountSettingsContent }
