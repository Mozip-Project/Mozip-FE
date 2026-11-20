import type { PostingMethodValues } from '@/features/posting/schemas/postingMethodSchema'

// 통합 모집은 포지션 탭 없이 문항 묶음 하나
function getPositionNames({ recruitType, positions }: PostingMethodValues) {
  return recruitType === 'position' ? positions.map((position) => position.name) : []
}

export { getPositionNames }
