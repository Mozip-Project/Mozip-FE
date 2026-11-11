import { useEffect, useEffectEvent, useState } from 'react'
import { useDebounce } from './useDebounce'

// 검색창 입력값을 URL 반영 전까지 따로 보관하고, 입력을 멈춘 뒤 검색 실행
function useDebouncedSearch(appliedKeyword: string, onSearch: (keyword: string) => void) {
  const [draftKeyword, setDraftKeyword] = useState<string | null>(null)
  const [isSearchPending, setIsSearchPending] = useState(false)
  const searchDebounce = useDebounce()

  // 반영되면 뒤로 가기 등 이후 주소 변경을 따르도록 입력값 해제
  // 예약된 검색이 있으면 이전 검색 이동 중 URL과 우연히 같아진 입력이라 유지
  if (draftKeyword === appliedKeyword && !isSearchPending) {
    setDraftKeyword(null)
  }

  function cancelPendingSearch() {
    searchDebounce.cancel()
    setIsSearchPending(false)
  }

  // 검색 대신 다른 이동을 고른 경우, 예약된 검색이 이동한 조건을 덮지 않도록 입력값까지 버림
  function discardDraft() {
    cancelPendingSearch()
    setDraftKeyword(null)
  }

  // 뒤로, 앞으로 가기 뒤 예약된 검색이 이전 조건으로 다시 이동하지 않도록 취소
  const handleHistoryNavigate = useEffectEvent(discardDraft)

  useEffect(() => {
    function handlePopState() {
      handleHistoryNavigate()
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 검색어를 모두 지우면 기다리지 않고 전체 목록으로 복귀
  function changeKeyword(nextKeyword: string) {
    setDraftKeyword(nextKeyword)

    if (nextKeyword === '') {
      cancelPendingSearch()
      onSearch(nextKeyword)
      return
    }

    setIsSearchPending(true)
    searchDebounce.schedule(() => {
      setIsSearchPending(false)
      onSearch(nextKeyword)
    })
  }

  return {
    // 검색창에 보여 줄 값, URL 반영 전 입력 중인 글자 포함
    keyword: draftKeyword ?? appliedKeyword,
    changeKeyword,
    // 필터, 정렬 등 다른 조건을 바꿀 때 입력 중인 검색어를 함께 적용하므로 대기 중인 검색 취소
    cancelPendingSearch,
    // 페이지 이동처럼 지금 보이는 결과를 기준으로 이동할 때 사용
    discardDraft,
  }
}

export { useDebouncedSearch }
