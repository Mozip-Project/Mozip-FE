import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus/saveStatus'

type EvaluationPanelHeaderProps = {
  saveState: SaveState
}

function EvaluationPanelHeader({ saveState }: EvaluationPanelHeaderProps) {
  return (
    <div className="flex min-w-60 items-center justify-between gap-gap-s">
      <h2 className="truncate text-headline1 font-semibold text-neutral">내 서류 평가</h2>
      <SaveStatus {...saveState} className="shrink-0" />
    </div>
  )
}

export { EvaluationPanelHeader }
