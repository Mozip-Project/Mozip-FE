'use client'

import { Toggle } from '@/components/ui/Toggle/toggle'
import { useToast } from '@/providers/toastProvider'

const NOTIFICATION_SETTING_LABELS = [
  '지원 결과 및 면접 일정',
  '스크랩 공고 모집 시작',
  '운영진 활동 알림',
  '이벤트 및 마케팅',
]

function getEnabledToastTitle(label: string) {
  return `${label.replace(/ 알림$/, '')} 알림 수신에 동의했어요`
}

// TODO: 알림 설정 조회·변경 API 연결
function NotificationSettings() {
  const { showToast } = useToast()

  function handleCheckedChange(label: string, isChecked: boolean) {
    if (isChecked) {
      showToast({ title: getEnabledToastTitle(label) })
    }
  }

  return (
    <div className="flex flex-col gap-gap-l text-body1 text-neutral">
      {NOTIFICATION_SETTING_LABELS.map((label) => (
        <label key={label} className="flex items-center gap-gap-l">
          <span className="min-w-0 flex-1 break-words">{label}</span>
          <Toggle onCheckedChange={(isChecked) => handleCheckedChange(label, isChecked)} />
        </label>
      ))}
    </div>
  )
}

export { NotificationSettings }
