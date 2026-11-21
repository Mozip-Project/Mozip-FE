'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { TextField } from '@/components/ui/TextField/textField'
import { useUpdateOrganizationMutation } from '@/features/organization/api/organizer/queries'
import {
  INTRODUCTION_MAX_LENGTH,
  createOrganizationProfileSchema,
  type OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import {
  isStudentCouncil,
  toOrganizationProfileValues,
  toOrganizationSummary,
  toProfileFieldErrors,
  toUpdateOrganizationInput,
  type ProfileFieldPath,
} from '@/features/organization/utils/organizationProfile'
import type { OrganizationProfileFieldsFragment } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'
import { ActivityCategoryField } from './activityCategoryField'
import { KeywordSuggestionField } from './keywordSuggestionField'
import { LinkField } from './linkField'
import { LogoField } from './logoField'
import { OrganizationSummary } from './organizationSummary'

// 오류 문구 자리가 있는 입력, 나머지 서버 오류는 토스트로 안내
const INLINE_ERROR_PATHS: readonly ProfileFieldPath[] = ['introduction', 'links.0.url']

type OrganizationProfileFormProps = {
  // 단체가 바뀌면 호출부에서 key로 폼을 새로 만듦
  organization: OrganizationProfileFieldsFragment
}

function OrganizationProfileForm({ organization }: OrganizationProfileFormProps) {
  const isStudentCouncilOrganization = isStudentCouncil(organization)
  const { showToast } = useToast()
  const updateOrganization = useUpdateOrganizationMutation(organization.id)
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isValid, isDirty, isSubmitting, errors },
  } = useForm<OrganizationProfileValues>({
    mode: 'onChange',
    resolver: zodResolver(
      createOrganizationProfileSchema({
        isStudentCouncil: isStudentCouncilOrganization,
        hasSavedLogo: organization.logoUrl !== null,
      }),
    ),
    defaultValues: toOrganizationProfileValues(organization),
  })
  // 저장 중에는 입력이 잠겨 포커스를 줄 수 없어, 잠금이 풀린 뒤 첫 오류 칸으로 이동
  const [errorFocusPath, setErrorFocusPath] = useState<ProfileFieldPath | null>(null)
  const canSave = isValid && isDirty && !isSubmitting

  useEffect(() => {
    if (!isSubmitting && errorFocusPath) {
      setFocus(errorFocusPath)
    }
  }, [isSubmitting, errorFocusPath, setFocus])
  // 최대 글자수에 도달하면 더 입력되지 않으므로 안내만 표시
  const isIntroductionAtMax =
    useWatch({ control, name: 'introduction' }).length >= INTRODUCTION_MAX_LENGTH
  const introductionServerError =
    errors.introduction?.type === 'server' ? errors.introduction.message : undefined
  const introductionHelper =
    introductionServerError ??
    (isIntroductionAtMax ? `최대 ${INTRODUCTION_MAX_LENGTH}자까지 입력할 수 있어요` : undefined)

  async function handleSave(values: OrganizationProfileValues) {
    // 이전 저장의 오류 칸으로 다시 포커스가 가지 않도록 초기화
    setErrorFocusPath(null)
    try {
      const saved = await updateOrganization.mutateAsync(
        toUpdateOrganizationInput(values, isStudentCouncilOrganization),
      )
      // 서버가 정리한 값(https 링크 등)을 새 기준으로 삼아 다시 바꿀 때까지 저장 비활성
      reset(toOrganizationProfileValues(saved))
      showToast({ title: '단체 프로필을 저장했어요' })
    } catch (error) {
      showSaveError(error)
    }
  }

  function showSaveError(error: unknown) {
    const fieldErrors = error instanceof ApiError ? toProfileFieldErrors(error.fieldErrors) : []
    const inlineErrors = fieldErrors.filter(({ path }) => INLINE_ERROR_PATHS.includes(path))
    const otherError = fieldErrors.find(({ path }) => !INLINE_ERROR_PATHS.includes(path))

    inlineErrors.forEach(({ path, message }) => {
      setError(path, { type: 'server', message })
    })
    setErrorFocusPath(inlineErrors[0]?.path ?? null)

    if (inlineErrors.length > 0 && !otherError) {
      return
    }
    showToast({
      title: '단체 프로필을 저장하지 못했어요',
      description: otherError?.message ?? '잠시 후 다시 시도해 주세요',
      icon: 'alert',
    })
  }

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
      <div className="flex flex-col gap-gap-s">
        <OrganizationSummary summary={toOrganizationSummary(organization)} />
        {/* 저장 중 입력이 응답 후 reset으로 덮어써지지 않도록 모든 입력 잠금 */}
        <fieldset
          disabled={isSubmitting}
          className="flex min-w-0 flex-col gap-gap-xl bg-layer-default p-padding-xl"
        >
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <LogoField
                value={field.value}
                onChange={field.onChange}
                savedLogoUrl={organization.logoUrl}
              />
            )}
          />
          <TextField
            label="단체명"
            helper="단체명 변경은 관리자에게 문의해 주세요"
            defaultValue={organization.name}
            disabled
          />
          <TextField
            {...register('introduction')}
            label={`한 줄 소개 (최대 ${INTRODUCTION_MAX_LENGTH}자)`}
            placeholder="단체 소개를 입력해 주세요"
            maxLength={INTRODUCTION_MAX_LENGTH}
            aria-invalid={isIntroductionAtMax || introductionServerError !== undefined}
            helper={introductionHelper}
            required
          />
          {!isStudentCouncilOrganization && (
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
              <KeywordSuggestionField value={field.value} onChange={field.onChange} />
            )}
          />
          <LinkField control={control} />
        </fieldset>
      </div>
    </form>
  )
}

export { OrganizationProfileForm }
