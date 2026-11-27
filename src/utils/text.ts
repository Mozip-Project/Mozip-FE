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

// 선택 영역을 넣을 글자로 바꾸고, 넣은 글자 바로 뒤 커서 위치 반환
function insertTextAt(text: string, insertion: string, start: number, end: number) {
  // 값이 바뀌어 저장해 둔 커서가 범위를 벗어나도 끝에 넣도록 보정
  const safeStart = Math.min(Math.max(start, 0), text.length)
  const safeEnd = Math.min(Math.max(end, safeStart), text.length)

  return {
    text: text.slice(0, safeStart) + insertion + text.slice(safeEnd),
    caret: safeStart + insertion.length,
  }
}

const HANGUL_SYLLABLE_START = 0xac00
const HANGUL_SYLLABLE_COUNT = 11172
const HANGUL_FINAL_COUNT = 28
const HANGUL_FINAL_RIEUL_INDEX = 8

// 받침 없음·ㄹ 받침·한글이 아닌 끝 글자는 '로', 그 외 받침은 '으로'
function withDirectionParticle(word: string) {
  const offset = (word.trimEnd().at(-1)?.charCodeAt(0) ?? 0) - HANGUL_SYLLABLE_START
  const isHangulSyllable = offset >= 0 && offset < HANGUL_SYLLABLE_COUNT
  const finalIndex = offset % HANGUL_FINAL_COUNT
  const needsEuro = isHangulSyllable && finalIndex !== 0 && finalIndex !== HANGUL_FINAL_RIEUL_INDEX

  return `${word}${needsEuro ? '으로' : '로'}`
}

export { getTextLength, insertTextAt, trimTextBeforeCaret, withDirectionParticle }
