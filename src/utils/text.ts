// 이모지·결합 문자·\r\n을 화면에 보이는 한 글자 단위로 분리
const graphemeSegmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' })

function splitGraphemes(text: string) {
  return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment)
}

function getTextLength(text: string) {
  return splitGraphemes(text).length
}

function trimTextBeforeCaret(text: string, caret: number, maxLength: number) {
  // 커서가 결합 문자 사이면 앞뒤를 따로 셀 때 한 글자가 둘로 세져 전체 기준으로 먼저 확인
  if (getTextLength(text) <= maxLength) {
    return { text, caret }
  }

  const before = text.slice(0, caret)
  const after = text.slice(caret)
  const allowedBeforeLength = Math.max(maxLength - getTextLength(after), 0)
  const trimmedBefore = splitGraphemes(before).slice(0, allowedBeforeLength).join('')

  return { text: trimmedBefore + after, caret: trimmedBefore.length }
}

export { getTextLength, trimTextBeforeCaret }
