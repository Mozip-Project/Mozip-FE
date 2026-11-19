import { useEffect } from 'react'

type CachedUrl = { url: string; users: number }

// 같은 파일은 URL 하나를 공유, 쓰는 화면이 모두 사라진 뒤에만 해제
const urlCache = new Map<Blob, CachedUrl>()

function getCachedUrl(file: Blob) {
  const cached = urlCache.get(file) ?? { url: URL.createObjectURL(file), users: 0 }
  urlCache.set(file, cached)
  return cached
}

function releaseUrl(file: Blob, cached: CachedUrl) {
  cached.users -= 1
  // StrictMode·Activity처럼 정리 직후 다시 붙는 경우 해제 보류
  setTimeout(() => {
    if (cached.users === 0 && urlCache.get(file) === cached) {
      URL.revokeObjectURL(cached.url)
      urlCache.delete(file)
    }
  })
}

function useObjectUrl(file: Blob | null) {
  const url = file ? getCachedUrl(file).url : null

  useEffect(() => {
    if (!file) {
      return
    }
    const cached = getCachedUrl(file)
    cached.users += 1

    return () => releaseUrl(file, cached)
  }, [file])

  return url
}

export { useObjectUrl }
