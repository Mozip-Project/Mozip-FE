'use client'

import { useId } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { RadioGroup } from '@/components/ui/Radio/radio'
import { RadioCard } from '@/components/ui/Radio/radioCard'
import { SelectField } from '@/components/ui/SelectField/selectField'
import { TextField } from '@/components/ui/TextField/textField'
import type { PostingPosition } from '@/features/posting/types'
import {
  GRADES,
  type ApplicationInfoValues,
  type Grade,
} from '@/features/recruitment/schemas/applicationInfoSchema'
import type { ApplicantProfile } from '@/features/recruitment/types'
import { ProfileCard } from './profileCard'

const GRADE_LABEL = {
  year1: '1학년',
  year2: '2학년',
  year3: '3학년',
  year4: '4학년',
  year5OrMore: '5학년 이상',
  graduationDeferred: '졸업 유예',
} satisfies Record<Grade, string>

const GRADE_OPTIONS = GRADES.map((grade) => ({ value: grade, label: GRADE_LABEL[grade] }))

type ApplicationInfoStepProps = {
  control: Control<ApplicationInfoValues>
  // null은 포지션 없는 모집
  positions: readonly PostingPosition[] | null
  profile: ApplicantProfile
  requiresProfilePhoto: boolean
}

function ApplicationInfoStep({
  control,
  positions,
  profile,
  requiresProfilePhoto,
}: ApplicationInfoStepProps) {
  const positionTitleId = useId()

  return (
    <div className="flex flex-col gap-gap-xxl pt-padding-l">
      {positions && (
        <section className="flex flex-col gap-gap-l">
          <h2 id={positionTitleId} className="text-headline1 font-semibold text-neutral">
            지원 포지션
          </h2>
          <Controller
            name="positionId"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-labelledby={positionTitleId}
                value={field.value}
                onValueChange={field.onChange}
                className="flex-col"
              >
                {positions.map((position) => (
                  <RadioCard
                    key={position.id}
                    value={position.id}
                    label={position.name}
                    disabled={position.appliedAt !== null}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </section>
      )}
      <section className="flex flex-col gap-gap-l">
        <h2 className="text-headline1 font-semibold text-neutral">프로필 확인</h2>
        <Controller
          name="photo"
          control={control}
          render={({ field }) => (
            <ProfileCard
              {...profile}
              photo={field.value}
              onPhotoChange={field.onChange}
              isPhotoRequired={requiresProfilePhoto}
            >
              <div className="flex items-start gap-gap-m">
                <Controller
                  name="department"
                  control={control}
                  render={({ field: departmentField, fieldState }) => (
                    <TextField
                      {...departmentField}
                      className="min-w-0 flex-1"
                      label="학과"
                      required
                      placeholder="학과를 입력해 주세요"
                      aria-invalid={fieldState.invalid}
                      helper={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="grade"
                  control={control}
                  render={({ field: gradeField, fieldState }) => (
                    <SelectField
                      className="w-45 shrink-0"
                      label="학년"
                      required
                      placeholder="학년 선택"
                      options={GRADE_OPTIONS}
                      value={gradeField.value}
                      onValueChange={gradeField.onChange}
                      onBlur={gradeField.onBlur}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </ProfileCard>
          )}
        />
      </section>
    </div>
  )
}

export { ApplicationInfoStep }
