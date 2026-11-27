import { cn } from '@/lib/utils'

type ActivityColumn = 'name' | 'period' | 'role' | 'achievement'

// 지원자가 끈 항목이나 비운 칸은 값 없음
type Activity = Partial<Record<ActivityColumn, string>>

// 주요 성과는 남은 폭 사용
const ACTIVITY_COLUMN_CONTENT = {
  name: { label: '활동명', widthClassName: 'w-29' },
  period: { label: '활동 기간', widthClassName: 'w-36' },
  role: { label: '역할', widthClassName: 'w-22' },
  achievement: { label: '주요 성과', widthClassName: '' },
} satisfies Record<ActivityColumn, { label: string; widthClassName: string }>

type ActivityTableProps = {
  columns: readonly ActivityColumn[]
  activities: readonly Activity[]
}

// 활동 경험 문항 카드의 표, 켠 항목만 열로 표시
function ActivityTable({ columns, activities }: ActivityTableProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-m border border-neutral-subtle">
      <table className="w-full table-fixed text-left text-label2 break-words">
        <thead className="bg-neutral-weak">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  'px-padding-s py-padding-xs font-medium text-neutral-subtle',
                  ACTIVITY_COLUMN_CONTENT[column].widthClassName,
                )}
              >
                {ACTIVITY_COLUMN_CONTENT[column].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-layer-default">
          {/* 지원자가 입력한 순서 그대로라 순서 변경 없음 */}
          {activities.map((activity, index) => (
            <tr key={index} className="border-t border-neutral-subtle">
              {columns.map((column) => (
                <td
                  key={column}
                  className={cn(
                    'p-padding-s align-top',
                    column === 'name'
                      ? 'font-medium text-neutral'
                      : 'font-normal text-neutral-muted',
                    ACTIVITY_COLUMN_CONTENT[column].widthClassName,
                  )}
                >
                  {activity[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { ActivityTable }
export type { Activity, ActivityColumn }
