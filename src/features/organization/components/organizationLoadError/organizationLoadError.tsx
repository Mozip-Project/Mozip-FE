import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import { Button } from '@/components/ui/Button/button'

type OrganizationLoadErrorProps = {
  message: string
  onRetry: () => void
}

// TODO: 오류 상태 디자인 확인 필요
function OrganizationLoadError({ message, onRetry }: OrganizationLoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-gap-m rounded-l border border-neutral-weak bg-layer-default px-padding-xxl py-16 text-center"
    >
      <div
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-weak text-neutral-faint"
      >
        <AlertCircleIcon className="size-6" />
      </div>
      <p className="text-body2 font-semibold text-neutral-muted">{message}</p>
      <Button variant="secondary" size="s" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}

export { OrganizationLoadError }
