'use client'

import { useId } from 'react'
import { useController, useWatch, type Control } from 'react-hook-form'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { getResultDateMinimums } from '@/features/posting/schemas/postingScheduleSchema'
import type { TimeOptionType } from '@/utils/time'
import { DateField } from '../fields/dateField'
import { DateTimeField } from '../fields/dateTimeField'

type ScheduleControl = Control<PostingCreateValues>

type DateName =
  | 'recruitStartDate'
  | 'recruitEndDate'
  | 'documentResultDate'
  | 'finalResultDate'
  | 'activityStartDate'
  | 'activityEndDate'

type PostingScheduleStepProps = {
  control: ScheduleControl
  hasInterview: boolean
}

function PostingScheduleStep({ control, hasInterview }: PostingScheduleStepProps) {
  const titleId = useId()
  const [recruitStartDate, recruitEndDate, documentResultDate] = useWatch({
    control,
    name: ['recruitStartDate', 'recruitEndDate', 'documentResultDate'],
  })
  const resultMinDates = getResultDateMinimums({ recruitEndDate, documentResultDate }, hasInterview)

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-gap-xl pt-padding-l">
      <h2 id={titleId} className="text-heading2 font-semibold text-neutral">
        모집 일정
      </h2>
      <div className="grid grid-cols-2 gap-gap-xl">
        <ScheduleDateTimeField
          control={control}
          label="모집 시작"
          timeType="start"
          dateName="recruitStartDate"
          timeName="recruitStartTime"
        />
        <ScheduleDateTimeField
          control={control}
          label="모집 마감"
          timeType="end"
          dateName="recruitEndDate"
          timeName="recruitEndTime"
          minDate={recruitStartDate}
        />
        {hasInterview && (
          <ScheduleDateField
            control={control}
            name="documentResultDate"
            label="서류 결과 및 면접 일정 발표일"
            required
            minDate={resultMinDates.documentResultDate}
          />
        )}
        <ScheduleDateField
          control={control}
          name="finalResultDate"
          label="최종 결과 발표일"
          required
          minDate={resultMinDates.finalResultDate}
        />
        <ActivityPeriodField control={control} />
      </div>
    </section>
  )
}

type ScheduleDateTimeFieldProps = {
  control: ScheduleControl
  label: string
  timeType: TimeOptionType
  dateName: 'recruitStartDate' | 'recruitEndDate'
  timeName: 'recruitStartTime' | 'recruitEndTime'
  minDate?: string | null
}

function ScheduleDateTimeField({
  control,
  label,
  timeType,
  dateName,
  timeName,
  minDate,
}: ScheduleDateTimeFieldProps) {
  const { field: dateField } = useController({ control, name: dateName })
  const { field: timeField } = useController({ control, name: timeName })

  return (
    <DateTimeField
      className="min-w-0"
      label={label}
      required
      timeType={timeType}
      date={dateField.value}
      onDateChange={dateField.onChange}
      time={timeField.value}
      onTimeChange={timeField.onChange}
      minDate={minDate}
    />
  )
}

type ScheduleDateFieldProps = {
  control: ScheduleControl
  name: DateName
  label: string
  required?: boolean
  isLabelHidden?: boolean
  minDate?: string | null
  className?: string
}

function ScheduleDateField({
  control,
  name,
  className = 'min-w-0',
  ...props
}: ScheduleDateFieldProps) {
  const { field } = useController({ control, name })

  return (
    <DateField
      className={className}
      value={field.value}
      onValueChange={field.onChange}
      {...props}
    />
  )
}

function ActivityPeriodField({ control }: { control: ScheduleControl }) {
  const labelId = useId()
  const activityStartDate = useWatch({ control, name: 'activityStartDate' })

  return (
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-gap-s">
      <FieldLabel id={labelId} label="활동 기간" />
      <div className="flex items-center gap-gap-s">
        <ScheduleDateField
          control={control}
          name="activityStartDate"
          label="활동 시작일"
          isLabelHidden
          className="min-w-0 flex-1"
        />
        <span aria-hidden className="shrink-0 text-body2 font-normal text-neutral-subtle">
          ~
        </span>
        <ScheduleDateField
          control={control}
          name="activityEndDate"
          label="활동 종료일"
          isLabelHidden
          minDate={activityStartDate}
          className="min-w-0 flex-1"
        />
      </div>
    </div>
  )
}

export { PostingScheduleStep }
