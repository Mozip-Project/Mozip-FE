type NumberRange = {
  min: number
  max: number
}

function clampNumber(value: number, { min, max }: NumberRange) {
  return Math.min(Math.max(value, min), max)
}

export { clampNumber }
export type { NumberRange }
