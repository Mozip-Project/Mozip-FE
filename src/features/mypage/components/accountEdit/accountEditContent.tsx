'use client'

import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useMyAccountQuery } from '@/features/user/api/queries'
import { maskPhoneNumber } from '@/utils/phone'
import { ACCOUNT_EDIT_BACK_LINK, AccountEditForm } from './accountEditForm'
import { AccountEditSkeleton } from './accountEditSkeleton'

// 폼 초깃값이 첫 렌더링에만 적용되어 계정 정보를 받은 뒤 폼 표시
function AccountEditContent() {
  const accountQuery = useMyAccountQuery()
  const account = accountQuery.data

  if (account) {
    return <AccountEditForm name={account.name} maskedPhone={maskPhoneNumber(account.phone)} />
  }
  if (accountQuery.isError) {
    return (
      <div className="flex flex-col gap-gap-l">
        <PageHeader title="정보 수정" backLink={ACCOUNT_EDIT_BACK_LINK} />
        <OrganizationLoadError
          message="계정 정보를 불러오지 못했어요"
          onRetry={() => void accountQuery.refetch()}
        />
      </div>
    )
  }
  return <AccountEditSkeleton backLink={ACCOUNT_EDIT_BACK_LINK} />
}

export { AccountEditContent }
