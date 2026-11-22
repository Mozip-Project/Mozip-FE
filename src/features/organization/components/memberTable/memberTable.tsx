import { Badge, type BADGE_TONES } from '@/components/ui/Badge/badge'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { TableCell, TableHeadAction, TableHeadCell } from '@/components/ui/Table/table'
import type { MemberRole, OrganizationMember } from '@/features/organization/types'
import { cn } from '@/lib/utils'
import { formatYearMonth } from '@/utils/date'
import { MemberActionMenu } from './memberActionMenu'
import type { ReactNode } from 'react'

const COLUMN_CLASS = {
  name: 'w-60 shrink-0',
  role: 'w-35 shrink-0',
  team: 'w-30 shrink-0',
  joinedAt: 'w-35 shrink-0',
  action: 'flex min-w-0 flex-1 items-center justify-end',
}

const ROW_CLASS = 'flex items-center px-padding-l'

const ROLE_BADGE = {
  owner: { label: '대표자', tone: 'brand' },
  member: { label: '운영진', tone: 'neutral' },
} satisfies Record<MemberRole, { label: string; tone: (typeof BADGE_TONES)[number] }>

const ROLE_PERMISSION_DESCRIPTION =
  '대표자: 결제 및 이용권 관리, 운영진 관리, 대표 권한 이전, 면접 및 결과 안내\n운영진: 지원자 관리, 면접 및 결과 안내'

// 서버 응답 전 화면 높이 유지용 행 개수
const SKELETON_ROW_KEYS = ['first', 'second', 'third', 'fourth']

type MemberTableProps = {
  members: OrganizationMember[]
}

function MemberTable({ members }: MemberTableProps) {
  return (
    <MemberTableFrame isLoading={false}>
      {members.map((member) => (
        <MemberRow key={member.id} member={member} />
      ))}
    </MemberTableFrame>
  )
}

function MemberTableSkeleton() {
  return (
    <MemberTableFrame isLoading>
      {SKELETON_ROW_KEYS.map((key) => (
        <MemberSkeletonRow key={key} />
      ))}
    </MemberTableFrame>
  )
}

function MemberTableFrame({ isLoading, children }: { isLoading: boolean; children: ReactNode }) {
  return (
    <div className="relative overflow-x-auto bg-layer-default">
      <div role="table" aria-label="운영진 목록" aria-busy={isLoading} className="min-w-[880px]">
        <div role="row" className={cn(ROW_CLASS, 'bg-neutral-weak py-padding-s')}>
          <TableHeadCell className={COLUMN_CLASS.name}>이름</TableHeadCell>
          <TableHeadCell
            className={COLUMN_CLASS.role}
            actions={
              <InfoPopover
                trigger={<TableHeadAction icon="info" label="권한 안내 보기" />}
                title="권한 안내"
                description={ROLE_PERMISSION_DESCRIPTION}
                side="bottom"
                sideOffset={8}
              />
            }
          >
            권한
          </TableHeadCell>
          <TableHeadCell className={COLUMN_CLASS.team}>소속팀</TableHeadCell>
          <TableHeadCell className={COLUMN_CLASS.joinedAt}>합류일</TableHeadCell>
          <TableHeadCell className={COLUMN_CLASS.action}>
            <span className="sr-only">관리</span>
          </TableHeadCell>
        </div>
        {children}
      </div>
    </div>
  )
}

function MemberSkeletonRow() {
  return (
    <div
      aria-hidden
      className={cn(
        ROW_CLASS,
        'animate-skeleton-delayed-show border-t border-neutral-subtle py-3.5',
      )}
    >
      <span className={cn(COLUMN_CLASS.name, 'flex h-7 items-center')}>
        <span className="skeleton-bar h-3.5 w-15 rounded-full" />
      </span>
      <span className={cn(COLUMN_CLASS.role, 'flex items-center')}>
        <span className="skeleton-bar h-3.5 w-12 rounded-full" />
      </span>
      <span className={cn(COLUMN_CLASS.team, 'flex items-center')}>
        <span className="skeleton-bar h-3.5 w-10 rounded-full" />
      </span>
      <span className={cn(COLUMN_CLASS.joinedAt, 'flex items-center')}>
        <span className="skeleton-bar h-3.5 w-15 rounded-full" />
      </span>
    </div>
  )
}

function MemberRow({ member }: { member: OrganizationMember }) {
  const displayName = member.isMe ? `${member.name} (나)` : member.name
  const roleBadge = ROLE_BADGE[member.role]

  return (
    <div role="row" className={cn(ROW_CLASS, 'border-t border-neutral-subtle py-3.5')}>
      <TableCell type="name" className={cn(COLUMN_CLASS.name, 'h-7')}>
        {displayName}
      </TableCell>
      <span role="cell" className={cn(COLUMN_CLASS.role, 'flex items-center')}>
        <Badge tone={roleBadge.tone} variant="weak">
          {roleBadge.label}
        </Badge>
      </span>
      <TableCell type="text" className={COLUMN_CLASS.team}>
        {member.team}
      </TableCell>
      <TableCell type="text" className={COLUMN_CLASS.joinedAt}>
        {formatYearMonth(member.joinedAt)}
      </TableCell>
      <span role="cell" className={COLUMN_CLASS.action}>
        <MemberActionMenu memberName={member.name} role={member.role} />
      </span>
    </div>
  )
}

export { MemberTable, MemberTableSkeleton }
