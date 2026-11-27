import { Avatar } from '@/components/ui/Avatar/avatar'
import { SectionHeader } from '@/components/ui/SectionHeader/sectionHeader'
import {
  formatLinkAddress,
  getOrganizationLinkLabel,
  isHttpUrl,
} from '@/features/organization/utils/organizationLink'
import { ACTIVITY_CATEGORY_BY_FIELD } from '@/features/organization/utils/organizationProfile'
import type { PostingOrganization } from '@/features/posting/types'
import { getPostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import { PostingInfoRow } from './postingInfoRow'
import { RecruitRow } from './recruitRow'

type OrganizationIntroPanelProps = {
  organization: PostingOrganization
  now: Date
  // 공고 미리보기는 단체 링크·다른 모집으로 이동하지 않고 내용만 표시
  isPreview?: boolean
}

function OrganizationIntroPanel({
  organization,
  now,
  isPreview = false,
}: OrganizationIntroPanelProps) {
  const { name, logoUrl, tagline, fields, keywords, links, ongoingPostings } = organization
  const activityFieldLabels = fields.map((field) => ACTIVITY_CATEGORY_BY_FIELD[field]).join(', ')

  return (
    <div className="flex flex-col gap-gap-xl">
      <div className="flex items-center gap-gap-s">
        <Avatar size={32} src={logoUrl} />
        <p className="min-w-0 text-label1 font-semibold break-words break-keep text-neutral">
          {name}
        </p>
      </div>
      <div className="flex flex-col gap-gap-xxl">
        <dl className="flex flex-col gap-gap-m">
          {tagline && <PostingInfoRow label="한 줄 소개">{tagline}</PostingInfoRow>}
          {activityFieldLabels && (
            <PostingInfoRow label="활동 분야">{activityFieldLabels}</PostingInfoRow>
          )}
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
                    {isHttpUrl(url) && isPreview && (
                      <span className="flex min-w-0 items-center gap-gap-xs">
                        <span className="shrink-0 underline">{getOrganizationLinkLabel(url)}</span>
                        <span className="min-w-0 truncate text-label2 font-medium text-neutral-subtle">
                          {formatLinkAddress(url)}
                        </span>
                      </span>
                    )}
                    {isHttpUrl(url) && !isPreview && (
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
                    )}
                    {/* 주소 형식이 아니면 상대 경로로 깨지지 않도록 글자만 표시 */}
                    {!isHttpUrl(url) && <span className="min-w-0 truncate">{url}</span>}
                  </li>
                ))}
              </ul>
            </PostingInfoRow>
          )}
        </dl>
        {ongoingPostings.length > 0 && (
          <section className="flex flex-col gap-gap-l">
            <SectionHeader title="진행 중인 다른 모집" />
            <ul className="flex flex-col gap-gap-s">
              {ongoingPostings.map(
                ({ postingId, title, recruitmentStartsAt, recruitmentEndsAt }) => (
                  <li key={postingId}>
                    <RecruitRow
                      href={isPreview ? undefined : getPostingDetailPath(postingId)}
                      title={title}
                      phase={getPostingRecruitmentPhase(
                        recruitmentStartsAt,
                        recruitmentEndsAt,
                        now,
                      )}
                    />
                  </li>
                ),
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

export { OrganizationIntroPanel }
