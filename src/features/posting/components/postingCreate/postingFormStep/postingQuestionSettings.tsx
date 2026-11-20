'use client'

import { useEffect, useRef, type ComponentType, type ReactNode, type SVGProps } from 'react'
import { Controller, type Control } from 'react-hook-form'
import EditIcon from '@/assets/icons/edit.svg'
import FileTextIcon from '@/assets/icons/fileText.svg'
import FilterIcon from '@/assets/icons/filter.svg'
import ListIcon from '@/assets/icons/list.svg'
import TextLongIcon from '@/assets/icons/textLong.svg'
import UploadIcon from '@/assets/icons/upload.svg'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import { Chip } from '@/components/ui/Chip/chip'
import { TextField } from '@/components/ui/TextField/textField'
import { Toggle } from '@/components/ui/Toggle/toggle'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import {
  ACTIVITY_FIELDS,
  FILE_TYPES,
  type PostingQuestionType,
} from '@/features/posting/schemas/postingFormSchema'
import { cn } from '@/lib/utils'
import { toDigits } from '@/utils/number'
import { toggleInOrder } from '@/utils/toggleInOrder'
import { NumberStepper } from './numberStepper'
import { ACTIVITY_FIELD_LABEL, FILE_TYPE_LABEL, QUESTION_TYPE_META } from './postingQuestionTypes'

type QuestionName = `questionSets.${number}.questions.${number}`

const RECEIVE_OPTIONS = [
  { field: 'acceptsFile', label: '파일 업로드', example: 'PDF/ 이미지 등' },
  { field: 'acceptsLink', label: 'URL 링크', example: '노션/ Github 등' },
] as const

const REQUIRED_RULE_DESCRIPTION = {
  text: '답하지 않으면 제출할 수 없어요',
  activity: '활동을 최소 1개 이상 입력해야 제출할 수 있어요',
  file: '파일이나 링크 중 하나는 꼭 제출해야 해요',
} satisfies Record<PostingQuestionType, string>

// TODO: 최대 개수 상한 정책 확정 후 교체
const ACTIVITY_COUNT_RANGE = { min: 1, max: 10 }

const OPTION_ROW_CLASS =
  'flex items-center justify-between gap-gap-s border-t border-neutral-subtle p-padding-s first:border-t-0'

type PostingQuestionSettingsProps = {
  control: Control<PostingCreateValues>
  setIndex: number
  questionIndex: number
  type: PostingQuestionType
  shouldFocusTitle?: boolean
  className?: string
}

function PostingQuestionSettings({
  control,
  setIndex,
  questionIndex,
  type,
  shouldFocusTitle = false,
  className,
}: PostingQuestionSettingsProps) {
  const name: QuestionName = `questionSets.${setIndex}.questions.${questionIndex}`
  const { label, Icon } = QUESTION_TYPE_META[type]
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (shouldFocusTitle) {
      titleInputRef.current?.focus()
    }
  }, [shouldFocusTitle])

  return (
    <aside
      aria-label={`Q${questionIndex + 1} 문항 설정`}
      className={cn(
        'flex w-100 shrink-0 flex-col gap-gap-xl rounded-xl border border-neutral-muted bg-layer-default p-padding-xl shadow-floating',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-weak text-brand">
          <Icon aria-hidden className="size-4.5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-caption1 font-medium text-brand">Q{questionIndex + 1}</p>
          <p className="text-body1 font-semibold text-neutral">{label}</p>
        </div>
      </div>
      <SettingsSection Icon={EditIcon} title="내용">
        <div className="flex flex-col gap-gap-l">
          <Controller
            name={`${name}.title`}
            control={control}
            render={({ field: { ref, ...field } }) => (
              <TextField
                ref={(element) => {
                  ref(element)
                  titleInputRef.current = element
                }}
                label="질문"
                required
                placeholder="질문을 입력해 주세요"
                {...field}
              />
            )}
          />
          <Controller
            name={`${name}.description`}
            control={control}
            render={({ field }) => (
              <TextField label="설명" placeholder="설명을 입력해 주세요" {...field} />
            )}
          />
        </div>
      </SettingsSection>
      {type === 'text' && (
        <>
          <hr className="border-neutral-subtle" />
          <SettingsSection Icon={TextLongIcon} title="글자 수">
            <Controller
              name={`${name}.maxLength`}
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <TextField
                  label="최대 글자 수"
                  required
                  inputMode="numeric"
                  onChange={(event) => onChange(toDigits(event.target.value))}
                  {...field}
                />
              )}
            />
          </SettingsSection>
        </>
      )}
      {type === 'file' && <FileSettings control={control} name={name} />}
      {type === 'activity' && <ActivityFieldSettings control={control} name={name} />}
      <hr className="border-neutral-subtle" />
      <SettingsSection Icon={FilterIcon} title="응답 규칙">
        <div className="flex flex-col gap-gap-l">
          {type === 'activity' && (
            <Controller
              name={`${name}.maxActivityCount`}
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-gap-m">
                  <RuleText
                    label="최대 개수"
                    description="지원자가 입력할 수 있는 활동 개수를 정해요"
                  />
                  <NumberStepper
                    label="최대 개수"
                    value={field.value}
                    onValueChange={field.onChange}
                    {...ACTIVITY_COUNT_RANGE}
                  />
                </div>
              )}
            />
          )}
          <Controller
            name={`${name}.isRequired`}
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-gap-m">
                <RuleText label="필수 응답" description={REQUIRED_RULE_DESCRIPTION[type]} />
                <Toggle checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
        </div>
      </SettingsSection>
    </aside>
  )
}

type QuestionSettingsGroupProps = {
  control: Control<PostingCreateValues>
  name: QuestionName
}

function FileSettings({ control, name }: QuestionSettingsGroupProps) {
  return (
    <>
      <hr className="border-neutral-subtle" />
      <SettingsSection Icon={UploadIcon} title="받는 방식">
        <div className="flex flex-col overflow-hidden rounded-[10px] border border-neutral-muted">
          {RECEIVE_OPTIONS.map(({ field: optionField, label, example }) => (
            <Controller
              key={optionField}
              name={`${name}.${optionField}`}
              control={control}
              render={({ field }) => (
                <div className={OPTION_ROW_CLASS}>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  >
                    {label}
                  </Checkbox>
                  <span className="shrink-0 text-caption1 font-normal text-neutral-subtle">
                    {example}
                  </span>
                </div>
              )}
            />
          ))}
        </div>
      </SettingsSection>
      <hr className="border-neutral-subtle" />
      <SettingsSection Icon={FileTextIcon} title="허용 파일 방식">
        <Controller
          name={`${name}.fileTypes`}
          control={control}
          render={({ field }) => (
            <div role="group" aria-label="허용 파일 방식" className="flex flex-wrap gap-1.5">
              {FILE_TYPES.map((fileType) => (
                <Chip
                  key={fileType}
                  pressed={field.value.includes(fileType)}
                  onPressedChange={(isPressed) =>
                    field.onChange(toggleInOrder(FILE_TYPES, field.value, fileType, isPressed))
                  }
                >
                  {FILE_TYPE_LABEL[fileType]}
                </Chip>
              ))}
            </div>
          )}
        />
      </SettingsSection>
    </>
  )
}

function ActivityFieldSettings({ control, name }: QuestionSettingsGroupProps) {
  return (
    <>
      <hr className="border-neutral-subtle" />
      <SettingsSection Icon={ListIcon} title="입력 항목">
        <Controller
          name={`${name}.activityFields`}
          control={control}
          render={({ field }) => (
            <div className="flex flex-col overflow-hidden rounded-[10px] border border-neutral-muted">
              <div className={OPTION_ROW_CLASS}>
                <Checkbox checked disabled>
                  활동명
                </Checkbox>
              </div>
              {ACTIVITY_FIELDS.map((activityField) => (
                <div key={activityField} className={OPTION_ROW_CLASS}>
                  <Checkbox
                    checked={field.value.includes(activityField)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        toggleInOrder(
                          ACTIVITY_FIELDS,
                          field.value,
                          activityField,
                          checked === true,
                        ),
                      )
                    }
                  >
                    {ACTIVITY_FIELD_LABEL[activityField]}
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        />
      </SettingsSection>
    </>
  )
}

function RuleText({ label, description }: { label: string; description: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-gap-xxs">
      <span className="text-label1 font-semibold text-neutral">{label}</span>
      <span className="text-caption1 font-normal text-neutral-subtle">{description}</span>
    </span>
  )
}

type SettingsSectionProps = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  children: ReactNode
}

function SettingsSection({ Icon, title, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-gap-m">
      <h3 className="flex items-center gap-gap-xs text-caption1 font-medium text-neutral-subtle">
        <Icon aria-hidden className="size-3.5 shrink-0" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export { PostingQuestionSettings }
