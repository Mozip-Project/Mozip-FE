'use client'

import { useId } from 'react'
import { Controller, useController, type Control, type UseFormRegister } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField/textField'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { POSTING_INFO_MAX_LENGTH } from '@/features/posting/schemas/postingInfoSchema'
import { PostingContentEditor } from './postingContentEditor'
import { PostingImageField } from './postingImageField'
import { PostingPublicItemFields } from './postingPublicItemFields'
import { PostingQualificationFields } from './postingQualificationFields'

type PostingInfoStepProps = {
  control: Control<PostingCreateValues>
  register: UseFormRegister<PostingCreateValues>
}

function PostingInfoStep({ control, register }: PostingInfoStepProps) {
  const basicTitleId = useId()
  const detailTitleId = useId()
  const contentTitleId = useId()
  const { field: savedImageField } = useController({ control, name: 'savedMainImageUrl' })

  return (
    <div className="flex flex-col gap-gap-xxl pt-padding-l">
      <section aria-labelledby={basicTitleId} className="flex flex-col gap-gap-xl">
        <h2 id={basicTitleId} className="text-heading2 font-semibold text-neutral">
          기본 정보
        </h2>
        <TextField
          label="공고 제목"
          required
          placeholder="공고 제목을 입력해 주세요"
          maxLength={POSTING_INFO_MAX_LENGTH.title}
          {...register('title')}
        />
        <Controller
          name="mainImage"
          control={control}
          render={({ field }) => (
            <PostingImageField
              value={field.value}
              savedImageUrl={savedImageField.value}
              onChange={(file) => {
                field.onChange(file)
                // 저장된 이미지를 지우면 새 이미지를 고를 때까지 대표 이미지 없음
                if (!file) {
                  savedImageField.onChange(null)
                }
              }}
            />
          )}
        />
      </section>
      <section aria-labelledby={detailTitleId} className="flex flex-col gap-gap-xl">
        <h2 id={detailTitleId} className="text-heading2 font-semibold text-neutral">
          모집 상세 정보
        </h2>
        <PostingPublicItemFields control={control} />
        <PostingQualificationFields control={control} />
      </section>
      <section aria-labelledby={contentTitleId} className="flex flex-col gap-gap-xl">
        <h2 id={contentTitleId} className="text-heading2 font-semibold text-neutral">
          공고 내용
        </h2>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <PostingContentEditor
              value={field.value}
              onChange={field.onChange}
              labelledBy={contentTitleId}
            />
          )}
        />
      </section>
    </div>
  )
}

export { PostingInfoStep }
