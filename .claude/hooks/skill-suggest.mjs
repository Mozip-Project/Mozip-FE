import { readFileSync } from 'node:fs'

let payload

try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const prompt = payload.prompt ?? ''
const lowerPrompt = prompt.toLowerCase()
const suggestions = []

const rules = [
  [/commit|staged|커밋/, '/commit - 한국어 커밋 메시지 제안'],
  [/\bpr\b|pull request|풀리퀘스트/, '/pr - PR 제목과 본문 초안'],
  [/refactor|cleanup|dedupe|simplify|리팩터링|정리/, '/refactor - 동작 변경 없는 리팩터링'],
  [/review|리뷰/, '/review - 변경 코드 리뷰'],
  [/performance|성능|lighthouse|lcp/, '/performance-audit - 이미지·Client bundle·렌더링 성능 점검'],
  [/figma|피그마|디자인/, '/figma-screen - Figma 디자인을 화면으로 구현'],
]

for (const [pattern, suggestion] of rules) {
  if (pattern.test(lowerPrompt)) {
    suggestions.push(suggestion)
  }
}

if (suggestions.length > 0) {
  console.log(`추천 local skill:\n${suggestions.map((item) => `- ${item}`).join('\n')}`)
}
