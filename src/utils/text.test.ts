import { describe, expect, it } from 'vitest'
import { getTextLength, insertTextAt, trimTextBeforeCaret } from './text'

describe('insertTextAt', () => {
  it('커서 위치에 넣고 넣은 글자 뒤로 커서 이동', () => {
    expect(insertTextAt('안녕하세요', '{이름}', 2, 2)).toEqual({
      text: '안녕{이름}하세요',
      caret: 6,
    })
  })

  it('선택 영역이 있으면 그 부분을 바꿈', () => {
    expect(insertTextAt('안녕하세요', '{이름}', 0, 2)).toEqual({ text: '{이름}하세요', caret: 4 })
  })

  it('커서가 글자 수보다 뒤에 있으면 끝에 넣음', () => {
    expect(insertTextAt('안녕', '{이름}', 10, 10)).toEqual({ text: '안녕{이름}', caret: 6 })
  })
})

describe('getTextLength', () => {
  it('빈 문자열은 0자', () => {
    expect(getTextLength('')).toBe(0)
  })

  it('공백과 \\n 줄바꿈 포함 계산', () => {
    expect(getTextLength('가 나\n다')).toBe(5)
  })

  it('\\r\\n과 \\r 줄바꿈을 한 글자로 계산', () => {
    expect(getTextLength('가\r\n나')).toBe(3)
    expect(getTextLength('가\r나')).toBe(3)
  })

  it('이모지를 한 글자로 계산', () => {
    expect(getTextLength('좋아요👍')).toBe(4)
    expect(getTextLength('👨‍👩‍👧')).toBe(1)
    expect(getTextLength('👍🏽')).toBe(1)
  })
})

describe('trimTextBeforeCaret', () => {
  it('한도 이내면 그대로 유지', () => {
    expect(trimTextBeforeCaret('가나', 2, 3)).toEqual({ text: '가나', caret: 2 })
  })

  it('끝에서 입력한 초과분 제거', () => {
    expect(trimTextBeforeCaret('가나다라', 4, 3)).toEqual({ text: '가나다', caret: 3 })
  })

  it('중간에 입력한 초과분만 제거하고 커서 뒤 글자 유지', () => {
    // '가나다' 사이(1번 위치)에 'XY' 입력
    expect(trimTextBeforeCaret('가XY나다', 3, 4)).toEqual({ text: '가X나다', caret: 2 })
  })

  it('이모지를 쪼개지 않고 글자 단위로 제거', () => {
    expect(trimTextBeforeCaret('👍👍👍', 6, 2)).toEqual({ text: '👍👍', caret: 4 })
  })

  it('커서가 결합 문자 사이에 있어도 전체 글자 수가 한도 이내면 유지', () => {
    // 결합 악센트(U+0301) 앞에 'e'를 입력해 'é' 한 글자가 된 상태
    const text = 'é'

    expect(trimTextBeforeCaret(text, 1, 1)).toEqual({ text, caret: 1 })
  })
})
