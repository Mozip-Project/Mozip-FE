import {
  POSTING_ACTIVITY_FIELD_LABEL,
  POSTING_ACTIVITY_FIELDS,
  POSTING_ACTIVITY_TYPE_LABEL,
  POSTING_ACTIVITY_TYPES,
  POSTING_SCOPE_LABEL,
  POSTING_SCOPES,
  type PostingActivityField,
  type PostingActivityType,
  type PostingFilterValues,
  type PostingScope,
} from '@/features/posting/types'
import { PostingFilterSection, type PostingFilterOption } from './postingFilterSection'

const SCOPE_OPTIONS: PostingFilterOption<PostingScope>[] = POSTING_SCOPES.map((value) => ({
  value,
  label: POSTING_SCOPE_LABEL[value],
}))

const ACTIVITY_TYPE_OPTIONS: PostingFilterOption<PostingActivityType>[] =
  POSTING_ACTIVITY_TYPES.map((value) => ({ value, label: POSTING_ACTIVITY_TYPE_LABEL[value] }))

const ACTIVITY_FIELD_OPTIONS: PostingFilterOption<PostingActivityField>[] =
  POSTING_ACTIVITY_FIELDS.map((value) => ({ value, label: POSTING_ACTIVITY_FIELD_LABEL[value] }))

type PostingFilterGroupProps = {
  values: PostingFilterValues
  onValuesChange: (values: PostingFilterValues) => void
}

function PostingFilterGroup({ values, onValuesChange }: PostingFilterGroupProps) {
  // 검색어 등 다른 조건이 섞인 객체가 와도 필터 세 필드만 전달
  const { scopes, activityTypes, activityFields } = values

  return (
    <div className="flex flex-col gap-gap-xl">
      <PostingFilterSection
        title="공고 범위"
        allLabel="공고 전체"
        options={SCOPE_OPTIONS}
        values={scopes}
        onValuesChange={(nextScopes) =>
          onValuesChange({ scopes: nextScopes, activityTypes, activityFields })
        }
      />
      <hr className="border-neutral-subtle" />
      <PostingFilterSection
        title="활동 유형"
        allLabel="유형 전체"
        options={ACTIVITY_TYPE_OPTIONS}
        values={activityTypes}
        onValuesChange={(nextActivityTypes) =>
          onValuesChange({ scopes, activityTypes: nextActivityTypes, activityFields })
        }
      />
      <hr className="border-neutral-subtle" />
      <PostingFilterSection
        title="활동 분야"
        allLabel="분야 전체"
        options={ACTIVITY_FIELD_OPTIONS}
        values={activityFields}
        onValuesChange={(nextActivityFields) =>
          onValuesChange({ scopes, activityTypes, activityFields: nextActivityFields })
        }
      />
    </div>
  )
}

export { PostingFilterGroup }
