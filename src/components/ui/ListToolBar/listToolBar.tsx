import type { ReactNode } from 'react'

type ListToolBarProps = {
  children: ReactNode
}

function ListToolBar({ children }: ListToolBarProps) {
  return (
    <div
      data-slot="list-tool-bar"
      className="flex flex-wrap items-center gap-gap-xs border-b border-neutral-subtle py-padding-s"
    >
      {children}
    </div>
  )
}

export { ListToolBar }
