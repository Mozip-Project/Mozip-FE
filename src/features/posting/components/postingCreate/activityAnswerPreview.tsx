'use client'

import PlusIcon from '@/assets/icons/plus.svg'
import { TextField } from '@/components/ui/TextField/textField'
import { ActivityItem } from './activityItem'

function ignoreRemove() {}

function ActivityAnswerPreview() {
  return (
    <div className="flex flex-col gap-gap-m">
      <ActivityItem title="활동 경험 1" onRemove={ignoreRemove}>
        <TextField label="활동명" placeholder="활동명을 입력해 주세요" />
        <div className="flex gap-gap-m">
          <TextField className="min-w-0 flex-1" label="활동 기간" placeholder="YYYY.MM ~ YYYY.MM" />
          <TextField className="min-w-0 flex-1" label="역할" placeholder="담당 역할" />
        </div>
        <TextField label="주요 성과" placeholder="성과를 입력해 주세요" />
      </ActivityItem>
      <div className="flex h-12 items-center justify-center gap-gap-s rounded-m bg-brand-weak p-padding-m text-body2 font-medium text-brand">
        <PlusIcon aria-hidden className="size-5 shrink-0" />
        활동 경험 추가
      </div>
    </div>
  )
}

export { ActivityAnswerPreview }
