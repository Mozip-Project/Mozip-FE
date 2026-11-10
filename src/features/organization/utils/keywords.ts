function addKeyword(keywords: string[], input: string, maxCount: number) {
  const keyword = input.trim()
  const canAdd = keyword !== '' && !keywords.includes(keyword) && keywords.length < maxCount

  return canAdd ? [...keywords, keyword] : keywords
}

export { addKeyword }
