'use client'

import Image, { type StaticImageData } from 'next/image'
import { useRouter } from 'next/navigation'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useLayoutEffect, useState, type ReactNode } from 'react'
import meetingImage from '@/assets/images/meeting.png'
import noMeetingImage from '@/assets/images/no-meeting.png'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { getNewPostingPath } from '@/features/posting/utils/postingCreateRoute'
import { cn } from '@/lib/utils'
import { isOneOf } from '@/utils/isOneOf'

const INTERVIEW_OPTION_VALUES = ['interview', 'noInterview'] as const

type InterviewOptionValue = (typeof INTERVIEW_OPTION_VALUES)[number]

type InterviewOption = {
  hasInterview: boolean
  image: StaticImageData
  title: string
  description: string
  descriptionClassName: string
}

const INTERVIEW_OPTIONS = {
  interview: {
    hasInterview: true,
    image: meetingImage,
    title: '면접을 봐요',
    description: '면접 일정까지 한번에 정해요',
    descriptionClassName: 'text-label2',
  },
  noInterview: {
    hasInterview: false,
    image: noMeetingImage,
    title: '면접을 보지 않아요',
    description: '서류 평가만으로 합격자를 정해요',
    descriptionClassName: 'text-caption1',
  },
} satisfies Record<InterviewOptionValue, InterviewOption>

const OPTION_IMAGE_SIZE_PX = 105

type PostingStartDialogProps = {
  children: ReactNode
}

function PostingStartDialog({ children }: PostingStartDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<InterviewOptionValue | null>(null)

  // 이동 시 숨겨 보관되는 페이지(cacheComponents)로 돌아왔을 때 열린 채 남는 것 방지
  useLayoutEffect(() => {
    return () => {
      setIsOpen(false)
      setSelectedValue(null)
    }
  }, [])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setSelectedValue(null)
    }
  }

  function handleValueChange(value: string) {
    if (isOneOf(INTERVIEW_OPTION_VALUES, value)) {
      setSelectedValue(value)
    }
  }

  function handleNext() {
    if (!selectedValue) {
      return
    }
    // LNB처럼 이동 후에도 남는 위치에서 열면 정리 effect가 돌지 않아 직접 닫기
    handleOpenChange(false)
    router.push(getNewPostingPath(INTERVIEW_OPTIONS[selectedValue].hasInterview))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader
          title="새 공고를 만들어 볼까요?"
          description="먼저, 이번 모집에서 면접을 진행하시나요?"
        />
        <RadioGroupPrimitive.Root
          aria-label="면접 진행 여부"
          value={selectedValue ?? ''}
          onValueChange={handleValueChange}
          className="flex w-full gap-gap-m"
        >
          {INTERVIEW_OPTION_VALUES.map((value) => {
            const option = INTERVIEW_OPTIONS[value]

            return (
              <RadioGroupPrimitive.Item
                key={value}
                value={value}
                className={cn(
                  'flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-gap-xxs rounded-m border border-neutral-muted bg-layer-default p-padding-m transition-colors motion-reduce:transition-none',
                  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
                  'data-[state=checked]:border-brand-solid data-[state=checked]:bg-brand-weak',
                )}
              >
                <Image
                  src={option.image}
                  alt=""
                  width={OPTION_IMAGE_SIZE_PX}
                  height={OPTION_IMAGE_SIZE_PX}
                  className="size-26.25"
                />
                <span className="flex w-full flex-col gap-gap-xxs text-center break-keep">
                  <span className="text-body2 font-semibold text-neutral">{option.title}</span>
                  <span
                    className={cn('font-medium text-neutral-subtle', option.descriptionClassName)}
                  >
                    {option.description}
                  </span>
                </span>
              </RadioGroupPrimitive.Item>
            )
          })}
        </RadioGroupPrimitive.Root>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <Button disabled={!selectedValue} onClick={handleNext}>
            다음
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PostingStartDialog }
