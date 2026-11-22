'use client'

import PlusIcon from '@/assets/icons/plus.svg'
import { ActivityItem } from '@/components/ui/ActivityItem/activityItem'
import { TextField } from '@/components/ui/TextField/textField'
import {
  ACTIVITY_FIELDS,
  type PostingActivityField,
} from '@/features/posting/schemas/postingFormSchema'

function ignoreRemove() {}

type ActivityAnswerPreviewProps = {
  fields?: readonly PostingActivityField[]
}

function ActivityAnswerPreview({ fields = ACTIVITY_FIELDS }: ActivityAnswerPreviewProps) {
  const hasPeriod = fields.includes('period')
  const hasRole = fields.includes('role')

  return (
    <div className="flex flex-col gap-gap-m">
      <ActivityItem title="활동 경험 1" onRemove={ignoreRemove}>
        <TextField label="활동명" placeholder="활동명을 입력해 주세요" />
        {(hasPeriod || hasRole) && (
          <div className="flex gap-gap-m">
            {hasPeriod && (
              <TextField
                className="min-w-0 flex-1"
                label="활동 기간"
                placeholder="YYYY.MM ~ YYYY.MM"
              />
            )}
            {hasRole && (
              <TextField className="min-w-0 flex-1" label="역할" placeholder="담당 역할" />
            )}
          </div>
        )}
        {fields.includes('achievement') && (
          <TextField label="주요 성과" placeholder="성과를 입력해 주세요" />
        )}
      </ActivityItem>
      <div className="flex h-12 items-center justify-center gap-gap-s rounded-m bg-brand-weak p-padding-m text-body2 font-medium text-brand">
        <PlusIcon aria-hidden className="size-5 shrink-0" />
        활동 경험 추가
      </div>
    </div>
  )
}

export { ActivityAnswerPreview }
