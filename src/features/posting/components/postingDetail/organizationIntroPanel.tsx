import { SectionHeader } from '@/components/ui/SectionHeader/sectionHeader'
import {
  formatLinkAddress,
  getOrganizationLinkLabel,
  isHttpUrl,
} from '@/features/organization/utils/organizationLink'
import type { PostingOrganization } from '@/features/posting/types'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import { PostingInfoRow } from './postingInfoRow'
import { RecruitRow } from './recruitRow'

type OrganizationIntroPanelProps = {
  organization: PostingOrganization
  currentPostingId: string
}

function OrganizationIntroPanel({ organization, currentPostingId }: OrganizationIntroPanelProps) {
  const { introduction, keywords, links, ongoingPostings } = organization
  const otherPostings = ongoingPostings.filter(({ postingId }) => postingId !== currentPostingId)

  return (
    <div className="flex flex-col gap-gap-xxl">
      <dl className="flex flex-col gap-gap-m">
        {introduction && <PostingInfoRow label="소개">{introduction}</PostingInfoRow>}
        {keywords.length > 0 && (
          <PostingInfoRow label="키워드">
            <ul className="flex flex-wrap gap-x-gap-s">
              {keywords.map((keyword) => (
                <li key={keyword}>#{keyword}</li>
              ))}
            </ul>
          </PostingInfoRow>
        )}
        {links.length > 0 && (
          <PostingInfoRow label="링크">
            <ul className="flex flex-col gap-gap-s">
              {links.map((url) => (
                <li key={url} className="flex">
                  {isHttpUrl(url) ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center gap-gap-xs rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                    >
                      <span className="shrink-0 underline">{getOrganizationLinkLabel(url)}</span>
                      <span className="min-w-0 truncate text-label2 font-medium text-neutral-subtle">
                        {formatLinkAddress(url)}
                      </span>
                      <span className="sr-only">(새 탭)</span>
                    </a>
                  ) : (
                    // 주소 형식이 아니면 상대 경로로 깨지지 않도록 글자만 표시
                    <span className="min-w-0 truncate">{url}</span>
                  )}
                </li>
              ))}
            </ul>
          </PostingInfoRow>
        )}
      </dl>
      {otherPostings.length > 0 && (
        <section className="flex flex-col gap-gap-l">
          <SectionHeader title="진행 중인 다른 모집" />
          <ul className="flex flex-col gap-gap-s">
            {otherPostings.map(({ postingId, title, summary }) => (
              <li key={postingId}>
                <RecruitRow
                  href={getPostingDetailPath(postingId)}
                  title={title}
                  summary={summary}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export { OrganizationIntroPanel }
