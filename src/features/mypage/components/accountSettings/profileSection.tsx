import Link from 'next/link'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'

type ProfileSectionProps = {
  name: string
  maskedPhone: string
}

function ProfileSection({ name, maskedPhone }: ProfileSectionProps) {
  return (
    <section className="flex flex-col gap-gap-l py-padding-m">
      <h2 className="text-headline1 font-semibold text-neutral">프로필</h2>
      <div className="flex items-center justify-between gap-gap-l">
        <div className="flex min-w-0 items-center gap-gap-l">
          <Avatar size={72} />
          <div className="flex min-w-0 flex-col gap-gap-xxs break-words text-neutral">
            <p className="text-headline2 font-semibold">{name}</p>
            <p className="text-body2">{maskedPhone}</p>
          </div>
        </div>
        <Link
          href="/manage/mypage/edit"
          aria-label="정보 수정"
          className="shrink-0 rounded-s text-gray-500 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          <ChevronRightIcon aria-hidden className="size-8" />
        </Link>
      </div>
    </section>
  )
}

export { ProfileSection }
