import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { Stepper } from '@/components/ui/Stepper/stepper'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import type { MyApplication } from '@/features/recruitment/types'
import {
  getMyApplicationGuide,
  getMyApplicationSteps,
} from '@/features/recruitment/utils/myApplication'

type MyApplicationCardProps = {
  application: MyApplication
}

function MyApplicationCard({ application }: MyApplicationCardProps) {
  const { postingTitle, positionName, organizationName } = application
  const title = positionName ? `${postingTitle} · ${positionName}` : postingTitle
  const guide = getMyApplicationGuide(application)

  return (
    <article className="flex flex-col gap-5 rounded-l border border-neutral-weak bg-layer-default p-padding-xl">
      <div className="flex min-w-0 flex-col gap-gap-xs break-words break-keep">
        <h2 className="text-heading2 font-bold text-neutral">{title}</h2>
        <p className="text-label1 text-neutral-muted">{organizationName}</p>
      </div>
      <Stepper label={`${title} 진행 단계`} steps={getMyApplicationSteps(application)} />
      <SummaryBar
        status={guide.status}
        shouldAnnounce={false}
        className="border-0 bg-neutral-weak shadow-none"
        actions={
          <Button asChild variant="secondary" size="m">
            <Link href={`/applications/${application.id}`} aria-label={`${title} 지원서 보기`}>
              지원서 보기
            </Link>
          </Button>
        }
      >
        {guide.message}
      </SummaryBar>
    </article>
  )
}

export { MyApplicationCard }
