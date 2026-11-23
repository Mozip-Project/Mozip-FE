import type { PostingContentBlock, PostingRichTextRun } from '@/features/posting/types'

// 주석 · 태그 · 글자 · 짝 없는 <, 태그 안 < 제외로 긴 입력 성능 유지
const HTML_TOKEN_PATTERN =
  /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?![a-zA-Z0-9])[^<>]*>|[^<]+|</g
// 안의 글자도 숨길 태그
const HIDDEN_CONTENT_TAGS = new Set(['script', 'style', 'template', 'textarea', 'title'])
const BOLD_TAGS = new Set(['strong', 'b'])
const ITALIC_TAGS = new Set(['em', 'i'])

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
}

const ENTITY_PATTERN = /&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi
const MAX_CODE_POINT = 0x10ffff

function decodeEntity(entity: string, name: string) {
  const lowerName = name.toLowerCase()

  if (lowerName.startsWith('#')) {
    const codePoint = lowerName.startsWith('#x')
      ? Number.parseInt(lowerName.slice(2), 16)
      : Number.parseInt(lowerName.slice(1), 10)
    return codePoint > 0 && codePoint <= MAX_CODE_POINT ? String.fromCodePoint(codePoint) : entity
  }

  return NAMED_ENTITIES[lowerName] ?? entity
}

function decodeEntities(text: string) {
  return text.replace(ENTITY_PATTERN, decodeEntity)
}

type ContentTarget =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; runs: PostingRichTextRun[] }
  | { type: 'list'; items: PostingRichTextRun[][] }

function hasText(runs: readonly PostingRichTextRun[]) {
  return runs.some(({ text }) => text.trim() !== '')
}

// Tiptap HTML의 허용 태그만 블록으로 변환, 나머지는 글자만 유지
function parsePostingContentHtml(html: string | null): PostingContentBlock[] {
  if (!html) {
    return []
  }

  const blocks: PostingContentBlock[] = []
  let target: ContentTarget | null = null
  let listItem: PostingRichTextRun[] | null = null
  let listDepth = 0
  let boldDepth = 0
  let italicDepth = 0
  // 열린 숨김 태그, 같은 이름의 닫는 태그까지 안의 태그·글자 무시
  let hiddenTag: string | null = null

  function closeTarget() {
    if (target?.type === 'heading' && target.text.trim() !== '') {
      blocks.push({ type: 'heading', text: target.text.trim() })
    }
    if (target?.type === 'paragraph' && hasText(target.runs)) {
      blocks.push(target)
    }
    if (target?.type === 'list') {
      closeListItem()
      if (target.items.length > 0) {
        blocks.push(target)
      }
    }
    target = null
    listDepth = 0
  }

  function closeListItem() {
    if (target?.type === 'list' && listItem && hasText(listItem)) {
      target.items.push(listItem)
    }
    listItem = null
  }

  function appendText(text: string) {
    if (target?.type === 'heading') {
      target.text += text
      return
    }

    const run: PostingRichTextRun = { text }
    if (boldDepth > 0) {
      run.isBold = true
    }
    if (italicDepth > 0) {
      run.isItalic = true
    }

    if (target?.type === 'list') {
      listItem ??= []
      listItem.push(run)
      return
    }

    if (target === null) {
      target = { type: 'paragraph', runs: [] }
    }
    target.runs.push(run)
  }

  function handleOpenTag(tag: string) {
    switch (tag) {
      case 'h2':
      case 'p':
        // 목록 항목 안 문단·제목은 줄바꿈
        if (target?.type === 'list') {
          if (listItem && hasText(listItem)) {
            appendText('\n')
          }
          return
        }
        closeTarget()
        target = tag === 'h2' ? { type: 'heading', text: '' } : { type: 'paragraph', runs: [] }
        return
      case 'ul':
        // 중첩 목록은 한 단계로
        if (target?.type !== 'list') {
          closeTarget()
          target = { type: 'list', items: [] }
        }
        listDepth += 1
        return
      case 'li':
        closeListItem()
        return
      case 'br':
        appendText('\n')
        return
    }
  }

  function handleCloseTag(tag: string) {
    switch (tag) {
      case 'h2':
      case 'p':
        if (target?.type !== 'list') {
          closeTarget()
        }
        return
      case 'li':
        closeListItem()
        return
      case 'ul':
        listDepth -= 1
        if (listDepth <= 0) {
          closeTarget()
        }
        return
    }
  }

  function handleText(token: string) {
    // 원문 줄바꿈은 공백, 블록 사이 공백은 버림
    const text = decodeEntities(token).replace(/[\r\n\t]+/g, ' ')
    if (target === null && text.trim() === '') {
      return
    }
    appendText(text)
  }

  for (const [token, closingSlash, tagName] of html.matchAll(HTML_TOKEN_PATTERN)) {
    if (token.startsWith('<!--')) {
      continue
    }

    if (tagName === undefined) {
      if (hiddenTag === null) {
        handleText(token)
      }
      continue
    }

    const tag = tagName.toLowerCase()
    const isClosing = closingSlash === '/'

    if (hiddenTag !== null) {
      if (isClosing && tag === hiddenTag) {
        hiddenTag = null
      }
      continue
    }
    if (HIDDEN_CONTENT_TAGS.has(tag)) {
      if (!isClosing) {
        hiddenTag = tag
      }
      continue
    }

    if (BOLD_TAGS.has(tag)) {
      boldDepth = Math.max(0, boldDepth + (isClosing ? -1 : 1))
      continue
    }
    if (ITALIC_TAGS.has(tag)) {
      italicDepth = Math.max(0, italicDepth + (isClosing ? -1 : 1))
      continue
    }

    if (isClosing) {
      handleCloseTag(tag)
    } else {
      handleOpenTag(tag)
    }
  }

  closeTarget()
  return blocks
}

export { parsePostingContentHtml }
