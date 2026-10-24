import { readFileSync } from 'node:fs'

let payload

try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const toolInput = payload.tool_input ?? {}
const filePath = toolInput.file_path ?? ''
const content = toolInput.new_string ?? toolInput.content ?? toolInput.command ?? ''
const isCodeFile = /\.(ts|tsx|js|jsx)$/.test(filePath)
const isCommentCheckableFile = /\.(ts|tsx|js|jsx|css)$/.test(filePath)

if (isCodeFile && content.includes('console.log')) {
  console.error('디버그 로그를 제거하고 구조화된 오류 처리를 사용하세요.')
  process.exit(2)
}

if (isCodeFile && /:\s*any([^A-Za-z]|$)|<any>|as any/.test(content)) {
  console.error('명시적 any 대신 구체적인 타입 또는 unknown을 사용하세요.')
  process.exit(2)
}

// code-style.md: 주석은 문장형(~한다/~된다)이 아니라 명사형(~처리/~방지/~적용)으로 끝맺어야 함
if (isCommentCheckableFile) {
  const sentenceFormCommentEnding =
    /^\s*(\/\/|\/\*+|\*).*[가-힣](다|한다|된다|는다|이다|았다|었다|겠다)\.?\s*(\*\/)?\s*$/
  const offendingLine = content.split('\n').find((line) => sentenceFormCommentEnding.test(line))

  if (offendingLine) {
    console.error(
      `주석은 명사형으로 끝내세요(예: ~처리, ~방지, ~적용). 문장형으로 끝난 줄: "${offendingLine.trim()}"`,
    )
    process.exit(2)
  }
}

if (/(^|\s)(npm|yarn|npx)\s/.test(content)) {
  console.error('이 프로젝트에서는 pnpm 또는 pnpm exec만 사용하세요.')
  process.exit(2)
}

if (/tailwind\.config\./.test(filePath)) {
  console.error(
    'Tailwind CSS v4 프로젝트입니다. 명시 요청 없이는 tailwind.config 파일을 만들지 마세요.',
  )
  process.exit(2)
}
