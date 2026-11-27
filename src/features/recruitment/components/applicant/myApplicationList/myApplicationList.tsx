'use client'

import Link from 'next/link'
import UsersIcon from '@/assets/icons/users.svg'
import { Button } from '@/components/ui/Button/button'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { COMING_SOON_TOAST } from '@/features/organization/constants'
import { useMyApplicationsQuery } from '@/features/recruitment/api/applicant/queries'
import { toMyApplications } from '@/features/recruitment/utils/myApplication'
import { useToast } from '@/providers/toastProvider'
import { MyApplicationCard } from './myApplicationCard'
import { MyApplicationListSkeleton } from './myApplicationListSkeleton'

const IN_PROGRESS_TAB = 'inProgress'

function MyApplicationList() {
  const { showToast } = useToast()
  const { data, isError, refetch } = useMyApplicationsQuery()
  // undefined는 조회 중, 탭 숫자를 '-'로 표시
  const myApplications = data && toMyApplications(data)
  const tabs = [
    {
      value: IN_PROGRESS_TAB,
      label: '진행 중',
      count: myApplications ? myApplications.applications.length : null,
    },
    {
      value: 'draft',
      label: '작성 중',
      count: myApplications ? myApplications.draftCount : null,
      isUnavailable: true,
    },
    // TODO: 종료 기준이 정해지면 개수 표시
    { value: 'ended', label: '종료', isUnavailable: true },
  ]

  // MVP는 진행 중 탭만 제공, 나머지는 탭을 바꾸지 않고 안내만 표시
  function handleTabChange(nextTab: string) {
    if (nextTab !== IN_PROGRESS_TAB) {
      showToast(COMING_SOON_TOAST)
    }
  }

  function renderList() {
    if (myApplications) {
      if (myApplications.applications.length === 0) {
        return (
          <EmptyState
            icon={<UsersIcon className="size-7" />}
            title="아직 지원한 공고가 없어요"
            description="관심 있는 공고에 지원하면 여기에서 진행 상황을 볼 수 있어요."
            actions={
              <Button asChild size="m">
                <Link href="/">공고 둘러보기</Link>
              </Button>
            }
          />
        )
      }

      return (
        // Safari VoiceOver 목록 인식용 role
        <ul role="list" className="flex flex-col gap-gap-l">
          {myApplications.applications.map((application) => (
            <li key={application.id}>
              <MyApplicationCard application={application} />
            </li>
          ))}
        </ul>
      )
    }
    // TODO: 조회 실패 화면
    if (isError) {
      return (
        <div role="alert">
          <EmptyState
            icon={<UsersIcon className="size-7" />}
            title="지원 내역을 불러오지 못했어요"
            actions={
              <Button variant="secondary" size="m" onClick={() => void refetch()}>
                다시 시도
              </Button>
            }
          />
        </div>
      )
    }
    return <MyApplicationListSkeleton />
  }

  return (
    <ListToolBar
      tabs={tabs}
      tabsLabel="지원 상태"
      value={IN_PROGRESS_TAB}
      onValueChange={handleTabChange}
      hasBottomGap
    >
      <div className="pt-gap-xl">{renderList()}</div>
    </ListToolBar>
  )
}

export { MyApplicationList }
