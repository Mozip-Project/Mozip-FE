'use client'

import { AccountSettingsSkeleton } from '@/features/mypage/components/accountSettings/accountSettingsSkeleton'
import { toAccountSettings } from '@/features/mypage/utils/accountSettings'
import { MY_PAGE_PATHS, type MyPageMode } from '@/features/mypage/utils/myPageRoutes'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useMyAccountQuery } from '@/features/user/api/queries'
import { LogoutButton } from './logoutButton'
import { OrganizationSection } from './organizationSection'
import { ProfileSection } from './profileSection'
import { SchoolVerificationSection } from './schoolVerificationSection'
import { WithdrawalDialog } from './withdrawalDialog'

type AccountSettingsContentProps = {
  mode: MyPageMode
}

function AccountSettingsSections({ mode }: AccountSettingsContentProps) {
  const accountQuery = useMyAccountQuery()

  if (accountQuery.data) {
    const { profile, schoolVerification, organizations } = toAccountSettings(accountQuery.data)

    return (
      <>
        <ProfileSection
          name={profile.name}
          maskedPhone={profile.maskedPhone}
          editHref={MY_PAGE_PATHS[mode].accountEdit}
        />
        <hr className="border-neutral-subtle" />

        <SchoolVerificationSection
          schoolName={schoolVerification.schoolName}
          email={schoolVerification.email}
        />

        {mode === 'organizer' && (
          <>
            <hr className="border-neutral-subtle" />
            <OrganizationSection organizations={organizations} />
          </>
        )}
      </>
    )
  }
  if (accountQuery.isError) {
    return (
      <OrganizationLoadError
        message="계정 정보를 불러오지 못했어요"
        onRetry={() => void accountQuery.refetch()}
      />
    )
  }
  return <AccountSettingsSkeleton />
}

// 조회에 실패해도 로그아웃·탈퇴는 쓸 수 있도록 버튼은 항상 표시
function AccountSettingsContent({ mode }: AccountSettingsContentProps) {
  return (
    <div className="flex flex-col gap-gap-l">
      <AccountSettingsSections mode={mode} />
      <div className="flex justify-end gap-gap-s">
        <LogoutButton />
        <WithdrawalDialog />
      </div>
    </div>
  )
}

export { AccountSettingsContent }
