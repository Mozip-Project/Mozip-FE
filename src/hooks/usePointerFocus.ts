import { useEffect, useState } from 'react'

// Radix가 focus()를 코드로 호출해 클릭에도 포커스 링 표시, 포인터로 누른 뒤 다음 키 입력 전까지 링 숨김 처리
function usePointerFocus() {
  const [isPointerFocus, setIsPointerFocus] = useState(false)

  useEffect(() => {
    if (!isPointerFocus) {
      return
    }

    function handleKeyDown() {
      setIsPointerFocus(false)
    }

    // 다른 핸들러가 전파를 멈춰도 해제되도록 capture 단계 구독
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isPointerFocus])

  function markPointerFocus() {
    setIsPointerFocus(true)
  }

  return { isPointerFocus, markPointerFocus }
}

export { usePointerFocus }
