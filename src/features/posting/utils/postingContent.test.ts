import { describe, expect, it } from 'vitest'
import { parsePostingContentHtml } from './postingContent'

describe('parsePostingContentHtml', () => {
  it('비어 있으면 빈 목록', () => {
    expect(parsePostingContentHtml(null)).toEqual([])
    expect(parsePostingContentHtml('')).toEqual([])
  })

  it('Tiptap 제목·문단·목록을 블록으로 변환', () => {
    const html =
      '<h2>이런 활동을 해요</h2><p>매주 목요일 정기 세션</p><ul><li><p>팀 프로젝트</p></li><li><p>데모데이</p></li></ul>'

    expect(parsePostingContentHtml(html)).toEqual([
      { type: 'heading', text: '이런 활동을 해요' },
      { type: 'paragraph', runs: [{ text: '매주 목요일 정기 세션' }] },
      { type: 'list', items: [[{ text: '팀 프로젝트' }], [{ text: '데모데이' }]] },
    ])
  })

  it('굵게·기울임은 겹쳐도 글자별로 표시', () => {
    expect(
      parsePostingContentHtml(
        '<p><strong>정기 세션</strong> 매주 <strong><em>목요일</em></strong></p>',
      ),
    ).toEqual([
      {
        type: 'paragraph',
        runs: [
          { text: '정기 세션', isBold: true },
          { text: ' 매주 ' },
          { text: '목요일', isBold: true, isItalic: true },
        ],
      },
    ])
  })

  it('br은 줄바꿈 글자로 변환', () => {
    expect(parsePostingContentHtml('<p>첫 줄<br>둘째 줄</p>')).toEqual([
      { type: 'paragraph', runs: [{ text: '첫 줄' }, { text: '\n' }, { text: '둘째 줄' }] },
    ])
  })

  it('HTML 문자 참조를 글자로 변환', () => {
    expect(parsePostingContentHtml('<p>A &amp; B &lt;C&gt; &#39;D&#x27;&nbsp;</p>')).toEqual([
      { type: 'paragraph', runs: [{ text: "A & B <C> 'D' " }] },
    ])
  })

  it('허용하지 않은 태그는 버리고 글자만 유지', () => {
    expect(
      parsePostingContentHtml('<p><a href="javascript:alert(1)" onclick="x()">링크</a> 글자</p>'),
    ).toEqual([{ type: 'paragraph', runs: [{ text: '링크' }, { text: ' 글자' }] }])
  })

  it('script·style 안의 글자는 표시하지 않음', () => {
    expect(
      parsePostingContentHtml('<p>앞</p><script>alert(1)</script><style>p{}</style><p>뒤</p>'),
    ).toEqual([
      { type: 'paragraph', runs: [{ text: '앞' }] },
      { type: 'paragraph', runs: [{ text: '뒤' }] },
    ])
  })

  it('빈 문단과 블록 사이 공백은 생략', () => {
    expect(parsePostingContentHtml('<p></p>\n<h2>제목</h2>\n<p> </p>')).toEqual([
      { type: 'heading', text: '제목' },
    ])
  })

  it('중첩 목록은 한 단계로 펼치고 목록 뒤 글자는 새 문단', () => {
    const html = '<ul><li><p>상위</p><ul><li><p>하위</p></li></ul></li></ul>목록 뒤'

    expect(parsePostingContentHtml(html)).toEqual([
      { type: 'list', items: [[{ text: '상위' }], [{ text: '하위' }]] },
      { type: 'paragraph', runs: [{ text: '목록 뒤' }] },
    ])
  })

  it('목록 항목 안 여러 문단은 줄바꿈으로 연결', () => {
    expect(parsePostingContentHtml('<ul><li><p>첫 문단</p><p>둘째 문단</p></li></ul>')).toEqual([
      { type: 'list', items: [[{ text: '첫 문단' }, { text: '\n' }, { text: '둘째 문단' }]] },
    ])
  })

  it('태그가 되지 못한 <는 글자로 유지', () => {
    expect(parsePostingContentHtml('<p>1 < 2</p>')).toEqual([
      { type: 'paragraph', runs: [{ text: '1 ' }, { text: '<' }, { text: ' 2' }] },
    ])
  })

  it('목록 항목 안 제목은 목록을 끊지 않고 줄바꿈', () => {
    expect(
      parsePostingContentHtml(
        '<ul><li><h2>제목</h2><p>내용</p></li><li><p>다음 항목</p></li></ul>',
      ),
    ).toEqual([
      {
        type: 'list',
        items: [[{ text: '제목' }, { text: '\n' }, { text: '내용' }], [{ text: '다음 항목' }]],
      },
    ])
  })

  it('닫히지 않은 태그가 길게 이어져도 바로 처리', () => {
    const html = `<${'a'.repeat(100_000)}`
    const [block] = parsePostingContentHtml(html)

    expect(block?.type === 'paragraph' && block.runs.map(({ text }) => text).join('')).toBe(html)
  })

  it('script 안의 <가 뒤 본문을 숨기지 않음', () => {
    expect(parsePostingContentHtml('<script>if(a<b) x</script><p>뒤</p>')).toEqual([
      { type: 'paragraph', runs: [{ text: '뒤' }] },
    ])
  })
})
