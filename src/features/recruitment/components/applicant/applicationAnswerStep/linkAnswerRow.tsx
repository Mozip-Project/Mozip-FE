'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { toWebUrl } from '@/utils/url'
import { AttachmentRow } from './attachmentRow'

type LinkAnswerRowProps = {
  url: string
  onChange: (url: string) => void
  onRemove: () => void
}

// 잘못된 주소 줄은 눌러서 그 자리에서 수정, Enter·벗어나기로 반영하고 Esc로 취소
function LinkAnswerRow({ url, onChange, onRemove }: LinkAnswerRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(url)
  const rowRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // 키로 끝낸 뒤 입력칸이 사라질 때 생기는 blur의 중복 반영 방지
  const isFinishedByKeyRef = useRef(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      return
    }
    // 키보드로 끝내면 입력칸이 사라져도 같은 줄 버튼에 포커스 유지
    if (isFinishedByKeyRef.current) {
      rowRef.current?.querySelector('button')?.focus()
    }
  }, [isEditing])

  function startEditing() {
    isFinishedByKeyRef.current = false
    setDraft(url)
    setIsEditing(true)
  }

  function commit() {
    const nextUrl = draft.trim()

    setIsEditing(false)
    if (!nextUrl) {
      onRemove()
      return
    }
    if (nextUrl !== url) {
      onChange(nextUrl)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 한글 조합 중 Enter는 조합 확정이라 반영하지 않음
    if (event.nativeEvent.isComposing) {
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      isFinishedByKeyRef.current = true
      commit()
    } else if (event.key === 'Escape') {
      isFinishedByKeyRef.current = true
      setIsEditing(false)
    }
  }

  function handleBlur() {
    // 다른 탭으로 주소를 복사하러 갈 때는 수정 상태 유지
    if (isFinishedByKeyRef.current || !document.hasFocus()) {
      return
    }
    commit()
  }

  if (isEditing) {
    return (
      <div
        ref={rowRef}
        className="flex h-13 items-center rounded-[10px] border border-neutral-solid bg-layer-default px-padding-m"
      >
        <input
          ref={inputRef}
          // type="url"은 폼 제출 시 브라우저 검증 창이 떠서 text + inputMode 사용
          type="text"
          inputMode="url"
          aria-label="링크 주소 수정"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="min-w-0 flex-1 bg-transparent text-label1 font-medium text-neutral outline-none"
        />
      </div>
    )
  }

  return (
    <div ref={rowRef}>
      {toWebUrl(url) ? (
        <AttachmentRow name={url} status="default" onRemove={onRemove} />
      ) : (
        <AttachmentRow
          name={url}
          status="error"
          errorMessage="잘못된 주소입니다"
          onEdit={startEditing}
          onRemove={onRemove}
        />
      )}
    </div>
  )
}

export { LinkAnswerRow }
