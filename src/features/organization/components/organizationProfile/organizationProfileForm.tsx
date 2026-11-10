'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { TextField } from '@/components/ui/TextField/textField'
import {
  INTRODUCTION_MAX_LENGTH,
  createOrganizationProfileSchema,
  type OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import type { OrganizationProfile } from '@/features/organization/types'
import { ActivityCategoryField } from './activityCategoryField'
import { KeywordField } from './keywordField'
import { LinkField } from './linkField'
import { LogoField } from './logoField'

// TODO: 단체 프로필 조회 API 확정 후 저장된 값으로 교체
const EMPTY_PROFILE_VALUES = {
  logo: null,
  introduction: '',
  categories: [],
  keywords: [],
  links: [{ url: '' }],
} satisfies OrganizationProfileValues

type OrganizationProfileFormProps = {
  profile: OrganizationProfile
}

function OrganizationProfileForm({ profile }: OrganizationProfileFormProps) {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<OrganizationProfileValues>({
    mode: 'onChange',
    resolver: zodResolver(createOrganizationProfileSchema(profile.isStudentCouncil)),
    defaultValues: EMPTY_PROFILE_VALUES,
  })
  const canSave = isValid && isDirty
  // 최대 글자수에 도달하면 더 입력되지 않으므로 안내만 표시
  const isIntroductionAtMax =
    useWatch({ control, name: 'introduction' }).length >= INTRODUCTION_MAX_LENGTH

  // 저장한 값을 새 기준으로 삼아 다시 바꿀 때까지 저장 비활성
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues())
    }
  }, [isSubmitSuccessful, getValues, reset])

  // TODO: 저장 API 연결
  function handleSave() {}

  return (
    // 검증은 zod가 맡고, 브라우저 기본 검증(https 없는 링크 거부 등) 비활성
    <form noValidate onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-gap-xl">
      <PageHeader
        title="단체 프로필"
        actions={
          <Button type="submit" size="m" disabled={!canSave}>
            저장
          </Button>
        }
      />
      <div className="flex flex-col gap-gap-xl bg-layer-default p-padding-xl">
        <Controller
          name="logo"
          control={control}
          render={({ field }) => <LogoField value={field.value} onChange={field.onChange} />}
        />
        <TextField
          label="단체명"
          helper="단체명 변경은 관리자에게 문의해 주세요"
          defaultValue={profile.name}
          disabled
        />
        <TextField
          {...register('introduction')}
          label={`한 줄 소개 (최대 ${INTRODUCTION_MAX_LENGTH}자)`}
          placeholder="단체 소개를 입력해 주세요"
          maxLength={INTRODUCTION_MAX_LENGTH}
          aria-invalid={isIntroductionAtMax}
          helper={
            isIntroductionAtMax
              ? `최대 ${INTRODUCTION_MAX_LENGTH}자까지 입력할 수 있어요`
              : undefined
          }
          required
        />
        {!profile.isStudentCouncil && (
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <ActivityCategoryField value={field.value} onChange={field.onChange} />
            )}
          />
        )}
        <Controller
          name="keywords"
          control={control}
          render={({ field }) => (
            // TODO: 키워드 추천 API 확정 후 추천 목록 연결
            <KeywordField value={field.value} onChange={field.onChange} suggestions={[]} />
          )}
        />
        <LinkField control={control} />
      </div>
    </form>
  )
}

export { OrganizationProfileForm }
