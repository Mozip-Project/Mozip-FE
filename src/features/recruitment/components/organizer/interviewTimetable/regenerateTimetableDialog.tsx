import RefreshIcon from '@/assets/icons/refresh.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'

function RegenerateTimetableDialog({ onRegenerate }: { onRegenerate: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="m">
          <RefreshIcon aria-hidden />
          다시 생성하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          title="타임테이블을 다시 생성할까요?"
          description={
            <>
              직접 배정하거나 옮긴 칸, 추가한 면접관이
              <br />
              모두 사라지고 처음부터 다시 배정돼요.
            </>
          }
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="critical" onClick={onRegenerate}>
              다시 생성하기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RegenerateTimetableDialog }
