import type { ReactNode } from 'react'

type PostingInfoRowProps = {
  label: string
  children: ReactNode
}

// dl 안에서 사용, 핵심 정보·일정·단체 소개 행 공통
function PostingInfoRow({ label, children }: PostingInfoRowProps) {
  return (
    <div className="flex items-start gap-gap-l text-label1">
      <dt className="w-18 shrink-0 font-medium text-neutral-subtle">{label}</dt>
      <dd className="min-w-0 flex-1 font-semibold break-words break-keep text-neutral">
        {children}
      </dd>
    </div>
  )
}

export { PostingInfoRow }
