import { useEffect, useEffectEvent, useState } from 'react'
import { useDebounce } from './useDebounce'

// 검색창 입력값을 URL 반영 전까지 따로 보관하고, 입력을 멈춘 뒤 검색 실행
function useDebouncedSearch(appliedKeyword: string, onSearch: (keyword: string) => void) {
  const [draftKeyword, setDraftKeyword] = useState<string | null>(null)
  const searchDebounce = useDebounce()

  // 반영되면 뒤로 가기 등 이후 주소 변경을 따르도록 입력값 해제
  if (draftKeyword === appliedKeyword) {
    setDraftKeyword(null)
  }

  // 뒤로, 앞으로 가기 뒤 예약된 검색이 이전 조건으로 다시 이동하지 않도록 취소
  const handleHistoryNavigate = useEffectEvent(() => {
    searchDebounce.cancel()
    setDraftKeyword(null)
  })

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
      searchDebounce.cancel()
      onSearch(nextKeyword)
      return
    }

    searchDebounce.schedule(() => onSearch(nextKeyword))
  }

  return {
    // 검색창에 보여 줄 값, URL 반영 전 입력 중인 글자 포함
    keyword: draftKeyword ?? appliedKeyword,
    changeKeyword,
    // 필터, 정렬 등 다른 조건을 바꿀 때 입력 중인 검색어를 함께 적용하므로 대기 중인 검색 취소
    cancelPendingSearch: searchDebounce.cancel,
  }
}

export { useDebouncedSearch }
