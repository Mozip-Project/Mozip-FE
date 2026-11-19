type TextAnswerPreviewProps = {
  maxLength: number
}

function TextAnswerPreview({ maxLength }: TextAnswerPreviewProps) {
  return (
    <>
      <p className="text-body2 font-normal text-placeholder">지원자 답변이 여기에 표시돼요</p>
      <p className="flex justify-end text-caption1">
        <span className="font-semibold text-neutral-muted">0</span>
        <span className="font-medium text-disabled">/{maxLength}자</span>
      </p>
    </>
  )
}

export { TextAnswerPreview }
