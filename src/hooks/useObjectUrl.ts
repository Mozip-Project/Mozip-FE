import { useEffect, useMemo } from 'react'

// 파일이 바뀌거나 화면을 떠날 때 이전 blob URL 메모리 해제
function useObjectUrl(file: Blob | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [url])

  return url
}

export { useObjectUrl }
