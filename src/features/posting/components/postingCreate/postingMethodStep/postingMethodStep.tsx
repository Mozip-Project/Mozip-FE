'use client'

import { useId } from 'react'
import { Controller, useWatch, type Control } from 'react-hook-form'
import { Radio, RadioGroup } from '@/components/ui/Radio/radio'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { RECRUIT_TYPES, type RecruitType } from '@/features/posting/schemas/postingMethodSchema'
import { isOneOf } from '@/utils/isOneOf'
import { PostingPositionFields } from './postingPositionFields'

const RECRUIT_TYPE_LABEL = {
  position: '포지션별 모집',
  integrated: '통합 모집',
} satisfies Record<RecruitType, string>

type PostingMethodStepProps = {
  control: Control<PostingCreateValues>
}

function PostingMethodStep({ control }: PostingMethodStepProps) {
  const titleId = useId()
  const recruitType = useWatch({ control, name: 'recruitType' })

  return (
    <div className="flex flex-col gap-gap-xxl pt-padding-l">
      <section aria-labelledby={titleId} className="flex flex-col gap-gap-xl">
        <h2 id={titleId} className="text-heading2 font-semibold text-neutral">
          모집 유형
        </h2>
        <Controller
          name="recruitType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              aria-labelledby={titleId}
              value={field.value ?? ''}
              onValueChange={(value) => isOneOf(RECRUIT_TYPES, value) && field.onChange(value)}
              className="gap-gap-l"
            >
              {RECRUIT_TYPES.map((type) => (
                <Radio key={type} value={type}>
                  {RECRUIT_TYPE_LABEL[type]}
                </Radio>
              ))}
            </RadioGroup>
          )}
        />
      </section>
      {recruitType === 'position' && <PostingPositionFields control={control} />}
    </div>
  )
}

export { PostingMethodStep }
