'use client'

import { Controller, type Control } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { Qualification } from '@/features/posting/schemas/postingInfoSchema'
import { PostingOptionGroup, type PostingOption } from './postingOptionGroup'

const QUALIFICATION_OPTIONS = [
  { value: 'student', label: '대학생' },
  { value: 'leaveOfAbsence', label: '휴학생' },
  { value: 'custom', label: '직접 입력' },
] satisfies PostingOption<Qualification>[]

type PostingQualificationFieldsProps = {
  control: Control<PostingCreateValues>
}

function PostingQualificationFields({ control }: PostingQualificationFieldsProps) {
  return (
    <Controller
      name="qualifications"
      control={control}
      render={({ field }) => (
        <PostingOptionGroup
          label="지원 자격"
          required
          options={QUALIFICATION_OPTIONS}
          value={field.value}
          onChange={field.onChange}
        >
          {field.value.includes('custom') && (
            <Controller
              name="customQualification"
              control={control}
              render={({ field: customField }) => (
                <TextField
                  label="직접 입력"
                  placeholder="예) 1~3학년, 졸업 예정자 가능, 타 학교 학생 가능"
                  {...customField}
                />
              )}
            />
          )}
        </PostingOptionGroup>
      )}
    />
  )
}

export { PostingQualificationFields }
