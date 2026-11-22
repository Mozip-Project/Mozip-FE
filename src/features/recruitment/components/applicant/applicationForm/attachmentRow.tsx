import CloseIcon from '@/assets/icons/close.svg'
import { cn } from '@/lib/utils'

type AttachmentRowProps = {
  name: string
  onRemove: () => void
} & (
  | { status: 'default'; meta?: string }
  // onEdit이 있으면 이름·오류 영역을 눌러 수정
  | { status: 'error'; errorMessage: string; onEdit?: () => void }
  | { status: 'uploading'; progressPercent: number }
)

function AttachmentRow(props: AttachmentRowProps) {
  const { name, onRemove } = props
  const isUploading = props.status === 'uploading'
  const isError = props.status === 'error'
  const removeLabel = isUploading ? `${name} 업로드 취소` : `${name} 삭제`
  const onEdit = props.status === 'error' ? props.onEdit : undefined

  // button 안에도 둘 수 있도록 span 사용
  const details = (
    <span className="flex min-w-0 items-center gap-gap-s">
      <span title={name} className="min-w-0 truncate text-label1 font-medium text-neutral">
        {name}
      </span>{' '}
      {isError && (
        <span className="shrink-0 text-caption1 font-medium whitespace-nowrap text-critical">
          {props.errorMessage}
        </span>
      )}
      {props.status === 'default' && props.meta && (
        <span className="shrink-0 text-caption1 font-medium whitespace-nowrap text-disabled">
          {props.meta}
        </span>
      )}
    </span>
  )

  return (
    <div
      className={cn(
        'relative flex items-center gap-gap-m rounded-[10px] pr-padding-s pl-padding-m',
        isUploading ? 'py-padding-s' : 'h-13',
        isError ? 'border border-critical-solid bg-layer-default' : 'bg-neutral-weak',
      )}
    >
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          // 포커스 링이 줄 테두리 안쪽에 겹치지 않도록 줄 전체를 덮는 ::after에 표시
          className="flex min-w-0 flex-1 cursor-text items-center self-stretch text-left outline-none after:absolute after:-inset-px after:rounded-[10px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring focus-visible:after:outline-solid"
        >
          {details}
          <span className="sr-only">, 눌러서 수정</span>
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xs">
          {details}
          {isUploading && (
            <>
              <progress
                value={props.progressPercent}
                max={100}
                aria-label={`${name} 업로드 진행률`}
                className="h-1 w-full appearance-none overflow-hidden rounded-[2px] bg-neutral-weak-pressed [&::-moz-progress-bar]:bg-brand-solid [&::-webkit-progress-bar]:bg-neutral-weak-pressed [&::-webkit-progress-value]:rounded-[2px] [&::-webkit-progress-value]:bg-brand-solid"
              />
              <p className="text-caption1 font-medium text-disabled">업로드 중...</p>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="relative -mr-0.75 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xs text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        <CloseIcon aria-hidden className="size-4.5" />
      </button>
    </div>
  )
}

export { AttachmentRow }
export type { AttachmentRowProps }
