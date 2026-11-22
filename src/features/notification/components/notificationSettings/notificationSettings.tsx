'use client'

import { Toggle } from '@/components/ui/Toggle/toggle'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import {
  useMyAccountQuery,
  useUpdateNotificationSettingMutation,
  type NotificationSettingKey,
} from '@/features/user/api/queries'
import { useToast } from '@/providers/toastProvider'
import { NotificationSettingsSkeleton } from './notificationSettingsSkeleton'

type NotificationSettingOption = {
  key: NotificationSettingKey
  label: string
}

const NOTIFICATION_SETTING_OPTIONS = [
  { key: 'notifyResult', label: '지원 결과 및 면접 일정' },
  { key: 'notifyScrap', label: '스크랩 공고 모집 시작' },
  { key: 'notifyOperator', label: '운영진 활동 알림' },
  { key: 'marketingAgreed', label: '이벤트 및 마케팅' },
] as const satisfies readonly NotificationSettingOption[]

function getEnabledToastTitle(label: string) {
  return `${label.replace(/ 알림$/, '')} 알림 수신에 동의했어요`
}

function NotificationSettings() {
  const { showToast } = useToast()
  const accountQuery = useMyAccountQuery()
  const updateSetting = useUpdateNotificationSettingMutation()

  // 연달아 바꿔도 요청마다 결과 토스트를 띄우도록 mutate 대신 mutateAsync 사용
  async function handleCheckedChange(
    { key, label }: NotificationSettingOption,
    isEnabled: boolean,
  ) {
    try {
      await updateSetting.mutateAsync({ key, isEnabled })
      if (isEnabled) {
        showToast({ title: getEnabledToastTitle(label) })
      }
    } catch {
      showToast({
        title: '알림 설정을 바꾸지 못했어요',
        description: '잠시 후 다시 시도해 주세요',
        icon: 'alert',
      })
    }
  }

  if (accountQuery.data) {
    const settings = accountQuery.data.notificationSettings

    return (
      <div className="flex flex-col gap-gap-l text-body1 text-neutral">
        {NOTIFICATION_SETTING_OPTIONS.map((option) => (
          <label key={option.key} className="flex items-center gap-gap-l">
            <span className="min-w-0 flex-1 break-words">{option.label}</span>
            <Toggle
              checked={settings[option.key]}
              onCheckedChange={(isEnabled) => void handleCheckedChange(option, isEnabled)}
            />
          </label>
        ))}
      </div>
    )
  }
  if (accountQuery.isError) {
    return (
      <OrganizationLoadError
        message="알림 설정을 불러오지 못했어요"
        onRetry={() => void accountQuery.refetch()}
      />
    )
  }
  return <NotificationSettingsSkeleton optionCount={NOTIFICATION_SETTING_OPTIONS.length} />
}

export { NotificationSettings }
