'use client'

import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import CheckIcon from '@/assets/icons/check.svg'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { Button } from '@/components/ui/Button/button'
import { TableCell, TableHeadCell } from '@/components/ui/Table/table'
import { cn } from '@/lib/utils'

const COLLAPSED_ROW_COUNT = 5

type RecipientDelivery =
  | { status: 'pending' }
  | { status: 'delivered' }
  | { status: 'failed'; message: string }
  | { status: 'emailCheck'; message: string }

type ResultNoticeRecipient = {
  id: string
  name: string
  position: string
  email: string
  delivery: RecipientDelivery
}

const COLUMN_CLASS = {
  name: 'w-47.5 shrink-0',
  position: 'w-25 shrink-0',
  email: 'w-50 shrink-0',
  status: 'flex min-w-0 flex-1 items-center justify-end gap-gap-s',
}

const ROW_CLASS = 'flex items-center px-padding-xl'

const DELIVERY_ROW_CLASS = {
  pending: '',
  delivered: '',
  failed: 'bg-critical-weak',
  emailCheck: 'bg-warning-weak',
} satisfies Record<RecipientDelivery['status'], string>

type RecipientTableProps = {
  label: string
  recipients: readonly ResultNoticeRecipient[]
  // 발송 후 상태 열 제목, 없으면 화면 리더용 제목만 둠
  statusLabel?: string
}

function RecipientTable({ label, recipients, statusLabel }: RecipientTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const firstRevealedRowRef = useRef<HTMLDivElement>(null)
  const hiddenCount = recipients.length - COLLAPSED_ROW_COUNT
  const canExpand = !isExpanded && hiddenCount > 0
  const visibleRecipients = canExpand ? recipients.slice(0, COLLAPSED_ROW_COUNT) : recipients

  // 사라지는 더 보기 버튼 대신 새로 보인 첫 행으로 focus 이동
  function handleExpand() {
    flushSync(() => setIsExpanded(true))
    firstRevealedRowRef.current?.focus()
  }

  return (
    <div data-slot="recipient-table">
      <div role="table" aria-label={label}>
        <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak py-padding-xs')}>
          <TableHeadCell className={COLUMN_CLASS.name}>지원자</TableHeadCell>
          <TableHeadCell className={COLUMN_CLASS.position}>포지션</TableHeadCell>
          <TableHeadCell className={COLUMN_CLASS.email}>이메일</TableHeadCell>
          <TableHeadCell align="right" className="min-w-0 flex-1">
            {statusLabel ?? <span className="sr-only">발송 상태</span>}
          </TableHeadCell>
        </div>

        {visibleRecipients.map((recipient, index) => (
          <div
            key={recipient.id}
            ref={index === COLLAPSED_ROW_COUNT ? firstRevealedRowRef : undefined}
            role="row"
            tabIndex={index === COLLAPSED_ROW_COUNT ? -1 : undefined}
            className={cn(
              ROW_CLASS,
              'min-h-14 border-t border-neutral-subtle py-padding-s',
              'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
              DELIVERY_ROW_CLASS[recipient.delivery.status],
            )}
          >
            <TableCell type="name" className={COLUMN_CLASS.name}>
              {recipient.name}
            </TableCell>
            <TableCell type="text" className={COLUMN_CLASS.position}>
              {recipient.position}
            </TableCell>
            <TableCell type="text" className={COLUMN_CLASS.email}>
              {recipient.email}
            </TableCell>
            <div role="cell" className={COLUMN_CLASS.status}>
              <DeliveryStatus delivery={recipient.delivery} />
            </div>
          </div>
        ))}
      </div>

      {canExpand && (
        <div className="flex justify-center border-t border-neutral-subtle py-padding-s">
          <Button variant="tertiary" size="s" onClick={handleExpand}>
            {hiddenCount}명 더 보기
            <ChevronDownIcon aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}

function DeliveryStatus({ delivery }: { delivery: RecipientDelivery }) {
  switch (delivery.status) {
    case 'pending':
      return null
    case 'delivered':
      return (
        <>
          <CheckIcon aria-hidden className="size-4 shrink-0 text-positive" />
          <span className="sr-only">전달됨</span>
        </>
      )
    case 'failed':
      return (
        <p className="min-w-0 flex-1 text-right text-caption1 font-medium text-neutral">
          {delivery.message}
        </p>
      )
    case 'emailCheck':
      return <p className="text-right text-caption1 font-medium text-warning">{delivery.message}</p>
  }
}

export { RecipientTable }
export type { RecipientDelivery, ResultNoticeRecipient }
