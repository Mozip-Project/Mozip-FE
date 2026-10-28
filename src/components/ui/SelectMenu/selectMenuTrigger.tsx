import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { Button } from '@/components/ui/Button/button'
import { DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'

type SelectMenuTriggerProps = {
  label: string
  children: string
}

function SelectMenuTrigger({ label, children }: SelectMenuTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="tertiary" size="s">
        <span className="sr-only">{label} </span>
        {children}
        <ChevronDownIcon aria-hidden />
      </Button>
    </DropdownMenuTrigger>
  )
}

export { SelectMenuTrigger }
