import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import type { PostingListItem } from '@/features/posting/components/postingList/postingListContent'
import type { PostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import type { PostingsQuery } from '@/gql/graphql'
import { getDaysBetween, getSeoulIsoDate } from '@/utils/date'

type PostingCard = PostingsQuery['postings']['items'][number]
type PostingCardPosition = NonNullable<PostingCard['positions'][number]>

// 목록은 모집 중 공고만 와서 시작일 없이 모집 중으로 처리, 마감이 지났으면 당일로 고정
function getPostingCardPhase(recruitEndAt: string, now: Date): PostingRecruitmentPhase {
  const daysLeft = getDaysBetween(getSeoulIsoDate(now), getSeoulIsoDate(new Date(recruitEndAt)))
  return { status: 'open', daysLeft: Math.max(daysLeft, 0) }
}

// 명세상 목록 안 값이 null일 수 있어 제외, 응답 순서 대신 sortOrder 순
function getPostingCardPositionNames(positions: PostingCard['positions']) {
  return positions
    .filter((position): position is PostingCardPosition => position !== null)
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .map((position) => position.name)
}

function toPostingListItem(card: PostingCard, now: Date): PostingListItem {
  return {
    id: card.id,
    href: getPostingDetailPath(card.id),
    title: card.title,
    organizationType: ORGANIZATION_TYPE_LABEL[card.organization.type],
    organizationName: card.organization.name,
    phase: getPostingCardPhase(card.recruitEndAt, now),
    tags: getPostingCardPositionNames(card.positions),
    thumbnailSrc: card.thumbnailUrl ?? undefined,
  }
}

function getPostingListTotalPages(totalCount: number, pageSize: number) {
  return Math.ceil(totalCount / pageSize)
}

export {
  getPostingCardPhase,
  getPostingCardPositionNames,
  getPostingListTotalPages,
  toPostingListItem,
}
export type { PostingCard }
