import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import { Button } from '@/components/ui/Button/button'

type OrganizationMembersErrorProps = {
  onRetry: () => void
}

// TODO: 오류 상태 디자인 확인 필요
function OrganizationMembersError({ onRetry }: OrganizationMembersErrorProps) {
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
      <p className="text-body2 font-semibold text-neutral-muted">운영진 목록을 불러오지 못했어요</p>
      <Button variant="secondary" size="s" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}

export { OrganizationMembersError }
